"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface ProductTemplateInput {
  name: string;
  category?: string;
  baseImageFront: string;
  baseImageBack: string;
  baseImageSide?: string;
  description?: string;
}

/**
 * Busca todos os moldes e modelagens cadastradas no sistema.
 */
export async function getProductTemplates() {
  try {
    const templates = await prisma.productTemplate.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { products: true, catalogItems: true },
        },
      },
    });

    // Se nenhum molde estiver cadastrado, podemos criar moldes iniciais padrão para o lojista
    if (templates.length === 0) {
      const defaultTemplates = [
        {
          name: "Camiseta Oversized Streetwear",
          category: "Oversized",
          baseImageFront: "/mockups/blank-front.svg",
          baseImageBack: "/mockups/blank-back.svg",
          description: "Modelagem streetwear com ombros caídos e gola canelada de 3cm.",
        },
        {
          name: "Camiseta Regular Heavyweight",
          category: "Adulto",
          baseImageFront: "/mockups/blank-front.svg",
          baseImageBack: "/mockups/blank-back.svg",
          description: "Modelagem clássica estruturada em algodão pesado 220g.",
        },
      ];

      for (const t of defaultTemplates) {
        await prisma.productTemplate.create({ data: t });
      }

      return await prisma.productTemplate.findMany({
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: { products: true, catalogItems: true },
          },
        },
      });
    }

    return templates;
  } catch (error: any) {
    console.error("Erro ao carregar moldes:", error);
    return [];
  }
}

/**
 * Cadastra um novo molde/modelagem com imagens de mockup base.
 */
export async function createProductTemplate(data: ProductTemplateInput) {
  try {
    if (!data.name?.trim()) {
      return { success: false, error: "Nome da modelagem é obrigatório" };
    }
    if (!data.baseImageFront?.trim() || !data.baseImageBack?.trim()) {
      return {
        success: false,
        error: "As bases da frente e das costas (mockup cinza) são obrigatórias",
      };
    }

    const template = await prisma.productTemplate.create({
      data: {
        name: data.name.trim(),
        category: data.category?.trim() || "Camisetas",
        baseImageFront: data.baseImageFront.trim(),
        baseImageBack: data.baseImageBack.trim(),
        baseImageSide: data.baseImageSide?.trim() || null,
        description: data.description?.trim() || null,
      },
    });

    revalidatePath("/admin/vitrine");
    revalidatePath("/produtos");
    revalidatePath("/");

    return { success: true, template };
  } catch (error: any) {
    console.error("Erro ao criar molde:", error);
    return { success: false, error: error.message || "Erro ao criar molde" };
  }
}

/**
 * Atualiza um molde existente.
 */
export async function updateProductTemplate(
  id: string,
  data: Partial<ProductTemplateInput>
) {
  try {
    const template = await prisma.productTemplate.update({
      where: { id },
      data: {
        name: data.name !== undefined ? data.name.trim() : undefined,
        category: data.category !== undefined ? data.category.trim() : undefined,
        baseImageFront:
          data.baseImageFront !== undefined ? data.baseImageFront.trim() : undefined,
        baseImageBack:
          data.baseImageBack !== undefined ? data.baseImageBack.trim() : undefined,
        baseImageSide:
          data.baseImageSide !== undefined ? data.baseImageSide?.trim() || null : undefined,
        description:
          data.description !== undefined ? data.description?.trim() || null : undefined,
      },
    });

    revalidatePath("/admin/vitrine");
    revalidatePath("/produtos");
    revalidatePath("/");

    return { success: true, template };
  } catch (error: any) {
    console.error("Erro ao atualizar molde:", error);
    return { success: false, error: error.message || "Erro ao atualizar molde" };
  }
}

/**
 * Exclui um molde (desvincula dos produtos que o usam).
 */
export async function deleteProductTemplate(id: string) {
  try {
    await prisma.productTemplate.delete({
      where: { id },
    });

    revalidatePath("/admin/vitrine");
    revalidatePath("/produtos");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Erro ao deletar molde:", error);
    return { success: false, error: error.message || "Erro ao deletar molde" };
  }
}
