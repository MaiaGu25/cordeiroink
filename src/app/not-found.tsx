import Link from "next/link";
import { ArrowLeft, Home, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#0A0A0A] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-[#FAF9F6] border border-[#E6DED2] rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-[#0A0A0A] text-[#F7F4EE] flex items-center justify-center mx-auto shadow-md">
          <Compass size={28} />
        </div>

        <div className="space-y-2">
          <span className="text-4xl sm:text-5xl font-serif font-bold text-[#0A0A0A] block">
            404
          </span>
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#0A0A0A]">
            Página Não Encontrada
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#737373] font-light leading-relaxed">
            O endereço que você tentou acessar não existe ou foi movido para uma nova rota.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#0A0A0A] hover:bg-[#222222] text-[#F7F4EE] font-sans text-xs uppercase tracking-wider font-semibold transition flex items-center justify-center gap-2 shadow"
          >
            <Home size={14} />
            <span>Início</span>
          </Link>

          <Link
            href="/#catalogo"
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-transparent hover:bg-[#E6DED2]/50 text-[#0A0A0A] border border-[#0A0A0A]/30 font-sans text-xs uppercase tracking-wider font-semibold transition flex items-center justify-center gap-2"
          >
            <ArrowLeft size={14} />
            <span>Ver Catálogo</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
