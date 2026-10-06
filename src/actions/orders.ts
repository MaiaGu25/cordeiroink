"use server";

import { prisma } from "@/lib/prisma";
import { OrderStatus, SalesChannel, JobPriority, RawItemType } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getOrders(filter?: {
  channel?: string;
  status?: string;
  search?: string;
}) {
  const where: any = {};

  if (filter?.channel && filter.channel !== "ALL") {
    where.channel = filter.channel as SalesChannel;
  }

  if (filter?.status && filter.status !== "ALL") {
    where.status = filter.status as OrderStatus;
  }

  if (filter?.search) {
    const s = filter.search.toLowerCase();
    where.OR = [
      { orderNumber: { contains: s } },
      { customerName: { contains: s } },
      { customerEmail: { contains: s } },
    ];
  }

  return await prisma.order.findMany({
    where,
    include: {
      items: {
        include: {
          blankShirt: true,
          dtfPrint: true,
          packaging: true,
          variant: {
            include: {
              product: true,
            },
          },
        },
      },
      productionJob: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderById(id: string) {
  return await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          blankShirt: true,
          dtfPrint: true,
          packaging: true,
          variant: {
            include: {
              product: true,
              bom: {
                include: {
                  rawItem: true,
                },
              },
            },
          },
        },
      },
      productionJob: true,
    },
  });
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { productionJob: true },
  });

  if (!order) throw new Error("Pedido não encontrado");

  // Se o pedido passar para PAID ou WAITING_PRODUCTION e não tiver productionJob, cria o job
  if (
    (status === OrderStatus.PAID || status === OrderStatus.WAITING_PRODUCTION) &&
    !order.productionJob
  ) {
    await prisma.productionJob.create({
      data: {
        orderId: order.id,
        priority: JobPriority.NORMAL,
      },
    });
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      paidAt: status === OrderStatus.PAID && !order.paidAt ? new Date() : order.paidAt,
      shippedAt: status === OrderStatus.SHIPPED ? new Date() : order.shippedAt,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "ORDER_STATUS_CHANGED",
      entity: "Order",
      entityId: orderId,
      oldPayload: JSON.stringify({ status: order.status }),
      newPayload: JSON.stringify({ status }),
    },
  });

  revalidatePath("/pedidos");
  revalidatePath("/producao");
  revalidatePath("/");
  return updated;
}

