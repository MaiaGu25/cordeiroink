"use server";

import { prisma } from "@/lib/prisma";
import { PurchaseStatus, TransactionType, TransactionCategory } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getPurchases() {
  const [purchaseOrders, suppliers, rawItems] = await Promise.all([
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
      orderBy: { name: "asc" },
    }),
    prisma.rawItem.findMany({
      where: { isActive: true },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    }),
  ]);

  return { purchaseOrders, suppliers, rawItems };
}

import { getCurrentUser } from "@/lib/auth";

export async function receivePurchaseOrder(poId: string) {
  const user = await getCurrentUser();
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
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      action: "PURCHASE_ORDER_RECEIVED_STOCK_ADDED",
      entity: "PurchaseOrder",
      entityId: poId,
      details: `Ordem de compra ${po.orderCode} recebida por ${user.name}. Insumos adicionados ao estoque.`,
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
  status?: PurchaseStatus;
  notes?: string;
}) {
  const user = await getCurrentUser();
  const count = await prisma.purchaseOrder.count();
  const orderCode = `PO-2026-${String(count + 1).padStart(3, "0")}`;

  const status = data.status || PurchaseStatus.ORDERED;
  const totalCost = data.items.reduce((acc, i) => acc + i.quantity * i.unitCost, 0);

  const po = await prisma.purchaseOrder.create({
    data: {
      orderCode,
      supplierId: data.supplierId,
      status,
      orderedAt: new Date(),
      receivedAt: status === PurchaseStatus.RECEIVED ? new Date() : null,
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
    include: {
      supplier: true,
      items: {
        include: { rawItem: true },
      },
    },
  });

  // Se já foi criada com status RECEBIDA, atualiza o estoque físico imediatamente
  if (status === PurchaseStatus.RECEIVED) {
    for (const item of data.items) {
      await prisma.rawItem.update({
        where: { id: item.rawItemId },
        data: {
          stockQuantity: {
            increment: item.quantity,
          },
        },
      });
    }

    // Registra saída no financeiro
    await prisma.financialTransaction.create({
      data: {
        type: TransactionType.EXPENSE,
        category: TransactionCategory.RAW_MATERIALS,
        amount: totalCost,
        description: `Compra Recebida (${orderCode}) - ${po.supplier.name}`,
        purchaseOrderId: po.id,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        action: "PURCHASE_ORDER_CREATED_AND_RECEIVED",
        entity: "PurchaseOrder",
        entityId: po.id,
        details: `Ordem de compra ${orderCode} criada diretamente como RECEBIDA por ${user.name}. Estoque atualizado.`,
        newPayload: JSON.stringify({
          orderCode,
          supplier: po.supplier.name,
          totalCost,
          itemsCount: data.items.length,
        }),
      },
    });
  } else {
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        action: "PURCHASE_ORDER_CREATED",
        entity: "PurchaseOrder",
        entityId: po.id,
        details: `Ordem de compra ${orderCode} (${status}) criada por ${user.name}`,
        newPayload: JSON.stringify({
          orderCode,
          supplierId: data.supplierId,
          status,
          totalCost,
        }),
      },
    });
  }

  revalidatePath("/compras");
  revalidatePath("/estoque");
  revalidatePath("/financeiro");
  revalidatePath("/");

  return po;
}

export async function createSupplier(data: {
  name: string;
  category: string;
  contactName?: string;
  whatsapp?: string;
  email?: string;
  pixKey?: string;
  notes?: string;
  leadTimeDays?: number;
}) {
  const user = await getCurrentUser();

  const supplier = await prisma.supplier.create({
    data: {
      name: data.name,
      category: data.category,
      contactName: data.contactName,
      whatsapp: data.whatsapp,
      email: data.email,
      pixKey: data.pixKey,
      notes: data.notes,
      leadTimeDays: data.leadTimeDays || 3,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      action: "SUPPLIER_CREATED",
      entity: "Supplier",
      entityId: supplier.id,
      details: `Fornecedor "${supplier.name}" cadastrado por ${user.name}`,
      newPayload: JSON.stringify({
        name: supplier.name,
        category: supplier.category,
        whatsapp: supplier.whatsapp,
      }),
    },
  });

  revalidatePath("/compras");
  revalidatePath("/estoque");
  return supplier;
}

export async function deleteSupplier(id: string) {
  const user = await getCurrentUser();

  const deleted = await prisma.supplier.delete({
    where: { id },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      action: "SUPPLIER_DELETED",
      entity: "Supplier",
      entityId: id,
      details: `Fornecedor "${deleted.name}" excluído por ${user.name}`,
    },
  });

  revalidatePath("/compras");
  revalidatePath("/estoque");
  return { success: true };
}
