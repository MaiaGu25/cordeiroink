import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase com permissões de administrador (Service Role).
 * ATENÇÃO DE SEGURANÇA:
 * Este cliente NUNCA deve ser importado em componentes com "use client"
 * nem executado no navegador. Ele deve ser utilizado exclusivamente no servidor
 * (Server Actions, Route Handlers, scripts de migração).
 */
export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error(
      "Violação de segurança: createAdminClient não pode ser executado no navegador!"
    );
  }

  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "")
    .replace(/\/rest\/v1\/?$/, "")
    .replace(/\/$/, "");

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY não está configurada nas variáveis de ambiente do servidor."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
