"use client";

import { Quote, Sparkles } from "lucide-react";

export function BrandQuoteBanner() {
  return (
    <section className="relative overflow-hidden bg-[#0A0A0A] text-[#F7F4EE] py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-y border-[#262626]">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 border border-white/10 text-[#F7F4EE] mx-auto shadow-inner">
          <Quote size={20} className="text-[#D5CABE]" />
        </div>

        <blockquote className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal italic tracking-tight leading-snug sm:leading-relaxed text-[#FAF9F6] text-balance">
          &ldquo;Queremos levar a mensagem de Jesus através daquilo que criamos, mostrando que a moda também pode ser instrumento de evangelho, amor e transformação.&rdquo;
        </blockquote>

        <div className="pt-2 flex items-center justify-center gap-2">
          <span className="w-6 h-px bg-white/20" />
          <span className="font-sans text-[11px] uppercase tracking-[0.25em] text-[#A0988A] font-semibold">
            Cordeiro Ink • Vista um Propósito
          </span>
          <span className="w-6 h-px bg-white/20" />
        </div>
      </div>
    </section>
  );
}
