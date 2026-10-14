"use server";

import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import path from "path";
import fs from "fs/promises";

/**
 * Upload de imagens para a vitrine pública e para o catálogo.
 * Utiliza o bucket público "storefront" do Supabase Storage com fallback local seguro.
 */
export async function uploadStorefrontFile(formData: FormData) {
  try {
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "catalog";

    if (!file) {
      return { success: false, error: "Nenhum arquivo enviado" };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Formata o nome do arquivo para padrão seguro
    const ext = path.extname(file.name).toLowerCase() || ".png";
    const rawBaseName = path.basename(file.name, ext);
    const safeBaseName = rawBaseName.replace(/[^a-zA-Z0-9_-]/g, "").substring(0, 30) || "img";
    const fileName = `${safeBaseName}-${Date.now()}${ext}`;
    const storagePath = `${folder}/${fileName}`;

    // 1. Tentar upload para o Supabase Storage no bucket 'storefront'
    try {
      const supabase = createAdminClient();

      // Garante que o bucket 'storefront' está disponível
      const { data: buckets } = await supabase.storage.listBuckets();
      const hasStorefront = buckets?.some((b) => b.name === "storefront");
      if (!hasStorefront) {
        await supabase.storage.createBucket("storefront", { public: true });
      }

      const contentType = file.type || "image/png";
      const { error: uploadError } = await supabase.storage
        .from("storefront")
        .upload(storagePath, buffer, {
          contentType,
          upsert: true,
        });

      if (!uploadError) {
        const { data: publicData } = supabase.storage
          .from("storefront")
          .getPublicUrl(storagePath);

        return {
          success: true,
          url: publicData.publicUrl,
          fileName,
        };
      } else {
        console.warn("Supabase Storage error, using local fallback:", uploadError.message);
      }
    } catch (supabaseErr: any) {
      console.warn("Supabase client failed, using local storage fallback:", supabaseErr.message);
    }

    // 2. Fallback de armazenamento local em public/uploads/storefront/
    const uploadDir = path.join(process.cwd(), "public", "uploads", "storefront", folder);
    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);

    const relativeUrl = `/uploads/storefront/${folder}/${fileName}`;
    return {
      success: true,
      url: relativeUrl,
      fileName,
    };
  } catch (err: any) {
    console.error("Erro no upload para storefront:", err);
    return {
      success: false,
      error: "Falha ao processar upload: " + (err.message || "Erro desconhecido"),
    };
  }
}

import { CATALOG_CATEGORIES, type CatalogCategory, type VariantInput } from "@/lib/storefront-constants";
export type { CatalogCategory, VariantInput };

/**
 * Busca itens do catálogo para a vitrine pública e para a área administrativa.
 */
