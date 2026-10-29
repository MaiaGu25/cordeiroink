"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const displayBanners = activeBanners;

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

  if (displayBanners.length === 0) {
    return null;
  }

  const currentBanner = displayBanners[currentIndex];

  return (
    <div
      className="relative w-full overflow-hidden bg-[#0A0A0A] text-[#FAF9F6] select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Banner Slide View: Exclusivamente imagem pura full width/cover sem textos ou botões */}
      <div className="relative w-full h-[260px] sm:h-[380px] md:h-[480px] lg:h-[580px]">
        {displayBanners.map((banner, idx) => {
          const isCurrent = idx === currentIndex;

          const imageContent = (
            <SafeImage
              src={banner.imageUrl}
              alt={banner.title || "Banner Cordeiro Ink"}
              className="w-full h-full object-cover object-center"
              containerClassName="w-full h-full bg-zinc-950 flex items-center justify-center text-zinc-600"
              iconSize={32}
            />
          );

          return (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isCurrent ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {banner.linkUrl ? (
                <a
                  href={banner.linkUrl}
                  className="block w-full h-full cursor-pointer"
                  title={banner.title}
                >
                  {imageContent}
                </a>
              ) : (
                imageContent
              )}
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
