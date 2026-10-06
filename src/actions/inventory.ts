"use server";

import { prisma } from "@/lib/prisma";
import { RawItemType } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getInventoryItems() {
  const items = await prisma.rawItem.findMany({
    include: {
      supplier: true,
      _count: {
        select: {
          bomItems: true,
          orderItemBlankShirts: true,
          orderItemDtfPrints: true,
        },
      },
    },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });

  const blankShirts = items.filter((i) => i.type === RawItemType.BLANK_SHIRT);
  const dtfPrints = items.filter((i) => i.type === RawItemType.DTF_PRINT);
  const supplies = items.filter(
    (i) =>
      i.type === RawItemType.PACKAGING ||
      i.type === RawItemType.LABEL ||
      i.type === RawItemType.GIFT
  );

  const criticalItems = items.filter((i) => i.stockQuantity <= i.minStock);

  return {
    items,
    blankShirts,
    dtfPrints,
    supplies,
    criticalItems,
  };
}

export async function adjustStock(rawItemId: string, newQuantity: number, reason?: string) {
  const current = await prisma.rawItem.findUnique({
    where: { id: rawItemId },
  });

  if (!current) throw new Error("Item de estoque não encontrado");

  const diff = newQuantity - current.stockQuantity;

  const updated = await prisma.rawItem.update({
    where: { id: rawItemId },
    data: { stockQuantity: newQuantity },
  });

  await prisma.auditLog.create({
    data: {
      action: "STOCK_ADJUSTED",
      entity: "RawItem",
      entityId: rawItemId,
      oldPayload: JSON.stringify({ stockQuantity: current.stockQuantity }),
      newPayload: JSON.stringify({
        stockQuantity: newQuantity,
        difference: diff,
        reason: reason || "Ajuste manual de inventário",
      }),
    },
  });

  revalidatePath("/estoque");
  revalidatePath("/");
  return updated;
}

export async function createDtfArtItem(data: {
  name: string;
  dtfCode?: string;
  dtfPreviewUrl?: string;
  dtfPrintSize?: string;
  dtfSupplier?: string;
  stockQuantity: number;
  minStock?: number;
  costPrice?: number;
}) {
  const count = await prisma.rawItem.count({ where: { type: RawItemType.DTF_PRINT } });
  const code = data.dtfCode || `ART-${100 + count}`;
  const cost = data.costPrice ?? (data.dtfPrintSize === "A4 (21x30cm)" ? 9.50 : data.dtfPrintSize === "Bolso" ? 4.50 : 13.90);

  const item = await prisma.rawItem.create({
    data: {
      sku: `RAW-DTF-${code}`,
      name: data.name,
      type: RawItemType.DTF_PRINT,
      dtfCode: code,
      dtfPreviewUrl: data.dtfPreviewUrl,
      dtfPrintSize: data.dtfPrintSize || "A3 (30x42cm)",
      dtfSupplier: data.dtfSupplier || "Birô DTF Express",
      costPrice: cost,
      stockQuantity: data.stockQuantity || 0,
      minStock: data.minStock ?? 5,
    },
  });

  revalidatePath("/estoque");
  revalidatePath("/");
  return item;
}

