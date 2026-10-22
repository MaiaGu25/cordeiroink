"use client";

import { Heart, Sparkles, Flame, ArrowUpRight } from "lucide-react";

export function AboutSection() {
  const brandPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "5511917446969";

  return (
    <section id="sobre" className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-[#F2ECE1]/50 border-t border-[#E6DED2]">
      <div className="max-w-6xl mx-auto space-y-12 sm:space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E6DED2] text-[#0A0A0A] text-[10px] font-sans font-semibold uppercase tracking-widest">
            <Heart size={11} className="text-red-600 fill-red-600" />
            <span>O Coração do Nosso Ateliê</span>
          </div>

          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#0A0A0A] leading-tight">
            Prazer, nós somos a <br className="hidden sm:inline" />
            <span className="italic font-normal">Cordeiro Ink!</span>
          </h2>

          <p className="font-sans text-base sm:text-lg text-[#4A4A4A] leading-relaxed font-light text-balance pt-2">
            Somos o Igor e a Grazi, apaixonados por Jesus Cristo, pelo evangelho e pela criatividade. O nosso maior desejo é evangelizar pessoas, e esse é o coração do nosso ateliê. Criamos peças para quem entende que a fé também é identidade. Vista aquilo que você carrega.
          </p>
        </div>

        {/* 3 Pillars / Values Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-8 rounded-3xl bg-[#FAF9F6] border border-[#E6DED2] space-y-3 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-2xl bg-[#0A0A0A] text-[#F7F4EE] flex items-center justify-center">
              <Flame size={18} />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#0A0A0A]">
              Evangelho em Ação
            </h3>
            <p className="font-sans text-xs text-[#737373] leading-relaxed font-light">
              Acreditamos que uma estampa tem o poder de gerar conversas profundas, transformar ambientes e apontar para a graça de Jesus onde quer que você vá.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[#FAF9F6] border border-[#E6DED2] space-y-3 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-2xl bg-[#0A0A0A] text-[#F7F4EE] flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#0A0A0A]">
              Streetwear Autêntico
            </h3>
            <p className="font-sans text-xs text-[#737373] leading-relaxed font-light">
              Nossas peças combinam estética streetwear contemporânea, malha pesada 100% algodão 260g/m² e caimento estruturado com gola canelada de 3cm.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[#FAF9F6] border border-[#E6DED2] space-y-3 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-2xl bg-[#0A0A0A] text-[#F7F4EE] flex items-center justify-center">
              <Heart size={18} />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#0A0A0A]">
              Feito com Amor & Oração
            </h3>
            <p className="font-sans text-xs text-[#737373] leading-relaxed font-light">
              Cada pedido é preparado com acabamento artesanal e prensagem térmica profissional. Um trabalho feito com carinho pelo Igor e pela Grazi para você.
            </p>
          </div>
        </div>

        {/* Direct Action Banner */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#0A0A0A] text-[#F7F4EE] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center sm:text-left">
            <span className="font-sans text-[11px] uppercase tracking-widest text-[#A0988A] font-semibold block">
              Converse com a Gente
            </span>
            <h4 className="font-serif text-2xl sm:text-3xl font-bold text-[#FAF9F6]">
              Quer conhecer mais do nosso propósito?
            </h4>
            <p className="font-sans text-xs text-[#888888] font-light max-w-md">
              Fale diretamente conosco no WhatsApp. Adoramos compartilhar o coração da Cordeiro Ink.
            </p>
          </div>

          <a
            href={`https://wa.me/${brandPhone}?text=${encodeURIComponent(
              "Olá Igor e Grazi! Conheci a Cordeiro Ink pelo site e amei o propósito de vocês."
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3.5 rounded-full bg-[#FAF9F6] hover:bg-white text-[#0A0A0A] font-sans text-xs uppercase tracking-widest font-bold flex items-center gap-2 transition shrink-0 shadow hover:shadow-lg"
          >
            <span>Falar com o Igor & Grazi • (11) 91744-6969</span>
            <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
