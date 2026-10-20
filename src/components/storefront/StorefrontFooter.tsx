import Link from "next/link";
import { Lock, ArrowUpRight } from "lucide-react";

export function StorefrontFooter() {
  const brandPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "5511999999999";

  return (
    <footer className="bg-[#0A0A0A] text-[#FAF9F6] py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-[#1C1C1C]">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          {/* Brand Column */}
          <div className="md:col-span-6 space-y-3">
            <span className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#FAF9F6] uppercase block">
              Cordeiro Ink
            </span>
            <p className="font-sans text-xs uppercase tracking-[0.2em] text-[#D5CABE] font-bold">
              🐑 DELE. POR ELE. PARA ELE.
            </p>
            <p className="font-sans text-xs sm:text-sm text-[#888888] font-light max-w-md leading-relaxed pt-1">
              Ateliê de streetwear cristão criado pelo Igor e pela Grazi. Peças em malha pesada 100% algodão, corte autoral e estamparia industrial para quem entende que a fé também é identidade. Vista um propósito.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 space-y-3 font-sans">
            <h5 className="text-[11px] uppercase tracking-widest font-semibold text-[#CCCCCC]">
              Navegação
            </h5>
            <ul className="space-y-2 text-xs text-[#888888]">
              <li>
                <a href="#catalogo" className="hover:text-white transition">
                  Coleção de Drops
                </a>
              </li>
              <li>
                <a href="#sobre" className="hover:text-white transition">
                  Quem Somos (O Ateliê)
                </a>
              </li>
              <li>
                <a href="#personalizadas" className="hover:text-white transition">
                  Camisetas para Eventos & Igrejas
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${brandPhone}?text=${encodeURIComponent("Olá Igor e Grazi! Gostaria de falar com o atendimento da Cordeiro Ink.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition flex items-center gap-1"
                >
                  <span>Atendimento no WhatsApp</span>
                  <ArrowUpRight size={12} />
                </a>
              </li>
            </ul>
          </div>

          {/* Internal Access */}
          <div className="md:col-span-3 space-y-3 font-sans">
            <h5 className="text-[11px] uppercase tracking-widest font-semibold text-[#CCCCCC]">
              Operação Interna
            </h5>
            <p className="text-xs text-[#737373] font-light leading-relaxed">
              Área restrita de gestão de pedidos, fila de prensagem térmica e estoque de insumos.
            </p>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#171717] hover:bg-[#222222] text-[#CCCCCC] hover:text-white text-xs border border-[#262626] transition"
            >
              <Lock size={12} />
              <span>Painel do Ateliê (ERP)</span>
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#1C1C1C] flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-xs text-[#555555]">
          <p>© {new Date().getFullYear()} Cordeiro Ink. Todos os direitos reservados.</p>
          <p className="tracking-widest uppercase text-[10px]">
            Designed for Authenticity & Heavyweight Culture.
          </p>
        </div>
      </div>
    </footer>
  );
}