export async function getCatalogItems(includeInactive = false) {
  try {
    const items = await prisma.catalogItem.findMany({
      where: includeInactive ? undefined : { isActive: true },
      include: {
        variants: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return items;
  } catch (err) {
    console.error("Erro ao buscar itens do catálogo:", err);
    return [];
  }
}

/**
 * Criação de um novo item de catálogo na área administrativa com suporte a variações de cor.
 */
export async function createCatalogItem(data: {
  title: string;
  description?: string;
  price: number;
  imageUrl: string;
  category?: string;
  variants?: VariantInput[];
}) {
  if (!data.title?.trim() || !data.imageUrl?.trim()) {
    throw new Error("Título e Imagem principal do produto são obrigatórios.");
  }

  const cleanCategory = CATALOG_CATEGORIES.includes(data.category as any)
    ? data.category!
    : "Adulto";

  const validVariants = (data.variants || []).filter(
    (v) => v.colorName?.trim() && v.imageUrl?.trim()
  );

  const item = await prisma.catalogItem.create({
    data: {
      title: data.title.trim(),
      description: data.description?.trim() || null,
      price: Number(data.price) || 0,
      imageUrl: data.imageUrl.trim(),
      category: cleanCategory,
      isActive: true,
      variants: {
        create: validVariants.map((v) => ({
          colorName: v.colorName.trim(),
          hexCode: v.hexCode?.trim() || "#000000",
          imageUrl: v.imageUrl.trim(),
        })),
      },
    },
    include: {
      variants: true,
    },
  });

  revalidatePath("/admin/vitrine");
  revalidatePath("/");
  return item;
}

/**
 * Atualização de um item de catálogo existente e sincronização de variações.
 */
export async function updateCatalogItem(
  id: string,
  data: {
    title?: string;
    description?: string;
    price?: number;
    imageUrl?: string;
    category?: string;
    isActive?: boolean;
    variants?: VariantInput[];
  }
) {
  const cleanCategory =
    data.category && CATALOG_CATEGORIES.includes(data.category as any)
      ? data.category
      : undefined;

  const item = await prisma.$transaction(async (tx) => {
    // Sincroniza variações se fornecidas
    if (data.variants !== undefined) {
      await tx.catalogVariant.deleteMany({
        where: { catalogItemId: id },
      });

      const validVariants = data.variants.filter(
        (v) => v.colorName?.trim() && v.imageUrl?.trim()
      );

      if (validVariants.length > 0) {
        await tx.catalogVariant.createMany({
          data: validVariants.map((v) => ({
            catalogItemId: id,
            colorName: v.colorName.trim(),
            hexCode: v.hexCode?.trim() || "#000000",
            imageUrl: v.imageUrl.trim(),
          })),
        });
      }
    }

    return await tx.catalogItem.update({
      where: { id },
      data: {
        title: data.title !== undefined ? data.title.trim() : undefined,
        description: data.description !== undefined ? data.description.trim() : undefined,
        price: data.price !== undefined ? Number(data.price) : undefined,
        imageUrl: data.imageUrl !== undefined ? data.imageUrl.trim() : undefined,
        category: cleanCategory,
        isActive: data.isActive !== undefined ? data.isActive : undefined,
      },
      include: {
        variants: true,
      },
    });
  });

  revalidatePath("/admin/vitrine");
  revalidatePath("/");
  return item;
}

/**
 * Exclusão de item de catálogo.
 */
export async function deleteCatalogItem(id: string) {
  await prisma.catalogItem.delete({
    where: { id },
  });

  revalidatePath("/admin/vitrine");
  revalidatePath("/");
  return { success: true };
}

/**
 * Registra um orçamento/lead personalizado enviado pelo cliente na vitrine pública.
 */
export async function createLeadQuote(data: {
  customerName: string;
  whatsapp: string;
  shirtModel: string;
  size: string;
  customDesignUrl?: string;
  notes?: string;
}) {
  if (!data.customerName?.trim() || !data.whatsapp?.trim()) {
    throw new Error("Nome e WhatsApp são obrigatórios para o orçamento.");
  }

  const cleanWhatsapp = data.whatsapp.replace(/\D/g, "");

  const lead = await prisma.leadQuote.create({
    data: {
      customerName: data.customerName.trim(),
      whatsapp: cleanWhatsapp,
      shirtModel: data.shirtModel || "Oversized Streetwear",
      size: data.size || "G",
      customDesignUrl: data.customDesignUrl?.trim() || null,
      notes: data.notes?.trim() || null,
      status: "PENDING",
    },
  });

  revalidatePath("/admin/vitrine");

  // Telefone da Cordeiro Ink para o contato
  const brandPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "5511999999999";
  const whatsappUrl = `https://wa.me/${brandPhone}?text=${encodeURIComponent(
    "Olá! Acabei de enviar um pedido personalizado pelo site."
  )}`;

  return {
    success: true,
    leadId: lead.id,
    whatsappUrl,
  };
}

/**
 * Lista os leads de orçamentos para o painel administrativo.
 */
export async function getLeadQuotes() {
  try {
    const leads = await prisma.leadQuote.findMany({
      orderBy: { createdAt: "desc" },
    });
    return leads;
  } catch (err) {
    console.error("Erro ao buscar leads de orçamento:", err);
    return [];
  }
}