export async function createRawItem(data: {
  sku?: string;
  name: string;
  type: RawItemType;
  stockQuantity: number;
  minStock: number;
  costPrice: number;
  shirtModel?: string;
  shirtColor?: string;
  shirtSize?: string;
  dtfCode?: string;
  dtfPreviewUrl?: string;
  dtfPrintSize?: string;
  dtfSupplier?: string;
  supplierId?: string;
}) {
  // Gerar SKU automático caso não seja fornecido
  let sku = data.sku?.trim();
  if (!sku) {
    const cleanStr = (s?: string) =>
      (s || "")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .substring(0, 6);

    if (data.type === RawItemType.BLANK_SHIRT) {
      const modelPart = cleanStr(data.shirtModel) || "SHIRT";
      const colorPart = cleanStr(data.shirtColor) || "CLR";
      const sizePart = cleanStr(data.shirtSize) || "U";
      sku = `RAW-SHIRT-${modelPart}-${colorPart}-${sizePart}`;
    } else if (data.type === RawItemType.DTF_PRINT) {
      sku = `RAW-DTF-${cleanStr(data.dtfCode) || Math.floor(1000 + Math.random() * 9000)}`;
    } else if (data.type === RawItemType.PACKAGING) {
      sku = `RAW-PACK-${cleanStr(data.name) || Math.floor(100 + Math.random() * 900)}`;
    } else {
      sku = `RAW-SUP-${Math.floor(1000 + Math.random() * 9000)}`;
    }
  }

  // Verificar se já existe SKU para evitar colisão
  const existing = await prisma.rawItem.findUnique({ where: { sku } });
  if (existing) {
    sku = `${sku}-${Math.floor(10 + Math.random() * 89)}`;
  }

  const item = await prisma.rawItem.create({
    data: {
      sku,
      name: data.name,
      type: data.type,
      stockQuantity: data.stockQuantity,
      minStock: data.minStock,
      costPrice: data.costPrice,
      shirtModel: data.shirtModel,
      shirtColor: data.shirtColor,
      shirtSize: data.shirtSize,
      dtfCode: data.dtfCode,
      dtfPreviewUrl: data.dtfPreviewUrl,
      dtfPrintSize: data.dtfPrintSize,
      dtfSupplier: data.dtfSupplier,
      supplierId: data.supplierId,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "RAW_ITEM_CREATED",
      entity: "RawItem",
      entityId: item.id,
      newPayload: JSON.stringify({
        sku: item.sku,
        name: item.name,
        type: item.type,
        stockQuantity: item.stockQuantity,
        costPrice: item.costPrice,
      }),
    },
  });

  revalidatePath("/estoque");
  revalidatePath("/pedidos");
  revalidatePath("/producao");
  revalidatePath("/");
  return item;
}

export async function createBatchBlankShirts(data: {
  model: string;
  color: string;
  costPrice: number;
  minStock: number;
  sizes: { size: string; quantity: number }[];
}) {
  const createdItems = [];

  for (const s of data.sizes) {
    const cleanModel = data.model.toUpperCase().replace(/[^A-Z0-9]/g, "").substring(0, 5) || "SHIRT";
    const cleanColor = data.color.toUpperCase().replace(/[^A-Z0-9]/g, "").substring(0, 4) || "CLR";
    let sku = `RAW-SHIRT-${cleanModel}-${cleanColor}-${s.size}`;

    const existing = await prisma.rawItem.findUnique({ where: { sku } });
    if (existing) {
      sku = `${sku}-${Math.floor(10 + Math.random() * 89)}`;
    }

    const item = await prisma.rawItem.create({
      data: {
        sku,
        name: `${data.model} - ${data.color} ${s.size}`,
        type: RawItemType.BLANK_SHIRT,
        shirtModel: data.model,
        shirtColor: data.color,
        shirtSize: s.size,
        stockQuantity: s.quantity,
        costPrice: data.costPrice,
        minStock: data.minStock,
      },
    });

    createdItems.push(item);
  }

  await prisma.auditLog.create({
    data: {
      action: "RAW_ITEMS_BATCH_CREATED",
      entity: "RawItem",
      entityId: createdItems[0]?.id || "batch",
      newPayload: JSON.stringify({
        model: data.model,
        color: data.color,
        totalCreated: createdItems.length,
      }),
    },
  });

  revalidatePath("/estoque");
  revalidatePath("/pedidos");
  revalidatePath("/");
  return createdItems;
}

export async function resetDatabaseToZero() {
  await prisma.auditLog.deleteMany();
  await prisma.financialTransaction.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.productionJob.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productBOM.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.rawItem.deleteMany();

  // Garante que o administrador existe para uso
  const admin = await prisma.user.findFirst({
    where: { email: "mateus@cordeiroink.com.br" },
  });

  if (!admin) {
    await prisma.user.create({
      data: {
        name: "Mateus Cordeiro",
        email: "mateus@cordeiroink.com.br",
        role: "ADMIN",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      action: "DATABASE_RESET_TO_ZERO",
      entity: "System",
      entityId: "SYSTEM",
      newPayload: JSON.stringify({
        message: "Banco de dados zerado com sucesso. Pronto para inserção de dados reais.",
        resetAt: new Date().toISOString(),
      }),
    },
  });

  revalidatePath("/estoque");
  revalidatePath("/pedidos");
  revalidatePath("/producao");
  revalidatePath("/financeiro");
  revalidatePath("/");

  return { success: true, message: "Banco zerado com sucesso!" };
}
