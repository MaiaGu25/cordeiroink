"use server";

import { prisma } from "@/lib/prisma";
import { PurchaseStatus, TransactionType, TransactionCategory } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getPurchases() {
  const [purchaseOrders, suppliers] = await Promise.all([
    prisma.purchaseOrder.findMany({
      include: {
        supplier: true,
        items: {
          include: {
            rawItem: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.supplier.findMany({
      include: {
        _count: {
          select: { purchaseOrders: true, rawItems: true },
        },
      },
    }),
  ]);

  return { purchaseOrders, suppliers };
}

export async function receivePurchaseOrder(poId: string) {
  const po = await prisma.purchaseOrder.findUnique({
    where: { id: poId },
    include: {
      supplier: true,
      items: {
        include: {
          rawItem: true,
        },
      },
    },
  });

  if (!po) throw new Error("Ordem de compra não encontrada");
  if (po.status === PurchaseStatus.RECEIVED) {
    throw new Error("Esta ordem de compra já foi recebida anteriormente.");
  }

  // 1. Atualiza estoque de cada insumo recebido
  for (const item of po.items) {
    await prisma.rawItem.update({
      where: { id: item.rawItemId },
      data: {
        stockQuantity: {
          increment: item.quantity,
        },
      },
    });
  }

  // 2. Atualiza status da ordem de compra
  const updatedPO = await prisma.purchaseOrder.update({
    where: { id: poId },
    data: {
      status: PurchaseStatus.RECEIVED,
      receivedAt: new Date(),
    },
  });

  // 3. Registra saída no financeiro caso não tenha sido lançada
  await prisma.financialTransaction.create({
    data: {
      type: TransactionType.EXPENSE,
      category: TransactionCategory.RAW_MATERIALS,
      amount: po.totalCost,
      description: `Compra Recebida (${po.orderCode}) - ${po.supplier.name}`,
      purchaseOrderId: po.id,
    },
  });

  // 4. Audit Log
  await prisma.auditLog.create({
    data: {
      action: "PURCHASE_ORDER_RECEIVED_STOCK_ADDED",
      entity: "PurchaseOrder",
      entityId: poId,
      newPayload: JSON.stringify({
        orderCode: po.orderCode,
        supplier: po.supplier.name,
        totalCost: po.totalCost,
        itemsCount: po.items.length,
      }),
    },
  });

  revalidatePath("/compras");
  revalidatePath("/estoque");
  revalidatePath("/financeiro");
  revalidatePath("/");

  return updatedPO;
}

export async function createPurchaseOrder(data: {
  supplierId: string;
  items: { rawItemId: string; quantity: number; unitCost: number }[];
  notes?: string;
}) {
  const count = await prisma.purchaseOrder.count();
  const orderCode = `PO-2026-${String(count + 1).padStart(3, "0")}`;

  const totalCost = data.items.reduce((acc, i) => acc + i.quantity * i.unitCost, 0);

  const po = await prisma.purchaseOrder.create({
    data: {
      orderCode,
      supplierId: data.supplierId,
      status: PurchaseStatus.ORDERED,
      orderedAt: new Date(),
      totalCost,
      notes: data.notes,
      items: {
        create: data.items.map((i) => ({
          rawItemId: i.rawItemId,
          quantity: i.quantity,
          unitCost: i.unitCost,
          totalCost: i.quantity * i.unitCost,
        })),
      },
    },
  });

  revalidatePath("/compras");
  return po;
}
