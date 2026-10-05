import { PrismaClient, Role, RawItemType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Limpando dados mockados anteriores...");
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

  console.log("👤 Cadastrando Usuário Administrador Principal...");
  const adminUser = await prisma.user.create({
    data: {
      name: "Mateus Cordeiro",
      email: "mateus@cordeiroink.com.br",
      role: Role.ADMIN,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  });

  console.log("🏭 Cadastrando Fornecedores Padrão da Estamparia...");
  const supMalha = await prisma.supplier.create({
    data: {
      name: "Têxtil Menegotti",
      category: "Malhas e Camisetas Lisas",
      contactName: "Roberto",
      whatsapp: "(11) 98123-4567",
      email: "contato@menegotti.com.br",
      leadTimeDays: 4,
    },
  });

  const supDtf = await prisma.supplier.create({
    data: {
      name: "Birô DTF Express",
      category: "Impressão Têxtil DTF",
      contactName: "Fabio",
      whatsapp: "(11) 99876-5432",
      email: "pedidos@dtfexpress.com.br",
      leadTimeDays: 2,
    },
  });

  const supPack = await prisma.supplier.create({
    data: {
      name: "Embalagens & Tags",
      category: "Sacos Zip, Tags e Envelopes",
      contactName: "Fernanda",
      whatsapp: "(11) 97711-2233",
      email: "comercial@embalagens.com.br",
      leadTimeDays: 3,
    },
  });

  console.log("📦 Cadastrando Estrutura Básica de Insumos para Entrada de Estoque Real...");
  
  // 1. Grade de Camisetas Lisas (Oversized 26.1 e Casual 30.1)
  const blankShirts = [
    // Oversized Preto
    { sku: "RAW-SHIRT-OVER-BLK-P", name: "Camiseta Oversized 26.1 - Preto P", model: "Streetwear Oversized 26.1", color: "Preto", size: "P", cost: 24.50, min: 5 },
    { sku: "RAW-SHIRT-OVER-BLK-M", name: "Camiseta Oversized 26.1 - Preto M", model: "Streetwear Oversized 26.1", color: "Preto", size: "M", cost: 24.50, min: 10 },
    { sku: "RAW-SHIRT-OVER-BLK-G", name: "Camiseta Oversized 26.1 - Preto G", model: "Streetwear Oversized 26.1", color: "Preto", size: "G", cost: 24.50, min: 10 },
    { sku: "RAW-SHIRT-OVER-BLK-GG", name: "Camiseta Oversized 26.1 - Preto GG", model: "Streetwear Oversized 26.1", color: "Preto", size: "GG", cost: 26.00, min: 5 },
    // Oversized Off-White
    { sku: "RAW-SHIRT-OVER-OFF-P", name: "Camiseta Oversized 26.1 - Off-White P", model: "Streetwear Oversized 26.1", color: "Off-White", size: "P", cost: 24.50, min: 5 },
    { sku: "RAW-SHIRT-OVER-OFF-M", name: "Camiseta Oversized 26.1 - Off-White M", model: "Streetwear Oversized 26.1", color: "Off-White", size: "M", cost: 24.50, min: 10 },
    { sku: "RAW-SHIRT-OVER-OFF-G", name: "Camiseta Oversized 26.1 - Off-White G", model: "Streetwear Oversized 26.1", color: "Off-White", size: "G", cost: 24.50, min: 10 },
    { sku: "RAW-SHIRT-OVER-OFF-GG", name: "Camiseta Oversized 26.1 - Off-White GG", model: "Streetwear Oversized 26.1", color: "Off-White", size: "GG", cost: 26.00, min: 5 },
    // Casual 30.1 Preto
    { sku: "RAW-SHIRT-CAS-BLK-P", name: "Camiseta Casual 30.1 - Preto P", model: "Casual 30.1 Penteada", color: "Preto", size: "P", cost: 21.00, min: 5 },
    { sku: "RAW-SHIRT-CAS-BLK-M", name: "Camiseta Casual 30.1 - Preto M", model: "Casual 30.1 Penteada", color: "Preto", size: "M", cost: 21.00, min: 10 },
    { sku: "RAW-SHIRT-CAS-BLK-G", name: "Camiseta Casual 30.1 - Preto G", model: "Casual 30.1 Penteada", color: "Preto", size: "G", cost: 21.00, min: 10 },
    { sku: "RAW-SHIRT-CAS-BLK-GG", name: "Camiseta Casual 30.1 - Preto GG", model: "Casual 30.1 Penteada", color: "Preto", size: "GG", cost: 22.50, min: 5 },
  ];

  for (const shirt of blankShirts) {
    await prisma.rawItem.create({
      data: {
        sku: shirt.sku,
        name: shirt.name,
        type: RawItemType.BLANK_SHIRT,
        shirtModel: shirt.model,
        shirtColor: shirt.color,
        shirtSize: shirt.size,
        costPrice: shirt.cost,
        stockQuantity: 0, // Pronto para contagem real
        minStock: shirt.min,
        supplierId: supMalha.id,
      },
    });
  }

  // 2. Folhas DTF Têxtil Padrão
  const dtfItems = [
    { sku: "RAW-DTF-A3", name: "Folha Impressão DTF A3 (30x42cm)", code: "DTF-A3", size: "A3 (30x42cm)", cost: 13.90, min: 10 },
    { sku: "RAW-DTF-A4", name: "Folha Impressão DTF A4 (21x30cm)", code: "DTF-A4", size: "A4 (21x30cm)", cost: 9.50, min: 10 },
    { sku: "RAW-DTF-POCKET", name: "Folha Impressão DTF Bolso (10x10cm)", code: "DTF-BOLSO", size: "Bolso (10x10cm)", cost: 4.50, min: 15 },
  ];

  for (const dtf of dtfItems) {
    await prisma.rawItem.create({
      data: {
        sku: dtf.sku,
        name: dtf.name,
        type: RawItemType.DTF_PRINT,
        dtfCode: dtf.code,
        dtfPrintSize: dtf.size,
        dtfSupplier: "Birô DTF Express",
        costPrice: dtf.cost,
        stockQuantity: 0,
        minStock: dtf.min,
        supplierId: supDtf.id,
      },
    });
  }

  // 3. Embalagens e Etiquetas
  const packagingItems = [
    { sku: "RAW-PACK-ZIP", name: "Saco Zip Lock Fosco 30x40cm", type: RawItemType.PACKAGING, cost: 1.85, min: 50 },
    { sku: "RAW-TAG-KRAFT", name: "Tag Kraft com Cordão de Sisal", type: RawItemType.LABEL, cost: 0.65, min: 50 },
    { sku: "RAW-GIFT-STICKER", name: "Adesivo Colecionável (Brinde)", type: RawItemType.GIFT, cost: 0.50, min: 50 },
  ];

  for (const pack of packagingItems) {
    await prisma.rawItem.create({
      data: {
        sku: pack.sku,
        name: pack.name,
        type: pack.type,
        costPrice: pack.cost,
        stockQuantity: 0,
        minStock: pack.min,
        supplierId: supPack.id,
      },
    });
  }

  console.log("📝 Registrando Log de Inicialização do Sistema...");
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: "PRODUCTION_ENV_READY",
      entity: "System",
      entityId: "SYSTEM-PROD",
      newPayload: JSON.stringify({
        message: "Banco de produção inicializado com sucesso. Zero dados falsos.",
        timestamp: new Date().toISOString(),
      }),
    },
  });

  console.log("✅ Banco pronto para produção real com estoque zerado e estrutura configurada!");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
