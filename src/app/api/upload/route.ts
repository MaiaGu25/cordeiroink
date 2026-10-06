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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const storagePath = `${targetFolder}/${fileName}`;
      const contentType = file.type || "image/png";

      const { data, error } = await supabase.storage
        .from("estampas")
        .upload(storagePath, buffer, {
          contentType,
          upsert: true,
        });

      if (error) {
        console.error("Erro no Supabase Storage:", error);
        return NextResponse.json(
          {
            error: `Erro ao enviar para o Supabase Storage: ${error.message}. Verifique se o bucket 'estampas' foi criado e está público.`,
          },
          { status: 500 }
        );
      }

      // Obtém a URL pública permanente
      const { data: publicUrlData } = supabase.storage
        .from("estampas")
        .getPublicUrl(storagePath);

      return NextResponse.json({
        url: publicUrlData.publicUrl,
        fileName,
      });
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
