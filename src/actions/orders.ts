"use server";

import { prisma } from "@/lib/prisma";
import { OrderStatus, SalesChannel, JobPriority, RawItemType, TransactionType, TransactionCategory } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";

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
      auditLogs: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getHistoricalOrders(filter?: {
  channel?: string;
  search?: string;
  status?: string;
}) {
  const where: any = {
    status: {
      in: [
        OrderStatus.READY,
        OrderStatus.SHIPPED,
        OrderStatus.DELIVERED,
        OrderStatus.CANCELLED,
      ],
    },
  };

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
      financialTx: true,
      auditLogs: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { updatedAt: "desc" },
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
      financialTx: true,
      auditLogs: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const user = await getCurrentUser();
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
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      orderId: orderId,
      action: "ORDER_STATUS_CHANGED",
      entity: "Order",
      entityId: orderId,
      details: `Status alterado de ${order.status} para ${status} por ${user.name}`,
      oldPayload: JSON.stringify({ status: order.status }),
      newPayload: JSON.stringify({ status, updatedBy: user.name }),
    },
  });

  revalidatePath("/pedidos");
  revalidatePath("/producao");
  revalidatePath("/historico");
  revalidatePath("/");
  return updated;
}

export async function cancelOrder(orderId: string, reason: string) {
  if (!reason || !reason.trim()) {
    throw new Error("O motivo do cancelamento é obrigatório para auditoria.");
  }

  const user = await getCurrentUser();
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      productionJob: true,
      financialTx: true,
    },
  });

  if (!order) throw new Error("Pedido não encontrado");
  if (order.status === OrderStatus.CANCELLED) {
    throw new Error("Este pedido já foi cancelado anteriormente.");
  }

  // 1. Regra Estrita de Devolução de Estoque:
  // Se os insumos já foram baixados (produção concluída), devolve cada insumo ao estoque físico
  const hadDeductedStock = order.productionJob?.stockDeducted === true;
  if (hadDeductedStock) {
    for (const item of order.items) {
      if (item.blankShirtId) {
        await prisma.rawItem.update({
          where: { id: item.blankShirtId },
          data: {
            stockQuantity: {
              increment: item.quantity,
            },
          },
        });
      }

      if (item.dtfPrintId) {
        await prisma.rawItem.update({
          where: { id: item.dtfPrintId },
          data: {
            stockQuantity: {
              increment: item.quantity,
            },
          },
        });
      }

      if (item.packagingId) {
        await prisma.rawItem.update({
          where: { id: item.packagingId },
          data: {
            stockQuantity: {
              increment: item.quantity,
            },
          },
        });
      }
    }

    if (order.productionJob) {
      await prisma.productionJob.update({
        where: { id: order.productionJob.id },
        data: {
          stockDeducted: false,
        },
      });
    }
  }

  // 2. Regra Financeira: Estorno / Lançamento de despesa para abater o lucro do mês
  const refundAmount = order.totalProducts + order.shippingCost;
  if (refundAmount > 0) {
    await prisma.financialTransaction.create({
      data: {
        type: TransactionType.EXPENSE,
        category: TransactionCategory.SALES_ORDER,
        amount: refundAmount,
        description: `Estorno de Pedido Cancelado ${order.orderNumber} - Motivo: ${reason}`,
        orderId: order.id,
      },
    });
  }

  // 3. Atualiza o status do pedido para CANCELLED com metadados
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: OrderStatus.CANCELLED,
      cancelledAt: new Date(),
      cancelReason: reason.trim(),
      cancelledBy: user.name || user.email,
    },
  });

  // 4. Registro no AuditLog
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      orderId: order.id,
      action: "ORDER_CANCELLED",
      entity: "Order",
      entityId: order.id,
      details: `Pedido cancelado por ${user.name}. Motivo: "${reason}".${
        hadDeductedStock ? " Insumos devolvidos ao estoque físico." : ""
      }`,
      oldPayload: JSON.stringify({ status: order.status }),
      newPayload: JSON.stringify({
        status: OrderStatus.CANCELLED,
        cancelReason: reason,
        cancelledBy: user.name,
        refundAmount,
        hadDeductedStock,
      }),
    },
  });

  revalidatePath("/pedidos");
  revalidatePath("/producao");
  revalidatePath("/estoque");
  revalidatePath("/financeiro");
  revalidatePath("/historico");
  revalidatePath("/");

  return updatedOrder;
}

