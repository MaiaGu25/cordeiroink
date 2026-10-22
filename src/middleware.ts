import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Libera webhooks externos (Mercado Pago, Melhor Envio, etc.) sem exigir login
  if (pathname.startsWith("/api/webhooks")) {
    return NextResponse.next();
  }

  // 2. Mantém a proteção de sessão do Supabase para o restante do site
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Intercepta tudo exceto:
     * - _next/static e _next/image
     * - favicon.ico e imagens estáticas
     * - rotas de webhooks públicos (/api/webhooks/...)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};