"use server";

import { prisma } from "@/lib/prisma";
import { OrderStatus, SalesChannel, JobPriority } from "@prisma/client";
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
  variantId: string;
  quantity: number;
  unitPrice: number;
  shippingCost?: number;
  notes?: string;
}) {
  const variant = await prisma.productVariant.findUnique({
    where: { id: data.variantId },
    include: {
      bom: {
        include: {
          rawItem: true,
        },
      },
    },
  });

  if (!variant) throw new Error("Variante não encontrada");

  // Calcula custo estimado pelo BOM
  const unitCost = variant.bom.reduce((acc, item) => {
    return acc + item.rawItem.costPrice * item.quantity;
  }, 0);

  const totalProducts = data.unitPrice * data.quantity;
  const shippingCost = data.shippingCost || 0;
  const platformFee = 0; // Venda manual / direta Pix sem comissão de marketplace!
  const netAmount = totalProducts;
  const estimatedCMV = unitCost * data.quantity;
  const netProfit = netAmount - estimatedCMV;

  const count = await prisma.order.count();
  const orderNumber = `CI-DIR-${1050 + count}`;

  const order = await prisma.order.create({
    data: {
      orderNumber,
      channel: SalesChannel.MANUAL,
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
            variantId: variant.id,
            quantity: data.quantity,
            unitPrice: data.unitPrice,
            unitCost,
            total: totalProducts,
          },
        ],
      },
      productionJob: {
        create: {
          priority: JobPriority.NORMAL,
          notes: "Pedido de Venda Direta WhatsApp. Produção autorizada.",
        },
      },
    },
  });

  // Registra transação financeira correspondente
  await prisma.financialTransaction.create({
    data: {
      type: "INCOME",
      category: "SALES_ORDER",
      amount: netAmount,
      description: `Venda Direta ${orderNumber} - ${data.customerName}`,
      orderId: order.id,
    },
  });

  revalidatePath("/pedidos");
  revalidatePath("/producao");
  revalidatePath("/financeiro");
  revalidatePath("/");
  return order;
}
