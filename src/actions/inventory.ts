"use server";

import { prisma } from "@/lib/prisma";
import { RawItemType } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getInventoryItems() {
  const items = await prisma.rawItem.findMany({
    include: {
      supplier: true,
      _count: {
        select: { bomItems: true },
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

export async function createRawItem(data: {
  sku: string;
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
  supplierId?: string;
}) {
  const item = await prisma.rawItem.create({
    data: {
      sku: data.sku,
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
      supplierId: data.supplierId,
    },
  });

  revalidatePath("/estoque");
  revalidatePath("/");
  return item;
}
