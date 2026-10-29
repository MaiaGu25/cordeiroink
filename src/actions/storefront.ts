"use server";

import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { OrderStatus, SalesChannel, RawItemType } from "@prisma/client";
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

import {
  CATALOG_CATEGORIES,
  type CatalogCategory,
  type VariantInput,
  type AvailableStockSize,
  type VirtualRackProduct,
} from "@/lib/storefront-constants";

/**
 * Busca produtos configurados para a Arara Virtual na vitrine (Product e CatalogItem com showOnVirtualRack: true).
 */
export async function getVirtualRackProducts(): Promise<VirtualRackProduct[]> {
  try {
    const [erpProducts, catalogItems] = await Promise.all([
      prisma.product.findMany({
        where: { showOnVirtualRack: true, isActive: true },
        include: {
          template: true,
          variants: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.catalogItem.findMany({
        where: { showOnVirtualRack: true, isActive: true },
        include: {
          template: true,
          variants: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const result: VirtualRackProduct[] = [];

    erpProducts.forEach((p) => {
      const colorMap = new Map<string, { name: string; hex: string; imageUrl: string; backImageUrl?: string | null; printTheme?: "LIGHT" | "DARK" }>();
      p.variants.forEach((v) => {
        if (!colorMap.has(v.color)) {
          colorMap.set(v.color, {
            name: v.color,
            hex: v.colorHex || (v.color.toLowerCase().includes("off") ? "#F5F2EB" : "#111111"),
            imageUrl: v.imageUrl || p.imageUrl || "",
            backImageUrl: v.backImageUrl || p.backImageUrl || null,
            printTheme: (v.printTheme as "LIGHT" | "DARK") || "LIGHT",
          });
        }
      });

      const colors =
        colorMap.size > 0
          ? Array.from(colorMap.values())
          : [
              {
                name: "Preto",
                hex: "#111111",
                imageUrl: p.imageUrl || "",
                backImageUrl: p.backImageUrl || null,
                printTheme: "LIGHT" as const,
              },
            ];

      const resolvedBaseFront =
        p.baseShirtUrl?.trim() ||
        p.template?.baseImageFront?.trim() ||
        "/mockups/blank-front.svg";
      const resolvedBaseBack =
        p.baseShirtBackUrl?.trim() ||
        p.template?.baseImageBack?.trim() ||
        "/mockups/blank-back.svg";

      result.push({
        id: p.id,
        name: p.name,
        price: p.variants?.[0]?.basePrice || 89.9,
        category: p.category || "Oversized",
        collection: p.collection || "Drop Especial",
        description: p.description,
        baseImage: resolvedBaseFront,
        baseBackImage: resolvedBaseBack,
        printImage: p.printImageUrl?.trim() || p.imageUrl || null,
        printBackImage: p.printBackImageUrl?.trim() || p.backImageUrl || null,
        printLightFront: p.printLightFront?.trim() || null,
        printDarkFront: p.printDarkFront?.trim() || null,
        printLightBack: p.printLightBack?.trim() || null,
        printDarkBack: p.printDarkBack?.trim() || null,
        printWidth: Number(p.printWidth) || 45.0,
        printTop: Number(p.printTop) || 28.0,
        printLeft: Number(p.printLeft) || 50.0,
        printWidthBack: Number(p.printWidthBack) || 50.0,
        printTopBack: Number(p.printTopBack) || 25.0,
        printLeftBack: Number(p.printLeftBack) || 50.0,
        imageUrl: p.imageUrl || "",
        backImageUrl: p.backImageUrl || null,
        colors,
      });
    });

    catalogItems.forEach((c) => {
      if (result.some((item) => item.id === c.id)) return;

      const colors =
        c.variants.length > 0
          ? c.variants.map((v) => ({
              name: v.colorName,
              hex: v.hexCode || (v.colorName.toLowerCase().includes("off") ? "#F5F2EB" : "#111111"),
              imageUrl: v.imageUrl || c.imageUrl,
              backImageUrl: v.backImageUrl || c.backImageUrl || null,
              printTheme: (v.printTheme as "LIGHT" | "DARK") || "LIGHT",
            }))
          : [
              {
                name: "Preto",
                hex: "#111111",
                imageUrl: c.imageUrl,
                backImageUrl: c.backImageUrl || null,
                printTheme: "LIGHT" as const,
              },
            ];

      const resolvedBaseFront =
        c.baseShirtUrl?.trim() ||
        c.template?.baseImageFront?.trim() ||
        "/mockups/blank-front.svg";
      const resolvedBaseBack =
        c.baseShirtBackUrl?.trim() ||
        c.template?.baseImageBack?.trim() ||
        "/mockups/blank-back.svg";

      result.push({
        id: c.id,
        name: c.title,
        price: c.price,
        category: c.category || "Oversized",
        collection: "Vitrine",
        description: c.description,
        baseImage: resolvedBaseFront,
        baseBackImage: resolvedBaseBack,
        printImage: c.printImageUrl?.trim() || c.imageUrl || null,
        printBackImage: c.printBackImageUrl?.trim() || c.backImageUrl || null,
        printLightFront: c.printLightFront?.trim() || null,
        printDarkFront: c.printDarkFront?.trim() || null,
        printLightBack: c.printLightBack?.trim() || null,
        printDarkBack: c.printDarkBack?.trim() || null,
        printWidth: Number(c.printWidth) || 45.0,
        printTop: Number(c.printTop) || 28.0,
        printLeft: Number(c.printLeft) || 50.0,
        printWidthBack: Number(c.printWidthBack) || 50.0,
        printTopBack: Number(c.printTopBack) || 25.0,
        printLeftBack: Number(c.printLeftBack) || 50.0,
        imageUrl: c.imageUrl,
        backImageUrl: c.backImageUrl || null,
        colors,
      });
    });

    return result;
  } catch (err) {
    console.error("Erro ao buscar produtos da Arara Virtual:", err);
    return [];
  }
}

/**
 * Busca itens do catálogo para a vitrine pública e para a área administrativa.
 */
export async function getCatalogItems(includeInactive = false) {
  try {
    const items = await prisma.catalogItem.findMany({
      where: includeInactive ? undefined : { isActive: true },
      include: {
        template: true,
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
  backImageUrl?: string;
  category?: string;
  showOnVirtualRack?: boolean;
  templateId?: string;
  baseShirtUrl?: string;
  baseShirtBackUrl?: string;
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
  variants?: VariantInput[];
}) {
  try {
    if (!data.title?.trim() || !data.imageUrl?.trim()) {
      return { success: false, error: "Título e Imagem principal do produto são obrigatórios." };
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
        backImageUrl: data.backImageUrl?.trim() || null,
        category: cleanCategory,
        showOnVirtualRack: Boolean(data.showOnVirtualRack),
        templateId: data.templateId?.trim() || null,
        baseShirtUrl: data.baseShirtUrl?.trim() || null,
        baseShirtBackUrl: data.baseShirtBackUrl?.trim() || null,
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
        isActive: true,
        variants: {
          create: validVariants.map((v) => ({
            colorName: v.colorName.trim(),
            hexCode: v.hexCode?.trim() || "#000000",
            printTheme: v.printTheme === "DARK" ? "DARK" : "LIGHT",
            imageUrl: v.imageUrl.trim(),
            backImageUrl: v.backImageUrl?.trim() || null,
          })),
        },
      },
      include: {
        template: true,
        variants: true,
      },
    });

    revalidatePath("/admin/vitrine");
    revalidatePath("/");
    return { success: true, item };
  } catch (err: any) {
    console.error("Erro ao cadastrar item do catálogo:", err);
    return {
      success: false,
      error: String(err?.message || "Erro ao cadastrar produto"),
    };
  }
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
    backImageUrl?: string;
    category?: string;
    showOnVirtualRack?: boolean;
    templateId?: string;
    baseShirtUrl?: string;
    baseShirtBackUrl?: string;
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
    variants?: VariantInput[];
  }
) {
  try {
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
              printTheme: v.printTheme === "DARK" ? "DARK" : "LIGHT",
              imageUrl: v.imageUrl.trim(),
              backImageUrl: v.backImageUrl?.trim() || null,
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
          imageUrl:
            data.imageUrl !== undefined && data.imageUrl.trim() !== ""
              ? data.imageUrl.trim()
              : undefined,
          backImageUrl:
            data.backImageUrl !== undefined ? (data.backImageUrl.trim() || null) : undefined,
          category: cleanCategory,
          showOnVirtualRack:
            data.showOnVirtualRack !== undefined ? Boolean(data.showOnVirtualRack) : undefined,
          templateId:
            data.templateId !== undefined ? (data.templateId.trim() || null) : undefined,
          baseShirtUrl:
            data.baseShirtUrl !== undefined ? (data.baseShirtUrl.trim() || null) : undefined,
          baseShirtBackUrl:
            data.baseShirtBackUrl !== undefined ? (data.baseShirtBackUrl.trim() || null) : undefined,
          printImageUrl:
            data.printImageUrl !== undefined ? (data.printImageUrl.trim() || null) : undefined,
          printBackImageUrl:
            data.printBackImageUrl !== undefined ? (data.printBackImageUrl.trim() || null) : undefined,
          printLightFront:
            data.printLightFront !== undefined ? (data.printLightFront.trim() || null) : undefined,
          printDarkFront:
            data.printDarkFront !== undefined ? (data.printDarkFront.trim() || null) : undefined,
          printLightBack:
            data.printLightBack !== undefined ? (data.printLightBack.trim() || null) : undefined,
          printDarkBack:
            data.printDarkBack !== undefined ? (data.printDarkBack.trim() || null) : undefined,
          printWidth: data.printWidth !== undefined ? Number(data.printWidth) : undefined,
          printTop: data.printTop !== undefined ? Number(data.printTop) : undefined,
          printLeft: data.printLeft !== undefined ? Number(data.printLeft) : undefined,
          printWidthBack: data.printWidthBack !== undefined ? Number(data.printWidthBack) : undefined,
          printTopBack: data.printTopBack !== undefined ? Number(data.printTopBack) : undefined,
          printLeftBack: data.printLeftBack !== undefined ? Number(data.printLeftBack) : undefined,
          isActive: data.isActive !== undefined ? data.isActive : undefined,
        },
        include: {
          template: true,
          variants: true,
        },
      });
    });

    revalidatePath("/admin/vitrine");
    revalidatePath("/");
    return { success: true, item };
  } catch (err: any) {
    console.error("Erro ao atualizar item do catálogo:", err);
    return {
      success: false,
      error: String(err?.message || "Erro ao atualizar item do catálogo"),
    };
  }
}

/**
 * Exclusão de item de catálogo.
 */
export async function deleteCatalogItem(id: string) {
  try {
    await prisma.catalogItem.delete({
      where: { id },
    });

    revalidatePath("/admin/vitrine");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error("Erro ao excluir item do catálogo:", err);
    return {
      success: false,
      error: String(err?.message || "Erro ao excluir item do catálogo"),
    };
  }
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
    `Olá Igor e Grazi! Gostaria de fazer um orçamento de camisetas personalizadas para a conferência/evento da nossa igreja na Cordeiro Ink.`
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

interface StorefrontOrderItemInput {
  title: string;
  colorName?: string;
  size?: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  productId?: string;
}

interface CreateStorefrontOrderInput {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress?: string;
  destinationCep?: string;
  shippingService?: string;
  shippingPrice?: number;
  deliveryDays?: number | string;
  items: StorefrontOrderItemInput[];
}


/**
 * Consulta o estoque atual de camisetas lisas por cor e tamanho para bloqueio na vitrine.
 */
export async function getBlankShirtsStock(): Promise<AvailableStockSize[]> {
  try {
    const rawItems = await prisma.rawItem.findMany({
      where: {
        type: RawItemType.BLANK_SHIRT,
      },
      select: {
        shirtColor: true,
        shirtSize: true,
        stockQuantity: true,
      },
    });
    return rawItems;
  } catch (err) {
    console.error("Erro ao buscar estoque de camisetas lisas:", err);
    return [];
  }
}

/**
 * Criação de pedido direto da vitrine pública (Checkout sem Gateway).
 * Salva o pedido no banco com status PENDING e retorna a URL padrão do WhatsApp com o resumo completo.
 */
export async function createStorefrontOrder(data: CreateStorefrontOrderInput) {
  if (!data.customerName?.trim() || !data.customerPhone?.trim()) {
    throw new Error("Por favor, preencha seu nome e WhatsApp para finalizar o pedido.");
  }

  if (!data.items || data.items.length === 0) {
    throw new Error("A sua sacola de compras está vazia.");
  }

  // 1. Validação estrita de disponibilidade de estoque antes de salvar o pedido
  for (const item of data.items) {
    if (item.size) {
      const colorRaw = (item.colorName || "").split(" ")[0].trim();
      const availableItems = await prisma.rawItem.findMany({
        where: {
          type: RawItemType.BLANK_SHIRT,
          shirtSize: { equals: item.size, mode: "insensitive" },
          ...(colorRaw
            ? {
                shirtColor: { contains: colorRaw, mode: "insensitive" },
              }
            : {}),
        },
        select: {
          stockQuantity: true,
          name: true,
        },
      });

      const totalStock = availableItems.reduce((acc, r) => acc + (r.stockQuantity || 0), 0);
      const requestedQty = Math.max(1, Number(item.quantity) || 1);

      // Se houver insumo cadastrado para esta combinação e o estoque for menor que o solicitado
      if (availableItems.length > 0 && totalStock < requestedQty) {
        throw new Error(
          `O tamanho "${item.size}" ${item.colorName ? `na cor ${item.colorName}` : ""} está esgotado no estoque do ateliê (disponível: ${totalStock}). Por favor, escolha outro tamanho ou cor.`
        );
      }
    }
  }

  const cleanPhone = data.customerPhone.replace(/\D/g, "");
  const subtotal = data.items.reduce(
    (acc, i) => acc + Number(i.price) * Math.max(1, Number(i.quantity) || 1),
    0
  );
  const shippingCost = Number(data.shippingPrice) || 0;
  const grandTotal = subtotal + shippingCost;

  // 2. Gerar número do pedido sequencial (#WPP-100X)
  const count = await prisma.order.count();
  const orderNumber = `#WPP-${1001 + count}`;

  // 3. Montar endereço completo com CEP
  let fullAddress = data.shippingAddress?.trim() || "";
  if (data.destinationCep?.trim()) {
    const cleanCep = data.destinationCep.replace(/\D/g, "");
    const formattedCep =
      cleanCep.length === 8 ? `${cleanCep.slice(0, 5)}-${cleanCep.slice(5)}` : cleanCep;
    if (fullAddress && !fullAddress.includes(formattedCep)) {
      fullAddress = `${fullAddress} (CEP: ${formattedCep})`;
    } else if (!fullAddress) {
      fullAddress = `CEP: ${formattedCep}`;
    }
  }

  // 4. Salva o pedido na tabela Order com status "PENDING"
  const order = await prisma.order.create({
    data: {
      orderNumber,
      channel: SalesChannel.WHATSAPP,
      status: OrderStatus.PENDING,
      customerName: data.customerName.trim(),
      customerPhone: cleanPhone || data.customerPhone.trim(),
      customerEmail: data.customerEmail?.trim() || null,
      shippingAddress: fullAddress || null,
      paymentMethod: "A COMBINAR (PIX)",
      totalProducts: subtotal,
      shippingCost,
      platformFee: 0,
      netAmount: subtotal,
      estimatedCMV: 0,
      netProfit: subtotal,
      notes: data.shippingService
        ? `Vitrine Online. Frete: ${data.shippingService} (${shippingCost > 0 ? `R$ ${shippingCost.toFixed(2).replace(".", ",")}` : "A combinar"}${
            data.deliveryDays
              ? typeof data.deliveryDays === "number" && data.deliveryDays > 0
                ? ` - ${data.deliveryDays} dias úteis`
                : ` - ${data.deliveryDays}`
              : ""
          })`
        : "Vitrine Online (Checkout WhatsApp)",
      paidAt: null, // Pagamento pendente
      items: {
        create: data.items.map((i) => ({
          title: `${i.title}${i.colorName ? ` - ${i.colorName}` : ""}${i.size ? ` (Tam ${i.size})` : ""}`,
          shirtColor: i.colorName || null,
          shirtSize: i.size || null,
          artTitle: i.title,
          artMockupUrl: i.imageUrl || null,
          quantity: Math.max(1, Number(i.quantity) || 1),
          unitPrice: Number(i.price),
          unitCost: 0,
          total: Number(i.price) * Math.max(1, Number(i.quantity) || 1),
        })),
      },
    },
    include: {
      items: true,
    },
  });

  revalidatePath("/pedidos");
  revalidatePath("/admin");
  revalidatePath("/");

  // 4. Montar mensagem estruturada para o WhatsApp
  const brandPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "5511999999999";

  let msg = `*NOVO PEDIDO ${orderNumber} — CORDEIRO INK ATELIÊ*\n\n`;
  msg += `Olá! Acabei de registrar meu pedido no site da Cordeiro Ink:\n\n`;
  msg += `👤 *Cliente:* ${data.customerName.trim()}\n`;
  msg += `📱 *WhatsApp:* ${data.customerPhone.trim()}\n`;
  if (fullAddress) {
    msg += `📍 *Endereço/CEP:* ${fullAddress}\n`;
  }
  msg += `\n📦 *Itens do Pedido:*\n`;
  data.items.forEach((item) => {
    const qty = Math.max(1, Number(item.quantity) || 1);
    const itemTotal = (Number(item.price) * qty).toFixed(2).replace(".", ",");
    msg += `▪ ${qty}x *${item.title}*\n`;
    if (item.colorName || item.size) {
      msg += `   ${item.colorName ? `Cor: ${item.colorName}` : ""}${item.colorName && item.size ? " | " : ""}${item.size ? `Tam: ${item.size}` : ""}\n`;
    }
    msg += `   Subtotal: R$ ${itemTotal}\n`;
  });

  msg += `\n--------------------------------\n`;
  msg += `*Subtotal Peças:* R$ ${subtotal.toFixed(2).replace(".", ",")}\n`;
  if (data.shippingService) {
    const costText = shippingCost > 0 ? `R$ ${shippingCost.toFixed(2).replace(".", ",")}` : "A combinar (R$ 0,00)";
    const daysText = data.deliveryDays
      ? typeof data.deliveryDays === "number" && data.deliveryDays > 0
        ? ` - ${data.deliveryDays} dias úteis`
        : ` - ${data.deliveryDays}`
      : "";
    msg += `*Frete Escolhido:* ${data.shippingService} (${costText}${daysText})\n`;
  } else {
    msg += `*Frete:* A combinar via WhatsApp\n`;
  }
  msg += `--------------------------------\n`;
  msg += `*VALOR TOTAL:* R$ ${grandTotal.toFixed(2).replace(".", ",")}\n\n`;
  msg += `Gostaria de combinar a forma de pagamento (PIX) para iniciar a confecção!`;

  const whatsappUrl = `https://wa.me/${brandPhone}?text=${encodeURIComponent(msg)}`;

  return {
    success: true,
    orderId: order.id,
    orderNumber: order.orderNumber,
    whatsappUrl,
    grandTotal,
  };
}

/**
 * -------------------------------------------------------------
 * GESTÃO DE BANNERS DA VITRINE (HOME CAROUSEL)
 * -------------------------------------------------------------
 */

export async function getStorefrontBanners(includeInactive = false) {
  try {
    return await prisma.storefrontBanner.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: [{ orderIndex: "asc" }, { createdAt: "desc" }],
    });
  } catch (err: any) {
    console.error("Erro ao buscar banners:", err);
    return [];
  }
}

export async function createStorefrontBanner(data: {
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  orderIndex?: number;
}) {
  try {
    const count = await prisma.storefrontBanner.count();
    const banner = await prisma.storefrontBanner.create({
      data: {
        title: data.title,
        subtitle: data.subtitle,
        imageUrl: data.imageUrl,
        linkUrl: data.linkUrl,
        orderIndex: data.orderIndex !== undefined ? data.orderIndex : count,
        isActive: true,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/vitrine");
    return { success: true, banner };
  } catch (err: any) {
    console.error("Erro ao criar banner:", err);
    return {
      success: false,
      error: String(err?.message || "Erro ao criar banner"),
    };
  }
}

export async function updateStorefrontBanner(
  id: string,
  data: {
    title?: string;
    subtitle?: string;
    imageUrl?: string;
    linkUrl?: string;
    orderIndex?: number;
    isActive?: boolean;
  }
) {
  try {
    const banner = await prisma.storefrontBanner.update({
      where: { id },
      data,
    });

    revalidatePath("/");
    revalidatePath("/admin/vitrine");
    return { success: true, banner };
  } catch (err: any) {
    console.error("Erro ao atualizar banner:", err);
    return {
      success: false,
      error: String(err?.message || "Erro ao atualizar banner"),
    };
  }
}

export async function deleteStorefrontBanner(id: string) {
  try {
    await prisma.storefrontBanner.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/admin/vitrine");
    return { success: true };
  } catch (err: any) {
    console.error("Erro ao excluir banner:", err);
    return {
      success: false,
      error: String(err?.message || "Erro ao excluir banner"),
    };
  }
}

export async function toggleStorefrontBannerActive(id: string, isActive: boolean) {
  try {
    const banner = await prisma.storefrontBanner.update({
      where: { id },
      data: { isActive },
    });

    revalidatePath("/");
    revalidatePath("/admin/vitrine");
    return { success: true, banner };
  } catch (err: any) {
    console.error("Erro ao alterar visibilidade do banner:", err);
    return {
      success: false,
      error: String(err?.message || "Erro ao alterar banner"),
    };
  }
}

