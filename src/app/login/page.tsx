"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2, Lock, Mail, ShieldCheck, ArrowRight, UserPlus } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Por favor, preencha seu e-mail e senha.");
      return;
    }

    setIsLoading(true);
    const supabase = createClient();

    try {
      if (isSignUp) {
        // Cadastro do primeiro acesso
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              name: name.trim() || email.split("@")[0],
            },
          },
        });

        if (error) throw error;

        if (data.session) {
          toast.success("Conta criada e sessão iniciada com sucesso!");
          router.push("/");
          router.refresh();
        } else {
          toast.success(
            "Conta criada! Verifique seu e-mail para confirmação se necessário, ou tente efetuar login."
          );
          setIsSignUp(false);
        }
      } else {
        // Login com persistência de sessão em cookies seguros
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            throw new Error("E-mail ou senha incorretos.");
          }
          throw error;
        }

        toast.success("Login realizado com sucesso! Bem-vindo ao Hub.");
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      console.error("Erro de autenticação:", err);
      toast.error(err.message || "Falha ao realizar autenticação.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Background radial glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 text-amber-400 font-black text-xl shadow-lg shadow-black/40 mb-2">
            CI
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center justify-center gap-2">
            <span>CORDEIRO INK</span>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-amber-400 border border-zinc-700">
              HUB V2
            </span>
          </h1>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
            Sistema Operacional e Gestão de Estamparia On-Demand
          </p>
        </div>

        {/* Card Form */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>{isSignUp ? "Primeiro Acesso / Criar Conta" : "Acesso Restrito"}</span>
            </h2>
            <span className="text-[10px] font-mono text-zinc-500">
              Sessão Persistente
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {isSignUp && (
              <div>
                <label className="block text-zinc-400 mb-1.5 font-medium">
                  Seu Nome
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ex: Seu Nome Completo"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-zinc-400 mb-1.5 font-medium">
                E-mail
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@cordeiroink.com.br"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 transition-colors font-mono text-xs"
                />
                <Mail
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1.5 font-medium">
                Senha
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 transition-colors font-mono text-xs"
                />
                <Lock
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-md hover:shadow-amber-500/20 cursor-pointer active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : isSignUp ? (
                <>
                  <UserPlus size={15} />
                  <span>Cadastrar e Acessar</span>
                </>
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Toggle between Login and Sign Up */}
          <div className="pt-2 border-t border-zinc-800/60 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[11px] text-zinc-400 hover:text-amber-400 transition"
            >
              {isSignUp
                ? "Já tem uma conta? Clique para entrar."
                : "Primeiro acesso da equipe? Crie sua conta aqui."}
            </button>
          </div>
        </div>

        {/* Security badge footer */}
        <p className="text-[11px] text-center text-zinc-600 font-mono">
          Autenticação criptografada com cookies HttpOnly seguros
        </p>
      </div>
    </div>
  );
}
