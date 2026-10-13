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
      // Fallback padrão se chamado em ambiente sem sessão ativa
      const defaultUser = await prisma.user.findFirst({
        where: { email: "mateus@cordeiroink.com.br" },
      });

      if (defaultUser) {
        return {
          id: defaultUser.id,
          supabaseUid: defaultUser.supabaseUid || undefined,
          email: defaultUser.email,
          name: defaultUser.name,
          role: defaultUser.role,
        };
      }

      return {
        id: "operador-sistema",
        email: "mateus@cordeiroink.com.br",
        name: "Mateus Cordeiro",
        role: "ADMIN",
      };
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
    return {
      id: "operador-sistema",
      email: "mateus@cordeiroink.com.br",
      name: "Mateus Cordeiro",
      role: "ADMIN",
    };
  }
}
