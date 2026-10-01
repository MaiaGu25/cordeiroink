"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getProductsWithDetails() {
  const [products, rawItems] = await Promise.all([
    prisma.product.findMany({
      include: {
        variants: {
          include: {
            bom: {
              include: {
                rawItem: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.rawItem.findMany({
      orderBy: [{ type: "asc" }, { name: "asc" }],
    }),
  ]);

  return { products, rawItems };
}

export async function createProduct(data: {
  skuBase: string;
  name: string;
  category: string;
  collection?: string;
  targetMargin: number;
  imageUrl?: string;
  description?: string;
  variants: {
    sku: string;
    title: string;
    size: string;
    color: string;
    basePrice: number;
    rawItemIds: string[]; // Itens de BOM vinculados
  }[];
}) {
  const product = await prisma.product.create({
    data: {
      skuBase: data.skuBase,
      name: data.name,
      category: data.category,
      collection: data.collection,
      targetMargin: data.targetMargin,
      imageUrl: data.imageUrl,
      description: data.description,
      variants: {
        create: data.variants.map((v) => ({
          sku: v.sku,
          title: v.title,
          size: v.size,
          color: v.color,
          basePrice: v.basePrice,
          bom: {
            create: v.rawItemIds.map((rawId) => ({
              rawItemId: rawId,
              quantity: 1,
            })),
          },
        })),
      },
    },
  });

  revalidatePath("/produtos");
  revalidatePath("/");
  return product;
}
