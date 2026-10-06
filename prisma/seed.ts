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
  await prisma.user.create({
    data: {
      name: "Mateus Cordeiro",
      email: "mateus@cordeiroink.com.br",
      role: Role.ADMIN,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  });

  console.log("✅ Banco 100% zerado e pronto para inserção de dados reais!");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
