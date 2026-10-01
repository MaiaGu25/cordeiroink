import { PrismaClient, Role, RawItemType, SalesChannel, OrderStatus, JobPriority, PurchaseStatus, TransactionType, TransactionCategory } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Limpando banco de dados...");
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
  await prisma.supplier.deleteMany();
  await prisma.user.deleteMany();

  console.log("👤 Criando Usuários...");
  const adminUser = await prisma.user.create({
    data: {
      name: "Mateus Cordeiro",
      email: "mateus@cordeiroink.com.br",
      role: Role.ADMIN,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  });

  await prisma.user.createMany({
    data: [
      {
        name: "Lucas Operações",
        email: "lucas@cordeiroink.com.br",
        role: Role.PRODUCTION,
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      },
      {
        name: "Camila Finanças",
        email: "camila@cordeiroink.com.br",
        role: Role.FINANCIAL,
        avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      },
      {
        name: "Bruna Atendimento",
        email: "bruna@cordeiroink.com.br",
        role: Role.ATTENDANT,
        avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      },
    ],
  });

  console.log("🏭 Criando Fornecedores...");
  const supMalha = await prisma.supplier.create({
    data: {
      name: "Têxtil Menegotti",
      category: "Malhas e Camisetas Lisas",
      contactName: "Roberto Menegotti",
      whatsapp: "(11) 98123-4567",
      email: "contato@menegotti.com.br",
      leadTimeDays: 4,
    },
  });

  const supDtf = await prisma.supplier.create({
    data: {
      name: "DTF Master Print SP",
      category: "Impressão Têxtil DTF HD",
      contactName: "Fabio Impressões",
      whatsapp: "(11) 99876-5432",
      email: "pedidos@dtfmaster.com.br",
      leadTimeDays: 2,
    },
  });

  const supPack = await prisma.supplier.create({
    data: {
      name: "Pack & Box Embalagens",
      category: "Sacos Zip e Caixas Kraft",
      contactName: "Fernanda Embalagens",
      whatsapp: "(11) 97711-2233",
      email: "comercial@packbox.com.br",
      leadTimeDays: 3,
    },
  });

  const supTags = await prisma.supplier.create({
    data: {
      name: "Alpha Tags & Brindes",
      category: "Tags Kraft e Adesivos Vinil",
      contactName: "Juliana Artes",
      whatsapp: "(11) 96543-2109",
      email: "alpha@alphatags.com.br",
      leadTimeDays: 5,
    },
  });

  console.log("📦 Criando Insumos / Matéria-prima (RawItems)...");
  // Camisetas Lisas
  const shirtOversizedBlackP = await prisma.rawItem.create({
    data: {
      sku: "RAW-SHIRT-OVER-BLK-P",
      name: "Camiseta Streetwear Oversized 26.1 - Preto P",
      type: RawItemType.BLANK_SHIRT,
      shirtModel: "Streetwear Oversized 26.1",
      shirtColor: "Preto",
      shirtSize: "P",
      stockQuantity: 18,
      minStock: 15,
      costPrice: 24.50,
      supplierId: supMalha.id,
    },
  });

  const shirtOversizedBlackM = await prisma.rawItem.create({
    data: {
      sku: "RAW-SHIRT-OVER-BLK-M",
      name: "Camiseta Streetwear Oversized 26.1 - Preto M",
      type: RawItemType.BLANK_SHIRT,
      shirtModel: "Streetwear Oversized 26.1",
      shirtColor: "Preto",
      shirtSize: "M",
      stockQuantity: 42,
      minStock: 25,
      costPrice: 24.50,
      supplierId: supMalha.id,
    },
  });

  const shirtOversizedBlackG = await prisma.rawItem.create({
    data: {
      sku: "RAW-SHIRT-OVER-BLK-G",
      name: "Camiseta Streetwear Oversized 26.1 - Preto G",
      type: RawItemType.BLANK_SHIRT,
      shirtModel: "Streetwear Oversized 26.1",
      shirtColor: "Preto",
      shirtSize: "G",
      stockQuantity: 8, // ALERTA: abaixo do mínimo
      minStock: 20,
      costPrice: 24.50,
      supplierId: supMalha.id,
    },
  });

  const shirtOversizedBlackGG = await prisma.rawItem.create({
    data: {
      sku: "RAW-SHIRT-OVER-BLK-GG",
      name: "Camiseta Streetwear Oversized 26.1 - Preto GG",
      type: RawItemType.BLANK_SHIRT,
      shirtModel: "Streetwear Oversized 26.1",
      shirtColor: "Preto",
      shirtSize: "GG",
      stockQuantity: 15,
      minStock: 12,
      costPrice: 26.00,
      supplierId: supMalha.id,
    },
  });

  const shirtOversizedOffwhiteM = await prisma.rawItem.create({
    data: {
      sku: "RAW-SHIRT-OVER-OFF-M",
      name: "Camiseta Streetwear Oversized 26.1 - Off-White M",
      type: RawItemType.BLANK_SHIRT,
      shirtModel: "Streetwear Oversized 26.1",
      shirtColor: "Off-White",
      shirtSize: "M",
      stockQuantity: 28,
      minStock: 20,
      costPrice: 24.50,
      supplierId: supMalha.id,
    },
  });

  const shirtOversizedOffwhiteG = await prisma.rawItem.create({
    data: {
      sku: "RAW-SHIRT-OVER-OFF-G",
      name: "Camiseta Streetwear Oversized 26.1 - Off-White G",
      type: RawItemType.BLANK_SHIRT,
      shirtModel: "Streetwear Oversized 26.1",
      shirtColor: "Off-White",
      shirtSize: "G",
      stockQuantity: 5, // ALERTA CRÍTICO
      minStock: 15,
      costPrice: 24.50,
      supplierId: supMalha.id,
    },
  });

  const shirtOversizedBrownM = await prisma.rawItem.create({
    data: {
      sku: "RAW-SHIRT-OVER-BRN-M",
      name: "Camiseta Streetwear Oversized 26.1 - Marrom Cacau M",
      type: RawItemType.BLANK_SHIRT,
      shirtModel: "Streetwear Oversized 26.1",
      shirtColor: "Marrom Cacau",
      shirtSize: "M",
      stockQuantity: 14,
      minStock: 10,
      costPrice: 25.50,
      supplierId: supMalha.id,
    },
  });

  // Estampas DTF
  const dtfCyberOni = await prisma.rawItem.create({
    data: {
      sku: "RAW-DTF-CYBER-ONI",
      name: "Estampa DTF Têxtil - Oni Samurai Cyberpunk",
      type: RawItemType.DTF_PRINT,
      dtfCode: "ART-CYBER-01",
      dtfPrintSize: "A3 (30x42cm)",
      dtfPreviewUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80",
      dtfSupplier: "DTF Master Print SP",
      stockQuantity: 34,
      minStock: 20,
      costPrice: 13.90,
      supplierId: supDtf.id,
    },
  });

  const dtfTokyoDrift = await prisma.rawItem.create({
    data: {
      sku: "RAW-DTF-TOKYO-DRIFT",
      name: "Estampa DTF Têxtil - Tokyo Drift Katakana",
      type: RawItemType.DTF_PRINT,
      dtfCode: "ART-TOKYO-02",
      dtfPrintSize: "A3 (30x42cm)",
      dtfPreviewUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=80",
      dtfSupplier: "DTF Master Print SP",
      stockQuantity: 4, // CRÍTICO
      minStock: 15,
      costPrice: 13.90,
      supplierId: supDtf.id,
    },
  });

  const dtfSkullRose = await prisma.rawItem.create({
    data: {
      sku: "RAW-DTF-SKULL-ROSE",
      name: "Estampa DTF Têxtil - Skull & Botanical Rose",
      type: RawItemType.DTF_PRINT,
      dtfCode: "ART-SKULL-03",
      dtfPrintSize: "A4 (21x30cm)",
      dtfPreviewUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80",
      dtfSupplier: "DTF Master Print SP",
      stockQuantity: 22,
      minStock: 15,
      costPrice: 10.50,
      supplierId: supDtf.id,
    },
  });

  const dtfDragonAcid = await prisma.rawItem.create({
    data: {
      sku: "RAW-DTF-DRAGON-ACID",
      name: "Estampa DTF Têxtil - Eastern Dragon Acid Wash",
      type: RawItemType.DTF_PRINT,
      dtfCode: "ART-DRAGON-04",
      dtfPrintSize: "A3 (30x42cm)",
      dtfPreviewUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80",
      dtfSupplier: "DTF Master Print SP",
      stockQuantity: 19,
      minStock: 10,
      costPrice: 13.90,
      supplierId: supDtf.id,
    },
  });

  // Embalagens, Tags e Brindes
  const packagingZip = await prisma.rawItem.create({
    data: {
      sku: "RAW-PACK-ZIP-FROSTED",
      name: "Saco Zip Lock Fosco 30x40cm Cordeiro Ink",
      type: RawItemType.PACKAGING,
      stockQuantity: 280,
      minStock: 80,
      costPrice: 1.85,
      supplierId: supPack.id,
    },
  });

  const tagKraft = await prisma.rawItem.create({
    data: {
      sku: "RAW-TAG-KRAFT-SISAL",
      name: "Tag Kraft 300g com Cordão de Sisal",
      type: RawItemType.LABEL,
      stockQuantity: 340,
      minStock: 100,
      costPrice: 0.65,
      supplierId: supTags.id,
    },
  });

  const giftSticker = await prisma.rawItem.create({
    data: {
      sku: "RAW-GIFT-STICKER-HOLO",
      name: "Adesivo Holográfico Colecionável Cordeiro Ink",
      type: RawItemType.GIFT,
      stockQuantity: 410,
      minStock: 100,
      costPrice: 0.50,
      supplierId: supTags.id,
    },
  });

  console.log("👕 Criando Catálogo de Produtos e Variantes...");
  // 1. Produto Cyberpunk Oni
  const prodCyberOni = await prisma.product.create({
    data: {
      skuBase: "INK-OVER-CYBER",
      name: "Camiseta Oversized Cyberpunk Oni",
      category: "Streetwear",
      collection: "Drop Neo-Tokyo 2026",
      targetMargin: 58.0,
      imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&auto=format&fit=crop&q=80",
      description: "Modelagem streetwear ampla e encorpada (26.1 penteado). Estampa DTF em altíssima resolução com toque suave e alta durabilidade.",
      variants: {
        create: [
          { sku: "INK-CYBER-BLK-P", title: "P / Preto", size: "P", color: "Preto", basePrice: 99.90 },
          { sku: "INK-CYBER-BLK-M", title: "M / Preto", size: "M", color: "Preto", basePrice: 99.90 },
          { sku: "INK-CYBER-BLK-G", title: "G / Preto", size: "G", color: "Preto", basePrice: 99.90 },
          { sku: "INK-CYBER-BLK-GG", title: "GG / Preto", size: "GG", color: "Preto", basePrice: 104.90 },
        ],
      },
    },
    include: { variants: true },
  });

  // 2. Produto Tokyo Drift
  const prodTokyo = await prisma.product.create({
    data: {
      skuBase: "INK-OVER-TOKYO",
      name: "Camiseta Oversized Tokyo Drift Katakana",
      category: "Streetwear",
      collection: "Drop JDM & Midnight",
      targetMargin: 55.0,
      imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80",
      description: "Estética automotiva japonesa em malha premium off-white e preta com corte boxy streetwear.",
      variants: {
        create: [
          { sku: "INK-TOKYO-OFF-M", title: "M / Off-White", size: "M", color: "Off-White", basePrice: 94.90 },
          { sku: "INK-TOKYO-OFF-G", title: "G / Off-White", size: "G", color: "Off-White", basePrice: 94.90 },
          { sku: "INK-TOKYO-BLK-M", title: "M / Preto", size: "M", color: "Preto", basePrice: 94.90 },
        ],
      },
    },
    include: { variants: true },
  });

  // 3. Produto Skull & Roses
  const prodSkull = await prisma.product.create({
    data: {
      skuBase: "INK-OVER-SKULL",
      name: "Camiseta Oversized Skull & Botanical",
      category: "Streetwear",
      collection: "Linha Essenciais Dark",
      targetMargin: 56.0,
      imageUrl: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&auto=format&fit=crop&q=80",
      description: "Arte gótica botânica em estampa frontal A4 com detalhes micro-definidos.",
      variants: {
        create: [
          { sku: "INK-SKULL-BLK-P", title: "P / Preto", size: "P", color: "Preto", basePrice: 89.90 },
          { sku: "INK-SKULL-BLK-M", title: "M / Preto", size: "M", color: "Preto", basePrice: 89.90 },
          { sku: "INK-SKULL-BLK-G", title: "G / Preto", size: "G", color: "Preto", basePrice: 89.90 },
        ],
      },
    },
    include: { variants: true },
  });

  // 4. Produto Eastern Dragon Acid
  const prodDragon = await prisma.product.create({
    data: {
      skuBase: "INK-OVER-DRAGON",
      name: "Camiseta Oversized Eastern Dragon",
      category: "Streetwear",
      collection: "Drop Vintage Myth",
      targetMargin: 60.0,
      imageUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format&fit=crop&q=80",
      description: "Tons terrosos em marrom cacau com dragão oriental estilizado nas costas.",
      variants: {
        create: [
          { sku: "INK-DRAGON-BRN-M", title: "M / Marrom Cacau", size: "M", color: "Marrom Cacau", basePrice: 109.90 },
        ],
      },
    },
    include: { variants: true },
  });

  console.log("🔗 Criando Fichas Técnicas (ProductBOM)...");
  // Montando BOM para variantes do Cyberpunk Oni
  const cyberM = prodCyberOni.variants.find((v) => v.sku === "INK-CYBER-BLK-M")!;
  const cyberP = prodCyberOni.variants.find((v) => v.sku === "INK-CYBER-BLK-P")!;
  const cyberG = prodCyberOni.variants.find((v) => v.sku === "INK-CYBER-BLK-G")!;

  for (const variant of [cyberM, cyberP, cyberG]) {
    const shirtRaw = variant.sku.includes("-M") ? shirtOversizedBlackM : variant.sku.includes("-P") ? shirtOversizedBlackP : shirtOversizedBlackG;
    await prisma.productBOM.createMany({
      data: [
        { variantId: variant.id, rawItemId: shirtRaw.id, quantity: 1, notes: "Malha 26.1 Penteada" },
        { variantId: variant.id, rawItemId: dtfCyberOni.id, quantity: 1, notes: "Frente A3 Centralizada" },
        { variantId: variant.id, rawItemId: packagingZip.id, quantity: 1, notes: "Embalagem individual" },
        { variantId: variant.id, rawItemId: tagKraft.id, quantity: 1, notes: "Tag presa na gola" },
        { variantId: variant.id, rawItemId: giftSticker.id, quantity: 1, notes: "1x brinde colecionável" },
      ],
    });
  }

  // BOM para Tokyo Drift
  const tokyoOffM = prodTokyo.variants.find((v) => v.sku === "INK-TOKYO-OFF-M")!;
  const tokyoOffG = prodTokyo.variants.find((v) => v.sku === "INK-TOKYO-OFF-G")!;
  for (const variant of [tokyoOffM, tokyoOffG]) {
    const shirtRaw = variant.sku.includes("-M") ? shirtOversizedOffwhiteM : shirtOversizedOffwhiteG;
    await prisma.productBOM.createMany({
      data: [
        { variantId: variant.id, rawItemId: shirtRaw.id, quantity: 1, notes: "Malha 26.1 Off-White" },
        { variantId: variant.id, rawItemId: dtfTokyoDrift.id, quantity: 1, notes: "Costas A3 + Peito Katakana" },
        { variantId: variant.id, rawItemId: packagingZip.id, quantity: 1, notes: "Embalagem individual" },
        { variantId: variant.id, rawItemId: tagKraft.id, quantity: 1, notes: "Tag com sisal" },
        { variantId: variant.id, rawItemId: giftSticker.id, quantity: 1, notes: "Brinde adesivo" },
      ],
    });
  }

  // BOM para Skull & Roses
  const skullBlkM = prodSkull.variants.find((v) => v.sku === "INK-SKULL-BLK-M")!;
  await prisma.productBOM.createMany({
    data: [
      { variantId: skullBlkM.id, rawItemId: shirtOversizedBlackM.id, quantity: 1, notes: "Malha 26.1 Preto" },
      { variantId: skullBlkM.id, rawItemId: dtfSkullRose.id, quantity: 1, notes: "Estampa A4 Frontal" },
      { variantId: skullBlkM.id, rawItemId: packagingZip.id, quantity: 1, notes: "Embalagem" },
      { variantId: skullBlkM.id, rawItemId: tagKraft.id, quantity: 1, notes: "Tag" },
    ],
  });

  console.log("🛒 Criando Pedidos e Fila de Produção...");
  // Pedido 1: Shopee - IN_PRODUCTION
  const order1 = await prisma.order.create({
    data: {
      orderNumber: "SHP-2026-98101",
      channel: SalesChannel.SHOPEE,
      status: OrderStatus.IN_PRODUCTION,
      customerName: "Gabriel Siqueira",
      customerEmail: "gabriel.siq@gmail.com",
      customerPhone: "(11) 98765-4321",
      shippingAddress: "Rua Augusta, 1420, Apto 82 - Consolação, São Paulo - SP",
      totalProducts: 99.90,
      shippingCost: 15.00,
      platformFee: 19.98, // ~20% Shopee
      netAmount: 79.92,
      estimatedCMV: 41.40, // 24.50 + 13.90 + 1.85 + 0.65 + 0.50
      netProfit: 38.52,
      notes: "Cliente pediu envio rápido para aniversário no fim de semana.",
      paidAt: new Date(Date.now() - 3 * 3600 * 1000),
      items: {
        create: [
          {
            variantId: cyberM.id,
            quantity: 1,
            unitPrice: 99.90,
            unitCost: 41.40,
            total: 99.90,
          },
        ],
      },
      productionJob: {
        create: {
          priority: JobPriority.URGENT,
          stepBlankPicked: true,
          stepDtfPicked: true,
          stepPressed: false,
          stepQcPassed: false,
          stepPacked: false,
          stepCompleted: false,
          assignedTo: "Lucas Operações",
          notes: "Camiseta preta M já separada. DTF recortado. Fila da prensa #1.",
          startedAt: new Date(Date.now() - 2 * 3600 * 1000),
        },
      },
    },
  });

  // Pedido 2: TikTok Shop - WAITING_PRODUCTION
  const order2 = await prisma.order.create({
    data: {
      orderNumber: "TT-5501924-BR",
      channel: SalesChannel.TIKTOK,
      status: OrderStatus.WAITING_PRODUCTION,
      customerName: "Isabela Fontes",
      customerEmail: "isa.fontes@outlook.com",
      shippingAddress: "Av. Copacabana, 500 - Rio de Janeiro - RJ",
      totalProducts: 94.90,
      shippingCost: 0.00,
      platformFee: 14.23, // ~15% TikTok
      netAmount: 80.67,
      estimatedCMV: 41.40,
      netProfit: 39.27,
      notes: "Veio do vídeo viral da estampa Katakana Off-White.",
      paidAt: new Date(Date.now() - 5 * 3600 * 1000),
      items: {
        create: [
          {
            variantId: tokyoOffM.id,
            quantity: 1,
            unitPrice: 94.90,
            unitCost: 41.40,
            total: 94.90,
          },
        ],
      },
      productionJob: {
        create: {
          priority: JobPriority.NORMAL,
          stepBlankPicked: false,
          stepDtfPicked: false,
          stepPressed: false,
          stepQcPassed: false,
          stepPacked: false,
          stepCompleted: false,
          notes: "Aguardando operador liberar prensa.",
        },
      },
    },
  });

  // Pedido 3: Shein - READY (Pronto para Expedição)
  const order3 = await prisma.order.create({
    data: {
      orderNumber: "SHN-BR-883011",
      channel: SalesChannel.SHEIN,
      status: OrderStatus.READY,
      customerName: "Thiago Medeiros",
      customerEmail: "thiagomedeiros@yahoo.com",
      shippingAddress: "Rua das Laranjeiras, 300 - Curitiba - PR",
      totalProducts: 89.90,
      shippingCost: 12.00,
      platformFee: 16.18, // 18% Shein
      netAmount: 73.72,
      estimatedCMV: 37.50,
      netProfit: 36.22,
      paidAt: new Date(Date.now() - 24 * 3600 * 1000),
      items: {
        create: [
          {
            variantId: skullBlkM.id,
            quantity: 1,
            unitPrice: 89.90,
            unitCost: 37.50,
            total: 89.90,
          },
        ],
      },
      productionJob: {
        create: {
          priority: JobPriority.NORMAL,
          stepBlankPicked: true,
          stepDtfPicked: true,
          stepPressed: true,
          stepQcPassed: true,
          stepPacked: true,
          stepCompleted: true,
          stockDeducted: true,
          assignedTo: "Lucas Operações",
          notes: "Embalado com tag e saco zip fosco. Pronto para coleta dos Correios.",
          startedAt: new Date(Date.now() - 10 * 3600 * 1000),
          completedAt: new Date(Date.now() - 1 * 3600 * 1000),
        },
      },
    },
  });

  // Pedido 4: Venda Direta WhatsApp (MANUAL) - SHIPPED
  const order4 = await prisma.order.create({
    data: {
      orderNumber: "CI-DIR-1049",
      channel: SalesChannel.MANUAL,
      status: OrderStatus.SHIPPED,
      customerName: "Renan Vasconcelos",
      customerEmail: "renan.vasc@empresa.com",
      customerPhone: "(31) 99122-3344",
      shippingAddress: "Rua Sergipe, 88 - Belo Horizonte - MG",
      totalProducts: 199.80, // 2 camisetas
      shippingCost: 20.00,
      platformFee: 0.00, // 0% taxa de marketplace! Venda direta Pix!
      netAmount: 199.80,
      estimatedCMV: 82.80,
      netProfit: 117.00, // Alta margem!
      paidAt: new Date(Date.now() - 48 * 3600 * 1000),
      shippedAt: new Date(Date.now() - 12 * 3600 * 1000),
      notes: "Pago via Pix com 5% de desconto. Rastreador: QB123456789BR",
      items: {
        create: [
          {
            variantId: cyberM.id,
            quantity: 1,
            unitPrice: 99.90,
            unitCost: 41.40,
            total: 99.90,
          },
          {
            variantId: cyberG.id,
            quantity: 1,
            unitPrice: 99.90,
            unitCost: 41.40,
            total: 99.90,
          },
        ],
      },
    },
  });

  // Pedido 5: Shopee - PAID (Aguardando Fila de Produção)
  const order5 = await prisma.order.create({
    data: {
      orderNumber: "SHP-2026-98244",
      channel: SalesChannel.SHOPEE,
      status: OrderStatus.PAID,
      customerName: "Larissa Dornelles",
      customerEmail: "larissa.dornelles@gmail.com",
      shippingAddress: "Av. Bento Gonçalves, 120 - Porto Alegre - RS",
      totalProducts: 94.90,
      shippingCost: 18.00,
      platformFee: 18.98,
      netAmount: 75.92,
      estimatedCMV: 41.40,
      netProfit: 34.52,
      paidAt: new Date(Date.now() - 1 * 3600 * 1000),
      items: {
        create: [
          {
            variantId: tokyoOffG.id,
            quantity: 1,
            unitPrice: 94.90,
            unitCost: 41.40,
            total: 94.90,
          },
        ],
      },
      productionJob: {
        create: {
          priority: JobPriority.NORMAL,
          notes: "Criado automaticamente após aprovação do pagamento.",
        },
      },
    },
  });

  // Pedido 6: Shein - DELIVERED
  const order6 = await prisma.order.create({
    data: {
      orderNumber: "SHN-BR-879942",
      channel: SalesChannel.SHEIN,
      status: OrderStatus.DELIVERED,
      customerName: "Rodrigo Alcantara",
      customerEmail: "rodrigo.alcantara@hotmail.com",
      shippingAddress: "Rua do Sol, 45 - Salvador - BA",
      totalProducts: 99.90,
      platformFee: 17.98,
      netAmount: 81.92,
      estimatedCMV: 41.40,
      netProfit: 40.52,
      paidAt: new Date(Date.now() - 7 * 24 * 3600 * 1000),
      shippedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000),
      items: {
        create: [
          {
            variantId: cyberP.id,
            quantity: 1,
            unitPrice: 99.90,
            unitCost: 41.40,
            total: 99.90,
          },
        ],
      },
    },
  });

  console.log("📑 Criando Compras e Reposições...");
  // Compra 1: Recebida
  const po1 = await prisma.purchaseOrder.create({
    data: {
      orderCode: "PO-2026-008",
      supplierId: supDtf.id,
      status: PurchaseStatus.RECEIVED,
      totalCost: 1390.00,
      notes: "Lote de 100 estampas DTF A3 Oni Cyberpunk e Tokyo Drift.",
      orderedAt: new Date(Date.now() - 15 * 24 * 3600 * 1000),
      receivedAt: new Date(Date.now() - 13 * 24 * 3600 * 1000),
      items: {
        create: [
          { rawItemId: dtfCyberOni.id, quantity: 50, unitCost: 13.90, totalCost: 695.00 },
          { rawItemId: dtfTokyoDrift.id, quantity: 50, unitCost: 13.90, totalCost: 695.00 },
        ],
      },
    },
  });

  // Compra 2: Em Trânsito / Ordered
  await prisma.purchaseOrder.create({
    data: {
      orderCode: "PO-2026-011",
      supplierId: supMalha.id,
      status: PurchaseStatus.ORDERED,
      totalCost: 2450.00,
      notes: "Reposição de 100 camisetas lisas Oversized 26.1 (Preto e Off-White).",
      orderedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      items: {
        create: [
          { rawItemId: shirtOversizedBlackG.id, quantity: 50, unitCost: 24.50, totalCost: 1225.00 },
          { rawItemId: shirtOversizedOffwhiteG.id, quantity: 50, unitCost: 24.50, totalCost: 1225.00 },
        ],
      },
    },
  });

  console.log("💰 Criando Transações Financeiras (DRE do Mês)...");
  await prisma.financialTransaction.createMany({
    data: [
      {
        type: TransactionType.INCOME,
        category: TransactionCategory.SALES_ORDER,
        amount: 3850.00,
        description: "Repasse Líquido Shopee (Ciclo Quinzenal 1)",
        date: new Date(Date.now() - 10 * 24 * 3600 * 1000),
      },
      {
        type: TransactionType.INCOME,
        category: TransactionCategory.SALES_ORDER,
        amount: 2940.50,
        description: "Repasse Líquido Shein Marketplace",
        date: new Date(Date.now() - 5 * 24 * 3600 * 1000),
      },
      {
        type: TransactionType.INCOME,
        category: TransactionCategory.SALES_ORDER,
        amount: 1820.00,
        description: "Recebimentos Pix - Vendas Diretas WhatsApp & Instagram",
        date: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      },
      {
        type: TransactionType.EXPENSE,
        category: TransactionCategory.RAW_MATERIALS,
        amount: 2450.00,
        description: "Compra Camisetas Lisas 26.1 - Menegotti (PO-2026-011)",
        date: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      },
      {
        type: TransactionType.EXPENSE,
        category: TransactionCategory.RAW_MATERIALS,
        amount: 1390.00,
        description: "Lote Impressões DTF A3 Master Print (PO-2026-008)",
        date: new Date(Date.now() - 13 * 24 * 3600 * 1000),
      },
      {
        type: TransactionType.EXPENSE,
        category: TransactionCategory.PACKAGING_SUPPLIES,
        amount: 480.00,
        description: "Sacos Zip Fosco + Tags Kraft Alpha (Lote 300un)",
        date: new Date(Date.now() - 18 * 24 * 3600 * 1000),
      },
      {
        type: TransactionType.EXPENSE,
        category: TransactionCategory.OPERATIONAL,
        amount: 350.00,
        description: "Energia Elétrica Ateliê & Prensas Térmicas",
        date: new Date(Date.now() - 8 * 24 * 3600 * 1000),
      },
      {
        type: TransactionType.EXPENSE,
        category: TransactionCategory.MARKETING,
        amount: 600.00,
        description: "Campanha TikTok Ads - Drops Streetwear",
        date: new Date(Date.now() - 6 * 24 * 3600 * 1000),
      },
    ],
  });

  console.log("📝 Criando Logs de Auditoria Iniciais...");
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: "DATABASE_INITIALIZED",
      entity: "System",
      entityId: "SYSTEM-INIT",
      newPayload: JSON.stringify({ message: "Seed inicial do Cordeiro Ink Hub executado com sucesso." }),
    },
  });

  console.log("✅ Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