export async function createManualOrder(data: {
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  shippingAddress?: string;
  channel?: SalesChannel;
  itemTitle: string;
  blankShirtId?: string;
  dtfPrintId?: string;
  dtfCost?: number;
  packagingId?: string;
  artTitle?: string;
  artUrl?: string;
  printSize?: string;
  saveToDtfCatalog?: boolean;
  quantity: number;
  unitPrice: number;
  shippingCost?: number;
  notes?: string;
}) {
  // 1. Busca os insumos reais consumidos para calcular o custo unitário na hora
  let shirtCost = 0;
  let shirtModel = "";
  let shirtColor = "";
  let shirtSize = "";

  if (data.blankShirtId && data.blankShirtId !== "none") {
    const shirt = await prisma.rawItem.findUnique({
      where: { id: data.blankShirtId },
    });
    if (shirt) {
      shirtCost = shirt.costPrice;
      shirtModel = shirt.shirtModel || "";
      shirtColor = shirt.shirtColor || "";
      shirtSize = shirt.shirtSize || "";
    }
  }

  let dtfCost = typeof data.dtfCost === "number" && !isNaN(data.dtfCost) ? data.dtfCost : 0;
  if (dtfCost === 0 && data.dtfPrintId && data.dtfPrintId !== "none") {
    const dtf = await prisma.rawItem.findUnique({
      where: { id: data.dtfPrintId },
    });
    if (dtf) {
      dtfCost = dtf.costPrice;
    }
  }

  let packCost = 0;
  if (data.packagingId && data.packagingId !== "none") {
    const pack = await prisma.rawItem.findUnique({
      where: { id: data.packagingId },
    });
    if (pack) {
      packCost = pack.costPrice;
    }
  }

  // Se o usuário marcou para salvar a arte no banco de estampas, cadastra agora
  let finalDtfId = data.dtfPrintId;
  if (data.saveToDtfCatalog && data.artTitle && !data.dtfPrintId) {
    const count = await prisma.rawItem.count({ where: { type: RawItemType.DTF_PRINT } });
    const code = `ART-CUSTOM-${100 + count}`;
    const newDtf = await prisma.rawItem.create({
      data: {
        sku: `RAW-DTF-${code}`,
        name: data.artTitle,
        type: RawItemType.DTF_PRINT,
        dtfCode: code,
        dtfPreviewUrl: data.artUrl,
        dtfPrintSize: data.printSize || "A3 (30x42cm)",
        dtfSupplier: "Birô DTF Express",
        costPrice: data.printSize === "A4 (21x30cm)" ? 9.50 : data.printSize === "Bolso" ? 4.50 : 13.90,
        stockQuantity: 0,
        minStock: 5,
      },
    });
    finalDtfId = newDtf.id;
    dtfCost = newDtf.costPrice;
  }

  const unitCost = shirtCost + dtfCost + packCost;
  const quantity = Math.max(1, data.quantity || 1);
  const totalProducts = data.unitPrice * quantity;
  const shippingCost = data.shippingCost || 0;
  const channel = data.channel || SalesChannel.MANUAL;

  // Cálculo da comissão do canal caso venha de marketplace
  let platformFee = 0;
  if (channel === SalesChannel.SHOPEE) platformFee = totalProducts * 0.20 + 4.0;
  else if (channel === SalesChannel.SHEIN) platformFee = totalProducts * 0.18;
  else if (channel === SalesChannel.TIKTOK) platformFee = totalProducts * 0.15;

  const netAmount = totalProducts - platformFee;
  const estimatedCMV = unitCost * quantity;
  const netProfit = netAmount - estimatedCMV;

  const countOrders = await prisma.order.count();
  const orderNumber =
    channel === SalesChannel.MANUAL
      ? `CI-ENCOMENDA-${1001 + countOrders}`
      : `${channel.substring(0, 3)}-${1001 + countOrders}`;

  const order = await prisma.order.create({
    data: {
      orderNumber,
      channel,
      status: OrderStatus.PAID,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      shippingAddress: data.shippingAddress,
      totalProducts,
      shippingCost,
      platformFee,
      netAmount,
      estimatedCMV,
      netProfit,
      notes: data.notes,
      paidAt: new Date(),
      items: {
        create: [
          {
            title: data.itemTitle,
            shirtModel: shirtModel || undefined,
            shirtColor: shirtColor || undefined,
            shirtSize: shirtSize || undefined,
            artTitle: data.artTitle || undefined,
            artMockupUrl: data.artUrl || undefined,
            printSize: data.printSize || undefined,
            blankShirtId: data.blankShirtId || undefined,
            dtfPrintId: finalDtfId || undefined,
            packagingId: data.packagingId || undefined,
            quantity,
            unitPrice: data.unitPrice,
            unitCost,
            total: totalProducts,
          },
        ],
      },
      productionJob: {
        create: {
          priority: JobPriority.NORMAL,
          notes: data.artTitle
            ? `Estampa: ${data.artTitle} (${data.printSize || "A3"}). Arte: ${data.artUrl || "Ver anexo"}`
            : "Arte personalizada sob encomenda.",
        },
      },
    },
  });

  // Registra no financeiro se for receita
  await prisma.financialTransaction.create({
    data: {
      type: "INCOME",
      category: "SALES_ORDER",
      amount: netAmount,
      description: `Venda ${orderNumber} - ${data.customerName} (${data.itemTitle})`,
      orderId: order.id,
    },
  });

  revalidatePath("/pedidos");
  revalidatePath("/producao");
  revalidatePath("/estoque");
  revalidatePath("/financeiro");
  revalidatePath("/");

  return order;
}
