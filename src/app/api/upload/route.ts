import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import fs from "fs/promises";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const targetFolder =
      (formData.get("folder") as string) === "artes-clientes"
        ? "artes-clientes"
        : "estampas";

    // Nome único e seguro para o arquivo
    const ext = path.extname(file.name).toLowerCase() || ".png";
    const rawBaseName = path.basename(file.name, ext);
    const safeBaseName = rawBaseName.replace(/[^a-zA-Z0-9_-]/g, "").substring(0, 30) || "arte";
    const fileName = `${safeBaseName}-${Date.now()}${ext}`;

    // 1. Upload para Supabase Storage (Produção / Vercel)
    const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "")
      .replace(/\/rest\/v1\/?$/, "")
      .replace(/\/$/, "");
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const storagePath = `${targetFolder}/${fileName}`;
        const contentType = file.type || "image/png";

        // Garante que o bucket 'estampas' exista se service role key estiver disponível
        if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
          try {
            const { data: buckets } = await supabase.storage.listBuckets();
            const hasBucket = buckets?.some((b) => b.name === "estampas");
            if (!hasBucket) {
              await supabase.storage.createBucket("estampas", { public: true });
            }
          } catch (bucketErr) {
            console.warn("Aviso ao verificar bucket 'estampas':", bucketErr);
          }
        }

        const { data, error } = await supabase.storage
          .from("estampas")
          .upload(storagePath, buffer, {
            contentType,
            upsert: true,
          });

        if (!error) {
          // Obtém a URL pública permanente
          const { data: publicUrlData } = supabase.storage
            .from("estampas")
            .getPublicUrl(storagePath);

          return NextResponse.json({
            url: publicUrlData.publicUrl,
            fileName,
          });
        }

        console.warn("Falha no upload para o Supabase Storage, aplicando fallback local:", error.message);
      } catch (uploadCatchErr: any) {
        console.warn("Erro ao comunicar com Supabase Storage, aplicando fallback local:", uploadCatchErr?.message);
      }
    }

    // 2. Fallback para ambiente local se as variáveis do Supabase não estiverem definidas
    console.warn(
      "NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY não configurados. Salvando localmente em public/uploads/"
    );
    const uploadDir = path.join(process.cwd(), "public", "uploads", targetFolder);
    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);

    const relativeUrl = `/uploads/${targetFolder}/${fileName}`;
    return NextResponse.json({ url: relativeUrl, fileName });
  } catch (err: any) {
    console.error("Erro ao realizar upload de estampa:", err);
    return NextResponse.json(
      { error: "Erro ao processar upload: " + (err.message || "Erro interno") },
      { status: 500 }
    );
  }
}
