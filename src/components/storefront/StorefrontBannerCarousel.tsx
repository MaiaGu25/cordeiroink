"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, ArrowUpRight, Sparkles } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";

export interface BannerItem {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  orderIndex: number;
  isActive: boolean;
}

interface StorefrontBannerCarouselProps {
  banners: BannerItem[];
}

export function StorefrontBannerCarousel({ banners = [] }: StorefrontBannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const activeBanners = banners.filter((b) => b.isActive);

  // Se não houver banners cadastrados no banco, exibe um banner hero padrão da marca
  const displayBanners =
    activeBanners.length > 0
      ? activeBanners
      : [
          {
            id: "default-1",
            title: "Vista um propósito.",
            subtitle: "Streetwear cristão que une autenticidade, corte oversized e a mensagem da Cruz.",
            imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1600&auto=format&fit=crop",
            linkUrl: "#catalogo",
            orderIndex: 0,
            isActive: true,
          },
          {
            id: "default-2",
            title: "Conferências & Eventos de Jovens",
            subtitle: "Camisetas personalizadas em malha 26.1 e estampa DTF em alta definição para a sua igreja.",
            imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1600&auto=format&fit=crop",
            linkUrl: "#personalizadas",
            orderIndex: 1,
            isActive: true,
          },
        ];

  // Autoplay
  useEffect(() => {
    if (displayBanners.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayBanners.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [displayBanners.length, isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + displayBanners.length) % displayBanners.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % displayBanners.length);
  };

  // Suporte a swipe no mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    touchStartX.current = null;
  };

  const currentBanner = displayBanners[currentIndex];

  return (
    <div
      className="relative w-full overflow-hidden bg-[#0A0A0A] text-[#FAF9F6] select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Banner Slide View */}
      <div className="relative w-full h-[320px] sm:h-[420px] md:h-[500px]">
        {displayBanners.map((banner, idx) => {
          const isCurrent = idx === currentIndex;

          return (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isCurrent ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {/* Background Image with Dark Vignette */}
              <div className="absolute inset-0 bg-black/45 z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40 z-10" />

              <SafeImage
                src={banner.imageUrl}
                alt={banner.title}
                className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-7000 ease-out"
                containerClassName="w-full h-full bg-zinc-950 flex items-center justify-center text-zinc-600"
                iconSize={32}
              />

              {/* Text Overlay */}
              <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 sm:p-12 md:p-16 max-w-5xl mx-auto">
                <div className="space-y-3 sm:space-y-4 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[#FAF9F6] text-[10px] sm:text-xs font-mono uppercase tracking-widest border border-white/15">
                    <Sparkles size={11} className="text-amber-400" />
                    <span>Cordeiro Ink • Ateliê Streetwear</span>
                  </span>

                  <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.1]">
                    {banner.title}
                  </h2>

                  {banner.subtitle && (
                    <p className="font-sans text-xs sm:text-sm md:text-base text-zinc-200 line-clamp-2 max-w-xl font-light leading-relaxed">
                      {banner.subtitle}
                    </p>
                  )}

                  {banner.linkUrl && (
                    <div className="pt-2">
                      <a
                        href={banner.linkUrl}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FAF9F6] text-[#0A0A0A] hover:bg-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] cursor-pointer"
                      >
                        <span>Conferir Destaque</span>
                        <ArrowUpRight size={14} />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows (Desktop) */}
      {displayBanners.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white backdrop-blur-md border border-white/10 transition cursor-pointer hidden sm:flex items-center justify-center"
            aria-label="Slide anterior"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white backdrop-blur-md border border-white/10 transition cursor-pointer hidden sm:flex items-center justify-center"
            aria-label="Próximo slide"
          >
            <ChevronRight size={20} />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 sm:bottom-6 right-6 sm:right-12 z-30 flex items-center gap-2">
            {displayBanners.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all rounded-full cursor-pointer ${
                  idx === currentIndex
                    ? "w-7 h-2 bg-white shadow-sm"
                    : "w-2 h-2 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Ir para slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