export async function editOrder(data: {
  orderId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  shippingAddress?: string;
  paymentMethod?: string;
  notes?: string;
  itemTitle?: string;
  unitPrice?: number;
  printSize?: string;
}) {
  const user = await getCurrentUser();
  const order = await prisma.order.findUnique({
    where: { id: data.orderId },
    include: { items: true },
  });

  if (!order) throw new Error("Pedido não encontrado");
  if (order.status === OrderStatus.CANCELLED) {
    throw new Error("Não é possível editar um pedido cancelado.");
  }

  const firstItem = order.items[0];
  const unitPrice = typeof data.unitPrice === "number" && !isNaN(data.unitPrice) ? data.unitPrice : firstItem?.unitPrice || 0;
  const quantity = firstItem?.quantity || 1;
  const totalProducts = unitPrice * quantity;

  // Recalcula taxas se mudou preço
  let platformFee = order.platformFee;
  if (data.unitPrice !== undefined && data.unitPrice !== firstItem?.unitPrice) {
    if (order.channel === SalesChannel.SHOPEE) platformFee = totalProducts * 0.20 + 4.0;
    else if (order.channel === SalesChannel.SHEIN) platformFee = totalProducts * 0.18;
    else if (order.channel === SalesChannel.TIKTOK) platformFee = totalProducts * 0.15;
    else platformFee = 0;
  }

  const netAmount = totalProducts - platformFee;
  const netProfit = netAmount - order.estimatedCMV;

  const updatedOrder = await prisma.order.update({
    where: { id: data.orderId },
    data: {
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      shippingAddress: data.shippingAddress,
      paymentMethod: data.paymentMethod,
      notes: data.notes,
      totalProducts,
      platformFee,
      netAmount,
      netProfit,
    },
  });

  if (firstItem) {
    await prisma.orderItem.update({
      where: { id: firstItem.id },
      data: {
        title: data.itemTitle || firstItem.title,
        unitPrice,
        total: totalProducts,
        printSize: data.printSize || firstItem.printSize,
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      orderId: order.id,
      action: "ORDER_UPDATED",
      entity: "Order",
      entityId: order.id,
      details: `Dados do pedido ${order.orderNumber} atualizados por ${user.name}`,
      newPayload: JSON.stringify({
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        totalProducts,
        notes: data.notes,
      }),
    },
  });

  revalidatePath("/pedidos");
  revalidatePath("/producao");
  revalidatePath("/financeiro");
  revalidatePath("/historico");
  revalidatePath("/");

  return updatedOrder;
}

export async function createManualOrder(data: {
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  shippingAddress?: string;
  channel?: SalesChannel;
  paymentMethod?: string;
  isPaid?: boolean;
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
        costPrice: dtfCost || (data.printSize === "A4 (21x30cm)" ? 9.50 : data.printSize === "Bolso" ? 4.50 : 13.90),
        stockQuantity: 0,
        minStock: 5,
      },
    });
    finalDtfId = newDtf.id;
  }

  const unitCost = shirtCost + dtfCost + packCost;
  const quantity = Math.max(1, data.quantity || 1);
  const totalProducts = data.unitPrice * quantity;
  const shippingCost = data.shippingCost || 0;
  const channel = data.channel || SalesChannel.WHATSAPP;
  const isPaid = data.isPaid !== false; // Padrão: Pago

  // Taxas de canal
  let platformFee = 0;
  if (channel === SalesChannel.SHOPEE) platformFee = totalProducts * 0.20 + 4.0;
  else if (channel === SalesChannel.SHEIN) platformFee = totalProducts * 0.18;
  else if (channel === SalesChannel.TIKTOK) platformFee = totalProducts * 0.15;

  const netAmount = totalProducts - platformFee;
  const estimatedCMV = unitCost * quantity;
  const netProfit = netAmount - estimatedCMV;

  const countOrders = await prisma.order.count();
  const prefix =
    channel === SalesChannel.WHATSAPP
      ? "WPP"
      : channel === SalesChannel.INSTAGRAM
      ? "DIR"
      : channel === SalesChannel.MANUAL
      ? "CI"
      : channel.substring(0, 3);
  const orderNumber = `#${prefix}-${1001 + countOrders}`;

  const order = await prisma.order.create({
    data: {
      orderNumber,
      channel,
      status: OrderStatus.WAITING_PRODUCTION,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      shippingAddress: data.shippingAddress,
      paymentMethod: data.paymentMethod || "PIX",
      totalProducts,
      shippingCost,
      platformFee,
      netAmount,
      estimatedCMV,
      netProfit,
      notes: data.notes,
      paidAt: isPaid ? new Date() : null,
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
            : "Arte sob encomenda via WhatsApp/Direct.",
        },
      },
    },
  });

  // Registra no financeiro se estiver pago
  if (isPaid) {
    await prisma.financialTransaction.create({
      data: {
        type: "INCOME",
        category: "SALES_ORDER",
        amount: totalProducts + shippingCost,
        description: `Venda ${orderNumber} - ${data.customerName} (${data.paymentMethod || "Pix"})`,
        orderId: order.id,
      },
    });
  }

  // Registra no Audit Log de rastreabilidade
  const user = await getCurrentUser();
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      orderId: order.id,
      action: "ORDER_CREATED",
      entity: "Order",
      entityId: order.id,
      details: `Pedido ${orderNumber} criado por ${user.name} via ${channel}`,
      newPayload: JSON.stringify({
        orderNumber,
        customerName: data.customerName,
        totalProducts,
        channel,
        createdBy: user.name,
      }),
    },
  });

  revalidatePath("/pedidos");
  revalidatePath("/producao");
  revalidatePath("/estoque");
  revalidatePath("/financeiro");
  revalidatePath("/historico");
  revalidatePath("/");

  return order;
}
