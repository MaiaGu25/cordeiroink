"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Sparkles, Tag, ShoppingBag } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { SafeImage } from "@/components/ui/SafeImage";

interface Variant {
  id: string;
  colorName: string;
  hexCode: string;
  imageUrl: string;
  images?: string[];
}

export interface FeaturedProduct {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  category: string;
  images?: string[];
  variants?: Variant[];
}

interface FeaturedProductsShowcaseProps {
  items: any[];
}

export function FeaturedProductsShowcase({ items }: FeaturedProductsShowcaseProps) {
  // Pega até 6 produtos para compor a vitrine limpa de destaque
  const showcaseProducts = items && items.length > 0 ? items.slice(0, 6) : [];

  if (showcaseProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Header da Seção */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12 border-b border-[#E6DED2] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6DED2]/80 text-[#0A0A0A] text-[10px] font-sans font-semibold tracking-widest uppercase mb-2">
            <Sparkles size={11} />
            <span>Drops em Destaque</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0A0A0A]">
            Destaques da Coleção
          </h2>
          <p className="font-sans text-xs sm:text-sm text-[#737373] mt-1 max-w-lg font-light">
            Confira as peças autorais que definem a identidade visual da Cordeiro Ink. Fotografias reais dos produtos finais.
          </p>
        </div>

        <a
          href="#catalogo"
          className="inline-flex items-center gap-1.5 text-xs font-sans font-bold uppercase tracking-wider text-[#0A0A0A] hover:text-[#737373] transition-colors self-start sm:self-auto cursor-pointer"
        >
          <span>Ver catálogo completo ({items.length})</span>
          <ArrowUpRight size={14} />
        </a>
      </div>

      {/* Grid de Fotos Reais dos Produtos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {showcaseProducts.map((product) => (
          <FeaturedProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

function FeaturedProductCard({ product }: { product: FeaturedProduct }) {
  const allVariants = product.variants && product.variants.length > 0 ? product.variants : [];
  const initialVariant = allVariants[0];
  const initialImg = initialVariant?.images?.[0] || initialVariant?.imageUrl || product.images?.[0] || product.imageUrl;

  const [activeImage, setActiveImage] = useState(initialImg);
  const [activeColor, setActiveColor] = useState<string | null>(initialVariant?.colorName || null);

  return (
    <div className="group flex flex-col justify-between bg-[#FAF9F6] border border-[#E6DED2] rounded-3xl p-4 transition-all duration-300 hover:shadow-xl hover:border-[#0A0A0A]/40 min-w-0 overflow-hidden break-words">
      <div className="space-y-3">
        {/* Contêiner da Foto Real do Produto */}
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-[#F2ECE1] border border-[#E6DED2]/60 select-none">
          <SafeImage
            src={activeImage}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            containerClassName="w-full h-full bg-[#F2ECE1] flex items-center justify-center text-[#A0988A]"
            iconSize={28}
          />

          {/* Badge de Categoria */}
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0A0A0A]/85 backdrop-blur-sm text-[#F7F4EE] text-[10px] font-sans font-semibold tracking-wider uppercase">
              <Tag size={10} />
              <span>{product.category}</span>
            </span>
          </div>
        </div>

        {/* Seletor de Variações de Cores com Troca Direta de Foto Real */}
        {allVariants.length > 0 && (
          <div className="flex items-center gap-1.5 pt-1 overflow-x-auto py-0.5">
            {allVariants.map((v) => {
              const targetImg = v.images?.[0] || v.imageUrl;
              const isSelected = activeColor === v.colorName;
              return (
                <button
                  key={v.id || v.colorName}
                  type="button"
                  onClick={() => {
                    setActiveImage(targetImg);
                    setActiveColor(v.colorName);
                  }}
                  title={v.colorName}
                  className={`w-4 h-4 rounded-full border border-black/20 transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? "ring-2 ring-[#0A0A0A] ring-offset-2 scale-110"
                      : "opacity-75 hover:opacity-100 hover:scale-110"
                  }`}
                  style={{ backgroundColor: v.hexCode }}
                  aria-label={v.colorName}
                />
              );
            })}
            {activeColor && (
              <span className="text-[10px] font-sans text-[#737373] ml-1 truncate font-medium">
                {activeColor}
              </span>
            )}
          </div>
        )}

        {/* Título & Descrição */}
        <div className="space-y-1">
          <h3 className="font-serif text-base sm:text-lg font-bold text-[#0A0A0A] tracking-tight group-hover:text-[#444444] transition-colors line-clamp-1 break-words">
            {product.title}
          </h3>
          <p className="font-sans text-xs text-[#737373] line-clamp-1 font-light">
            Modelagem Streetwear Heavyweight • Acabamento Exclusivo
          </p>
        </div>
      </div>

      {/* Preço e Botão */}
      <div className="pt-3 mt-3 flex items-center justify-between border-t border-[#E6DED2]/80">
        <div>
          <span className="text-[10px] font-sans uppercase tracking-wider text-[#888888] block">
            A partir de
          </span>
          <span className="font-sans text-base font-bold text-[#0A0A0A]">
            {formatCurrency(product.price)}
          </span>
        </div>

        <a
          href="#catalogo"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0A0A0A] hover:bg-[#222222] text-[#F7F4EE] text-xs font-sans font-semibold uppercase tracking-wider transition-all shadow-sm hover:shadow"
        >
          <ShoppingBag size={12} />
          <span>Ver Peça</span>
        </a>
      </div>
    </div>
  );
}
