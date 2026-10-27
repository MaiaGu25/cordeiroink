const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    const policies = await prisma.$queryRawUnsafe(`
      SELECT polname, polcmd, polroles::regrole[] 
      FROM pg_policy 
      WHERE polrelid = 'storage.objects'::regclass
    `);
    console.log("Storage Policies:", policies);

    // Garante que o bucket 'storefront' seja público
    await prisma.$executeRawUnsafe(`
      UPDATE storage.buckets SET public = true WHERE name IN ('storefront', 'estampas');
    `);

    // Cria política de insert público/anon caso não exista para os buckets storefront e estampas
    try {
      await prisma.$executeRawUnsafe(`
        CREATE POLICY "Allow public insert to storefront" 
        ON storage.objects FOR INSERT 
        WITH CHECK (bucket_id IN ('storefront', 'estampas'));
      `);
      console.log("Criada política de insert público para storefront e estampas.");
    } catch (polErr) {
      console.log("Política de insert já existente ou:", polErr.message);
    }

    try {
      await prisma.$executeRawUnsafe(`
        CREATE POLICY "Allow public select from storefront" 
        ON storage.objects FOR SELECT 
        USING (bucket_id IN ('storefront', 'estampas'));
      `);
      console.log("Criada política de select público para storefront e estampas.");
    } catch (polErr) {
      console.log("Política de select já existente ou:", polErr.message);
    }

    console.log("Configuração de storage no Supabase concluída com sucesso!");
  } catch (err) {
    console.error("Erro ao verificar políticas de storage:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
