"use client";

import Link from "next/link";
import { ArrowDown, ArrowUpRight, Sparkles } from "lucide-react";

export function StorefrontHero() {
  return (
    <section className="relative overflow-hidden bg-[#F7F4EE] pt-8 pb-10 sm:pt-12 sm:pb-14 px-4 sm:px-6 lg:px-8 border-b border-[#E6DED2]/60">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-64 bg-gradient-to-b from-[#FAF9F6] to-transparent pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-6 min-w-0 break-words">
        {/* Subtle pill tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6DED2]/60 border border-[#D5CABE] text-[#0A0A0A] text-[10px] font-sans font-semibold tracking-wider uppercase max-w-full">
          <Sparkles size={11} className="text-[#0A0A0A] shrink-0" />
          <span className="truncate">Streetwear Cristão & Evangelho em Cada Peça</span>
        </div>

        {/* Editorial Heading in JUST Serif */}
        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#0A0A0A] leading-tight text-balance break-words">
          Vista um <span className="italic font-normal">propósito.</span>
        </h1>

        {/* Subtitle in Sora */}
        <p className="font-sans text-xs sm:text-sm md:text-base text-[#666666] max-w-xl mx-auto leading-relaxed text-balance font-light break-words">
          Streetwear cristão com malha pesada e acabamento premium. Peças feitas para evangelizar, inspirar e marcar presença.
        </p>

        {/* CTA Buttons */}
        <div className="pt-1 sm:pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 max-w-md sm:max-w-none mx-auto">
          <a
            href="#catalogo"
            className="w-full sm:w-auto px-6 py-2.5 sm:py-3 rounded-full bg-[#0A0A0A] hover:bg-[#222222] text-[#F7F4EE] font-sans text-xs uppercase tracking-wider font-semibold transition-all shadow-sm hover:shadow cursor-pointer flex items-center justify-center gap-2 text-center"
          >
            <span>Ver Coleção</span>
            <ArrowDown size={13} className="shrink-0" />
          </a>

          <Link
            href="/eventos-b2b"
            className="w-full sm:w-auto px-6 py-2.5 sm:py-3 rounded-full bg-transparent hover:bg-[#E6DED2]/50 text-[#0A0A0A] border border-[#0A0A0A]/30 hover:border-[#0A0A0A] font-sans text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 text-center"
          >
            <span>Eventos B2B</span>
            <ArrowUpRight size={13} className="shrink-0" />
          </Link>
        </div>

        {/* Compact Pillars / Marquee bar */}
        <div className="pt-6 sm:pt-8 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 border-t border-[#E6DED2] max-w-3xl mx-auto text-left">
          <div className="space-y-0.5 min-w-0">
            <span className="font-serif text-base sm:text-lg font-bold text-[#0A0A0A] block">260g/m²</span>
            <p className="font-sans text-[10px] sm:text-[11px] uppercase tracking-wider text-[#737373] font-medium break-words">
              Heavyweight 100% Algodão
            </p>
          </div>

          <div className="space-y-0.5 min-w-0">
            <span className="font-serif text-base sm:text-lg font-bold text-[#0A0A0A] block">Ultra HD</span>
            <p className="font-sans text-[10px] sm:text-[11px] uppercase tracking-wider text-[#737373] font-medium break-words">
              Estamparia DTF Industrial
            </p>
          </div>

          <div className="space-y-0.5 min-w-0">
            <span className="font-serif text-base sm:text-lg font-bold text-[#0A0A0A] block">Street Fit</span>
            <p className="font-sans text-[10px] sm:text-[11px] uppercase tracking-wider text-[#737373] font-medium break-words">
              Modelagem Autoral Ampla
            </p>
          </div>

          <div className="space-y-0.5 min-w-0">
            <span className="font-serif text-base sm:text-lg font-bold text-[#0A0A0A] block">Com Propósito</span>
            <p className="font-sans text-[10px] sm:text-[11px] uppercase tracking-wider text-[#737373] font-medium break-words">
              Evangelho em Cada Peça
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
