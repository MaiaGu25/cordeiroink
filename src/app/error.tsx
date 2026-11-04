"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home, MessageCircle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log do erro de forma controlada no console do cliente
    console.error("Erro capturado pelo Error Boundary:", error);
  }, [error]);

  const brandPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "5511917446969";

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#0A0A0A] flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-[#FAF9F6] border border-[#E6DED2] rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center mx-auto">
          <AlertCircle size={28} />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#737373] font-bold">
            Cordeiro Ink • Ateliê
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A] tracking-tight">
            Algo inesperado aconteceu
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#666666] leading-relaxed font-light">
            Não se preocupe, seus dados e sacola estão seguros. Ocorreu uma instabilidade temporária ao carregar esta página.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2.5">
          <button
            onClick={() => reset()}
            className="w-full py-3 rounded-full bg-[#0A0A0A] hover:bg-[#222222] text-[#F7F4EE] font-sans text-xs uppercase tracking-wider font-semibold transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Tentar Novamente</span>
          </button>

          <Link
            href="/"
            className="w-full py-2.5 rounded-full bg-transparent hover:bg-[#E6DED2]/50 text-[#0A0A0A] border border-[#0A0A0A]/20 font-sans text-xs uppercase tracking-wider font-semibold transition flex items-center justify-center gap-2 cursor-pointer text-center"
          >
            <Home size={14} />
            <span>Voltar ao Início</span>
          </Link>

          <a
            href={`https://wa.me/${brandPhone}?text=${encodeURIComponent("Olá! Ocorreu um erro enquanto eu navegava na loja Cordeiro Ink e gostaria de ajuda.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-sans text-[#737373] hover:text-[#0A0A0A] transition flex items-center justify-center gap-1.5 pt-1"
          >
            <MessageCircle size={13} />
            <span>Falar com o suporte no WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
