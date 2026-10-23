import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export interface CurrentUser {
  id: string;
  supabaseUid?: string;
  email: string;
  name: string;
  role: string;
}

export async function getCurrentUser(): Promise<CurrentUser> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      // Fallback dinâmico: busca o primeiro usuário cadastrado ou operador genérico
      const firstUser = await prisma.user.findFirst();

      if (firstUser) {
        return {
          id: firstUser.id,
          supabaseUid: firstUser.supabaseUid || undefined,
          email: firstUser.email,
          name: firstUser.name,
          role: firstUser.role,
        };
      }

      try {
        let systemUser = await prisma.user.findUnique({
          where: { email: "operador@cordeiroink.com.br" },
        });

        if (!systemUser) {
          systemUser = await prisma.user.create({
            data: {
              email: "operador@cordeiroink.com.br",
              name: "Operador do Ateliê",
              role: "ADMIN",
            },
          });
        }

        return {
          id: systemUser.id,
          supabaseUid: systemUser.supabaseUid || undefined,
          email: systemUser.email,
          name: systemUser.name,
          role: systemUser.role,
        };
      } catch {
        // Se houver falha de escrita temporária, retorna o fallback seguro
        return {
          id: "operador-sistema",
          email: "operador@cordeiroink.com.br",
          name: "Operador do Ateliê",
          role: "ADMIN",
        };
      }
    }

    // Busca usuário no banco pelo supabaseUid ou e-mail
    let dbUser = await prisma.user.findFirst({
      where: {
        OR: [{ supabaseUid: user.id }, { email: user.email }],
      },
    });

    if (!dbUser) {
      // Cria o registro no banco interno caso ainda não exista
      const name =
        user.user_metadata?.name ||
        user.user_metadata?.full_name ||
        user.email.split("@")[0];

      dbUser = await prisma.user.create({
        data: {
          supabaseUid: user.id,
          email: user.email,
          name,
          role: "ADMIN",
        },
      });
    } else if (!dbUser.supabaseUid) {
      // Atualiza o supabaseUid para linkagem futura
      dbUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: { supabaseUid: user.id },
      });
    }

    return {
      id: dbUser.id,
      supabaseUid: user.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
    };
  } catch (error) {
    console.error("Erro ao obter usuário autenticado:", error);
    const firstUser = await prisma.user.findFirst().catch(() => null);
    if (firstUser) {
      return {
        id: firstUser.id,
        supabaseUid: firstUser.supabaseUid || undefined,
        email: firstUser.email,
        name: firstUser.name,
        role: firstUser.role,
      };
    }
    return {
      id: "operador-sistema",
      email: "operador@cordeiroink.com.br",
      name: "Operador do Ateliê",
      role: "ADMIN",
    };
  }
}

export function getAuditUserId(user?: { id?: string | null } | null): string | null {
  if (!user?.id || user.id === "operador-sistema") return null;
  return user.id;
}

