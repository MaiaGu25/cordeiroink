import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import fs from "fs/promises";

export const dynamic = "force-dynamic";

/**
 * Responde requisições GET para verificação de status e evitar respostas HTML 405.
 */
export async function GET() {
  return NextResponse.json({
    status: "online",
    endpoint: "/api/upload",
    acceptedMethods: ["POST"],
  });
}

/**
 * Rota universal de upload de arquivos para a Arara Virtual, Catálogo e Estampas.
 * Toda a lógica é encapsulada em try/catch e o retorno é ESTRITAMENTE JSON.
 */
export async function POST(req: NextRequest) {
  try {
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (parseError: any) {
      return NextResponse.json(
        { error: "Falha ao processar arquivo multipart: " + (parseError?.message || "Corpo inválido") },
        { status: 400 }
      );
    }

    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado no corpo da requisição." },
        { status: 400 }
      );
    }

    const rawFolder = (formData.get("folder") as string) || "mockups";
    // Sanitiza a pasta de destino
    const safeFolder = rawFolder.replace(/[^a-zA-Z0-9_-]/g, "") || "mockups";

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Formata o nome do arquivo para padrão seguro
    const ext = path.extname(file.name).toLowerCase() || ".png";
    const rawBaseName = path.basename(file.name, ext);
    const safeBaseName =
      rawBaseName.replace(/[^a-zA-Z0-9_-]/g, "").substring(0, 30) || "upload";
    const fileName = `${safeBaseName}-${Date.now()}${ext}`;

    // Decide o bucket ideal (storefront para mockups, prints, catalog; estampas para estampas de clientes)
    const isStorefrontAsset = ["mockups", "prints", "catalog", "banners"].includes(
      safeFolder
    );
    const targetBucket = isStorefrontAsset ? "storefront" : "estampas";
    const storagePath = `${safeFolder}/${fileName}`;
    const contentType = file.type || "image/png";

    // 1. Tentar upload para o Supabase Storage
    const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "")
      .replace(/\/rest\/v1\/?$/, "")
      .replace(/\/$/, "");
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        // Garante a existência do bucket se tiver service_role key
        if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
          try {
            const { data: buckets } = await supabase.storage.listBuckets();
            const exists = buckets?.some((b) => b.name === targetBucket);
            if (!exists) {
              await supabase.storage.createBucket(targetBucket, { public: true });
            }
          } catch (bErr: any) {
            console.warn(`Aviso ao checar bucket '${targetBucket}':`, bErr?.message);
          }
        }

        const { data, error } = await supabase.storage
          .from(targetBucket)
          .upload(storagePath, buffer, {
            contentType,
            upsert: true,
          });

        if (!error && data) {
          const { data: publicUrlData } = supabase.storage
            .from(targetBucket)
            .getPublicUrl(storagePath);

          return NextResponse.json({
            success: true,
            url: publicUrlData.publicUrl,
            fileName,
            bucket: targetBucket,
          });
        }

        console.warn(
          `Falha no upload para o Supabase Storage (bucket: ${targetBucket}), aplicando fallback local:`,
          error?.message
        );
      } catch (supabaseErr: any) {
        console.warn(
          "Exceção ao comunicar com Supabase Storage, aplicando fallback local:",
          supabaseErr?.message
        );
      }
    }

    // 2. Fallback de salvamento local seguro em public/uploads/
    try {
      const localSubDir = isStorefrontAsset
        ? path.join("storefront", safeFolder)
        : safeFolder;
      const uploadDir = path.join(process.cwd(), "public", "uploads", localSubDir);
      await fs.mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, fileName);
      await fs.writeFile(filePath, buffer);

      const relativeUrl = `/uploads/${localSubDir.replace(/\\/g, "/")}/${fileName}`;
      return NextResponse.json({
        success: true,
        url: relativeUrl,
        fileName,
        storage: "local",
      });
    } catch (fsErr: any) {
      console.error("Erro no fallback de armazenamento local:", fsErr);
      return NextResponse.json(
        {
          error: "Falha ao gravar arquivo localmente: " + (fsErr?.message || String(fsErr)),
        },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error("Erro global no endpoint de upload:", err);
    return NextResponse.json(
      {
        error: err?.message || "Erro inesperado ao processar upload",
      },
      { status: 500 }
    );
  }
}
