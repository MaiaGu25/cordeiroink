import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "")
    .replace(/\/rest\/v1\/?$/, "")
    .replace(/\/$/, "");
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (typeof window !== "undefined" && supabaseAnonKey.startsWith("sb_secret_")) {
    console.error(
      "ERRO CRÍTICO: Uma chave secreta ('sb_secret_...') foi informada em NEXT_PUBLIC_SUPABASE_ANON_KEY. No navegador use estritamente a chave pública anon ('sb_publishable_...')."
    );
  }

  return createBrowserClient(
    supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey
  );
}
