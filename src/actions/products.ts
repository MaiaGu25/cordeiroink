"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getProductsWithDetails() {
  const [products, rawItems] = await Promise.all([
    prisma.product.findMany({
      include: {
        template: true,
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
  backImageUrl?: string;
  description?: string;
  showOnVirtualRack?: boolean;
  templateId?: string;
  baseShirtUrl?: string;
  baseShirtBackUrl?: string;
  baseShirtSideUrl?: string;
  printImageUrl?: string;
  printBackImageUrl?: string;
  printLightFront?: string;
  printDarkFront?: string;
  printLightBack?: string;
  printDarkBack?: string;
  printWidth?: number;
  printTop?: number;
  printLeft?: number;
  printWidthBack?: number;
  printTopBack?: number;
  printLeftBack?: number;
  variants: {
    sku: string;
    title: string;
    size: string;
    color: string;
    colorHex?: string;
    imageUrl?: string;
    backImageUrl?: string;
    basePrice: number;
    printTheme?: "LIGHT" | "DARK";
    rawItemIds?: string[]; // Itens de BOM vinculados
  }[];
}) {
  try {
    const product = await prisma.product.create({
      data: {
        skuBase: data.skuBase.trim(),
        name: data.name.trim(),
        category: data.category || "Camisetas",
        collection: data.collection?.trim() || null,
        targetMargin: Number(data.targetMargin) || 50.0,
        imageUrl: data.imageUrl?.trim() || null,
        backImageUrl: data.backImageUrl?.trim() || null,
        description: data.description?.trim() || null,
        showOnVirtualRack: Boolean(data.showOnVirtualRack),
        templateId: data.templateId?.trim() || null,
        baseShirtUrl: data.baseShirtUrl?.trim() || null,
        baseShirtBackUrl: data.baseShirtBackUrl?.trim() || null,
        baseShirtSideUrl: data.baseShirtSideUrl?.trim() || null,
        printImageUrl: data.printImageUrl?.trim() || null,
        printBackImageUrl: data.printBackImageUrl?.trim() || null,
        printLightFront: data.printLightFront?.trim() || null,
        printDarkFront: data.printDarkFront?.trim() || null,
        printLightBack: data.printLightBack?.trim() || null,
        printDarkBack: data.printDarkBack?.trim() || null,
        printWidth: data.printWidth !== undefined ? Number(data.printWidth) : 45.0,
        printTop: data.printTop !== undefined ? Number(data.printTop) : 28.0,
        printLeft: data.printLeft !== undefined ? Number(data.printLeft) : 50.0,
        printWidthBack: data.printWidthBack !== undefined ? Number(data.printWidthBack) : 50.0,
        printTopBack: data.printTopBack !== undefined ? Number(data.printTopBack) : 25.0,
        printLeftBack: data.printLeftBack !== undefined ? Number(data.printLeftBack) : 50.0,
        variants: {
          create: (data.variants || []).map((v) => ({
            sku: v.sku.trim(),
            title: v.title.trim(),
            size: v.size.trim(),
            color: v.color.trim(),
            colorHex: v.colorHex?.trim() || "#000000",
            imageUrl: v.imageUrl?.trim() || null,
            backImageUrl: v.backImageUrl?.trim() || null,
            basePrice: Number(v.basePrice) || 0,
            printTheme: v.printTheme === "DARK" ? "DARK" : "LIGHT",
            bom: {
              create: (v.rawItemIds || []).map((rawId) => ({
                rawItemId: rawId,
                quantity: 1,
              })),
            },
          })),
        },
      },
      include: {
        variants: true,
      },
    });

    revalidatePath("/produtos");
    revalidatePath("/");
    return { success: true, product };
  } catch (err: any) {
    console.error("Erro ao criar produto:", err);
    return {
      success: false,
      error: String(err?.message || "Erro ao criar produto"),
    };
  }
}

export async function updateProduct(
  id: string,
  data: {
    skuBase?: string;
    name?: string;
    category?: string;
    collection?: string;
    targetMargin?: number;
    imageUrl?: string;
    backImageUrl?: string;
    description?: string;
    showOnVirtualRack?: boolean;
    templateId?: string;
    baseShirtUrl?: string;
    baseShirtBackUrl?: string;
    baseShirtSideUrl?: string;
    printImageUrl?: string;
    printBackImageUrl?: string;
    printLightFront?: string;
    printDarkFront?: string;
    printLightBack?: string;
    printDarkBack?: string;
    printWidth?: number;
    printTop?: number;
    printLeft?: number;
    printWidthBack?: number;
    printTopBack?: number;
    printLeftBack?: number;
    isActive?: boolean;
    variants?: {
      sku: string;
      title: string;
      size: string;
      color: string;
      colorHex?: string;
      printTheme?: "LIGHT" | "DARK";
      imageUrl?: string;
      backImageUrl?: string;
      basePrice: number;
      rawItemIds?: string[];
    }[];
  }
) {
  try {
    const product = await prisma.$transaction(async (tx) => {
      if (data.variants !== undefined) {
        await tx.productVariant.deleteMany({
          where: { productId: id },
        });

        if (data.variants.length > 0) {
          for (const v of data.variants) {
            await tx.productVariant.create({
              data: {
                productId: id,
                sku: v.sku.trim(),
                title: v.title.trim(),
                size: v.size.trim(),
                color: v.color.trim(),
                colorHex: v.colorHex?.trim() || "#000000",
                printTheme: v.printTheme === "DARK" ? "DARK" : "LIGHT",
                imageUrl: v.imageUrl?.trim() || null,
                backImageUrl: v.backImageUrl?.trim() || null,
                basePrice: Number(v.basePrice) || 0,
                bom: {
                  create: (v.rawItemIds || []).map((rawId) => ({
                    rawItemId: rawId,
                    quantity: 1,
                  })),
                },
              },
            });
          }
        }
      }

      return await tx.product.update({
        where: { id },
        data: {
          skuBase: data.skuBase !== undefined ? data.skuBase.trim() : undefined,
          name: data.name !== undefined ? data.name.trim() : undefined,
          category: data.category !== undefined ? data.category.trim() : undefined,
          collection: data.collection !== undefined ? (data.collection?.trim() || null) : undefined,
          targetMargin: data.targetMargin !== undefined ? Number(data.targetMargin) : undefined,
          imageUrl: data.imageUrl !== undefined ? (data.imageUrl?.trim() || null) : undefined,
          backImageUrl: data.backImageUrl !== undefined ? (data.backImageUrl?.trim() || null) : undefined,
          description: data.description !== undefined ? (data.description?.trim() || null) : undefined,
          showOnVirtualRack: data.showOnVirtualRack !== undefined ? Boolean(data.showOnVirtualRack) : undefined,
          templateId: data.templateId !== undefined ? (data.templateId?.trim() || null) : undefined,
          baseShirtUrl: data.baseShirtUrl !== undefined ? (data.baseShirtUrl?.trim() || null) : undefined,
          baseShirtBackUrl: data.baseShirtBackUrl !== undefined ? (data.baseShirtBackUrl?.trim() || null) : undefined,
          baseShirtSideUrl: data.baseShirtSideUrl !== undefined ? (data.baseShirtSideUrl?.trim() || null) : undefined,
          printImageUrl: data.printImageUrl !== undefined ? (data.printImageUrl?.trim() || null) : undefined,
          printBackImageUrl: data.printBackImageUrl !== undefined ? (data.printBackImageUrl?.trim() || null) : undefined,
          printLightFront: data.printLightFront !== undefined ? (data.printLightFront?.trim() || null) : undefined,
          printDarkFront: data.printDarkFront !== undefined ? (data.printDarkFront?.trim() || null) : undefined,
          printLightBack: data.printLightBack !== undefined ? (data.printLightBack?.trim() || null) : undefined,
          printDarkBack: data.printDarkBack !== undefined ? (data.printDarkBack?.trim() || null) : undefined,
          printWidth: data.printWidth !== undefined ? Number(data.printWidth) : undefined,
          printTop: data.printTop !== undefined ? Number(data.printTop) : undefined,
          printLeft: data.printLeft !== undefined ? Number(data.printLeft) : undefined,
          printWidthBack: data.printWidthBack !== undefined ? Number(data.printWidthBack) : undefined,
          printTopBack: data.printTopBack !== undefined ? Number(data.printTopBack) : undefined,
          printLeftBack: data.printLeftBack !== undefined ? Number(data.printLeftBack) : undefined,
          isActive: data.isActive !== undefined ? Boolean(data.isActive) : undefined,
        },
        include: {
          template: true,
          variants: true,
        },
      });
    });

    revalidatePath("/produtos");
    revalidatePath("/");
    return { success: true, product };
  } catch (err: any) {
    console.error("Erro ao atualizar produto:", err);
    return {
      success: false,
      error: String(err?.message || "Erro ao atualizar produto"),
    };
  }
}

export async function toggleProductVirtualRack(id: string, showOnVirtualRack: boolean) {
  try {
    const product = await prisma.product.update({
      where: { id },
      data: { showOnVirtualRack },
    });

    revalidatePath("/produtos");
    revalidatePath("/");
    return { success: true, product };
  } catch (err: any) {
    console.error("Erro ao alternar produto na arara virtual:", err);
    return {
      success: false,
      error: String(err?.message || "Erro ao alternar arara virtual"),
    };
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({
      where: { id },
    });

    revalidatePath("/produtos");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error("Erro ao excluir produto:", err);
    return {
      success: false,
      error: String(err?.message || "Erro ao excluir produto"),
    };
  }
}
