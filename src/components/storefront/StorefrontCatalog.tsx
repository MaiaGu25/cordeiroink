"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { MessageCircle, ArrowUpRight, Sparkles } from "lucide-react";

interface CatalogItem {
  id: string;
  title: string;
  description: string | null;
  price: number;
  imageUrl: string;
  category: string;
  isActive: boolean;
}

interface StorefrontCatalogProps {
  items: CatalogItem[];
}

// Peças de demonstração de alta costura streetwear caso o catálogo do banco ainda esteja vazio
const PLACEHOLDER_ITEMS: CatalogItem[] = [
  {
    id: "sample-1",
    title: "Blessed Heritage Heavyweight Tee",
    category: "Oversized 26.1",
    price: 149.9,
    description: "Modelagem streetwear autoral em malha 100% algodão 260gsm. Estampa frontal minimalista em DTF de alta precisão.",
    imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop",
    isActive: true,
  },
  {
    id: "sample-2",
    title: "Nocturnal Wolf Cyberpunk Tee",
    category: "Oversized Streetwear",
    price: 159.9,
    description: "Estampa dorsal A3 em alta gramatura com toque zero. Gola canelada de 3cm e costura ombro a ombro reforçada.",
    imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop",
    isActive: true,
  },
  {
    id: "sample-3",
    title: "Raw Minimal Off-White Tee",
    category: "Heavyweight 30.1",
    price: 139.9,
    description: "Algodão cru pré-encolhido sem tingimento químico. Conforto térmico absoluto e caimento boxy clássico.",
    imageUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1000&auto=format&fit=crop",
    isActive: true,
  },
  {
    id: "sample-4",
    title: "Gothic Script Oversized Black",
    category: "Streetwear Luxury",
    price: 149.9,
    description: "Preto profundo com tipografia serifada em relevo térmico. A união da estética de alfaiataria com o streetwear.",
    imageUrl: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=1000&auto=format&fit=crop",
    isActive: true,
  },
];

export function StorefrontCatalog({ items }: StorefrontCatalogProps) {
  const displayItems = items && items.length > 0 ? items : PLACEHOLDER_ITEMS;
  const brandPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "5511999999999";

  return (
    <section id="catalogo" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto space-y-12 sm:space-y-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E6DED2] pb-8">
          <div className="space-y-3">
            <span className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#737373] font-semibold block">
              Catálogo de Drops & Modelagens
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-[#0A0A0A]">
              Peças em Destaque
            </h2>
          </div>

          <p className="font-sans text-xs sm:text-sm text-[#737373] max-w-md font-light leading-relaxed">
            Cada camiseta é cortada e prensada sob encomenda no ateliê com acabamento impecável e envio rápido.
          </p>
        </div>

        {/* Product Grid: Clean luxury streetwear layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 sm:gap-y-12">
          {displayItems.map((product) => {
            const whatsappMsg = encodeURIComponent(
              `Olá! Vi a peça "${product.title}" (${formatCurrency(
                product.price
              )}) na vitrine da Cordeiro Ink e gostaria de encomendar.`
            );
            const waLink = `https://wa.me/${brandPhone}?text=${whatsappMsg}`;

            return (
              <div
                key={product.id}
                className="group flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Photo Container */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F2ECE1] rounded-2xl border border-[#E6DED2]">
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Quick Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full bg-[#0A0A0A]/80 backdrop-blur-sm text-[#F7F4EE] text-[10px] font-sans font-semibold tracking-wider uppercase">
                        {product.category}
                      </span>
                    </div>
                  </div>

                  {/* Title & Info */}
                  <div className="pt-3 space-y-1">
                    <h3 className="font-serif text-base sm:text-lg font-bold text-[#0A0A0A] tracking-tight group-hover:text-[#404040] transition-colors">
                      {product.title}
                    </h3>
                    {product.description && (
                      <p className="font-sans text-xs text-[#737373] line-clamp-2 font-light">
                        {product.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Price and CTA */}
                <div className="pt-2 flex items-center justify-between border-t border-[#E6DED2]/80">
                  <span className="font-sans text-sm sm:text-base font-semibold text-[#0A0A0A]">
                    {formatCurrency(product.price)}
                  </span>

                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#0A0A0A] hover:bg-[#222222] text-[#F7F4EE] text-[11px] font-sans font-semibold uppercase tracking-wider transition-all shadow-sm hover:shadow"
                  >
                    <span>Pedir</span>
                    <ArrowUpRight size={12} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
