import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Libera imediatamente /api/upload e APIs públicas sem passar pelo middleware de sessão/redirecionamento
  if (
    pathname.startsWith("/api/upload") ||
    pathname.startsWith("/api/webhooks") ||
    pathname.startsWith("/api/checkout") ||
    pathname.startsWith("/api/orders")
  ) {
    return NextResponse.next();
  }

  // 2. Mantém a proteção de sessão do Supabase para o restante do site com tratamento de erro
  try {
    return await updateSession(request);
  } catch (err) {
    console.error("Erro no middleware updateSession:", err);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Intercepta tudo exceto:
     * - _next/static e _next/image
     * - favicon.ico e imagens estáticas
     * - rotas públicas de upload e webhooks (/api/upload, /api/webhooks/...)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/upload|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};