import { NextRequest, NextResponse } from "next/server";
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

    // Garante que o diretório public/uploads/estampas existe
    const uploadDir = path.join(process.cwd(), "public", "uploads", "estampas");
    await fs.mkdir(uploadDir, { recursive: true });

    // Nome único e seguro para a estampa
    const ext = path.extname(file.name).toLowerCase() || ".png";
    const rawBaseName = path.basename(file.name, ext);
    const safeBaseName = rawBaseName.replace(/[^a-zA-Z0-9_-]/g, "").substring(0, 25) || "estampa";
    const fileName = `${safeBaseName}-${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, fileName);

    await fs.writeFile(filePath, buffer);

    // Caminho relativo para renderização direta via Next.js public folder
    const relativeUrl = `/uploads/estampas/${fileName}`;

    return NextResponse.json({ url: relativeUrl, fileName });
  } catch (err: any) {
    console.error("Erro ao realizar upload de estampa:", err);
    return NextResponse.json(
      { error: "Erro ao processar upload: " + (err.message || "Erro interno") },
      { status: 500 }
    );
  }
}
