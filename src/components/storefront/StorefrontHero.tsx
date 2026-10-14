"use client";

import { ArrowDown, ArrowUpRight, Sparkles } from "lucide-react";

export function StorefrontHero() {
  return (
    <section className="relative overflow-hidden bg-[#F7F4EE] pt-12 pb-20 sm:pt-20 sm:pb-32 px-4 sm:px-6 lg:px-8 border-b border-[#E6DED2]/60">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-[#FAF9F6] to-transparent pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto text-center space-y-8 sm:space-y-10">
        {/* Subtle pill tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E6DED2]/60 border border-[#D5CABE] text-[#0A0A0A] text-[11px] font-sans font-semibold tracking-widest uppercase animate-in fade-in duration-500">
          <Sparkles size={12} className="text-[#0A0A0A]" />
          <span>Heavyweight Streetwear & On-Demand Printing</span>
        </div>

        {/* Editorial Heading in JUST Serif */}
        <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight text-[#0A0A0A] leading-[1.05] sm:leading-[1.02] text-balance">
          Vista sua <br className="hidden sm:inline" />
          <span className="italic font-normal">Identidade.</span>
        </h1>

        {/* Subtitle in Sora */}
        <p className="font-sans text-base sm:text-xl text-[#666666] max-w-2xl mx-auto leading-relaxed text-balance font-light">
          Camisetas oversized em malha pesada 100% algodão, caimento estruturado e tecnologia industrial de estampa DTF. Escolha do nosso catálogo ou crie sua peça sob encomenda.
        </p>

        {/* CTA Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#catalogo"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#0A0A0A] hover:bg-[#222222] text-[#F7F4EE] font-sans text-xs uppercase tracking-widest font-semibold transition-all shadow-md hover:shadow-xl cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Ver Coleção</span>
            <ArrowDown size={14} />
          </a>

          <a
            href="#personalizadas"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-transparent hover:bg-[#E6DED2]/50 text-[#0A0A0A] border border-[#0A0A0A]/40 hover:border-[#0A0A0A] font-sans text-xs uppercase tracking-widest font-semibold transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Criar Personalizada</span>
            <ArrowUpRight size={14} />
          </a>
        </div>

        {/* Pillars / Marquee bar */}
        <div className="pt-12 sm:pt-16 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-[#E6DED2] max-w-4xl mx-auto text-left">
          <div className="space-y-1">
            <span className="font-serif text-2xl font-bold text-[#0A0A0A]">260g/m²</span>
            <p className="font-sans text-[11px] uppercase tracking-wider text-[#737373] font-medium">
              Malha Heavyweight 100% Algodão
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-serif text-2xl font-bold text-[#0A0A0A]">Ultra HD</span>
            <p className="font-sans text-[11px] uppercase tracking-wider text-[#737373] font-medium">
              Estamparia DTF Industrial Térmica
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-serif text-2xl font-bold text-[#0A0A0A]">Street Fit</span>
            <p className="font-sans text-[11px] uppercase tracking-wider text-[#737373] font-medium">
              Modelagem Oversized com Gola de 3cm
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-serif text-2xl font-bold text-[#0A0A0A]">On-Demand</span>
            <p className="font-sans text-[11px] uppercase tracking-wider text-[#737373] font-medium">
              Prensagem Sob Demanda Sem Estoque Parado
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
