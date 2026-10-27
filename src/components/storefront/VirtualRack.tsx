"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ShoppingBag,
  RotateCw,
  Check,
  ChevronLeft,
  ChevronRight,
  Info,
  Maximize2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "./CartContext";
import type { VirtualRackProduct, VirtualRackColor } from "@/lib/storefront-constants";
import { toast } from "sonner";

interface VirtualRackProps {
  products: VirtualRackProduct[];
}

// Hanger (Cabide) SVG icon component for hanging on the metallic rail
function HangerHook() {
  return (
    <div className="flex flex-col items-center">
      {/* Gancho Metálico no trilho */}
      <svg
        width="28"
        height="24"
        viewBox="0 0 28 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-zinc-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
      >
        <path
          d="M14 2C16.2091 2 18 3.79086 18 6C18 7.6 17.06 8.98 15.7 9.63L14 10.5V14"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <circle cx="14" cy="2" r="1.5" fill="currentColor" />
      </svg>
      {/* Triângulo do cabide */}
      <svg
        width="76"
        height="18"
        viewBox="0 0 76 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-zinc-500 -mt-1 drop-shadow-sm"
      >
        <path
          d="M38 2L6 16H70L38 2Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function VirtualRack({ products = [] }: VirtualRackProps) {
  const { addItem, openCart } = useCart();
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const [viewSide, setViewSide] = useState<"FRONT" | "BACK">("FRONT");
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<"P" | "M" | "G" | "GG">("G");
  const [isFlipping, setIsFlipping] = useState(false);

  const carouselRef = useRef<HTMLDivElement>(null);
  const [dragConstraint, setDragConstraint] = useState(0);

  // Fallback se nenhum produto for passado
  const activeProducts =
    products.length > 0
      ? products
      : [
          {
            id: "rack-demo-1",
            name: "Jesus Ainda Cura — Heavyweight Oversized",
            price: 87.9,
            category: "Oversized",
            collection: "Drop 01 - Cyber",
            description: "Camiseta streetwear premium 260g/m² com estampa em alta definição DTF.",
            imageUrl:
              "https://mghkmhcejxrwdpeaeebb.supabase.co/storage/v1/object/public/storefront/catalog/B-1792954601865.png",
            backImageUrl:
              "https://mghkmhcejxrwdpeaeebb.supabase.co/storage/v1/object/public/storefront/catalog/C-1792954620285.png",
            colors: [
              {
                name: "Preto",
                hex: "#111111",
                imageUrl:
                  "https://mghkmhcejxrwdpeaeebb.supabase.co/storage/v1/object/public/storefront/catalog/B-1792954601865.png",
                backImageUrl:
                  "https://mghkmhcejxrwdpeaeebb.supabase.co/storage/v1/object/public/storefront/catalog/C-1792954620285.png",
              },
              {
                name: "Off-White",
                hex: "#F5F2EB",
                imageUrl:
                  "https://mghkmhcejxrwdpeaeebb.supabase.co/storage/v1/object/public/storefront/catalog/3M-1792954951055.png",
                backImageUrl:
                  "https://mghkmhcejxrwdpeaeebb.supabase.co/storage/v1/object/public/storefront/catalog/C-1792954569676.png",
              },
            ],
          },
        ];

  const currentProduct = activeProducts[selectedProductIndex] || activeProducts[0];
  const currentColor =
    currentProduct.colors[selectedColorIndex] ||
    currentProduct.colors[0] || {
      name: "Preto",
      hex: "#111111",
      imageUrl: currentProduct.imageUrl,
      backImageUrl: currentProduct.backImageUrl,
    };

  // Imagens frontal e traseira ativas
  const frontImage = currentColor.imageUrl || currentProduct.imageUrl;
  const backImage =
    currentColor.backImageUrl || currentProduct.backImageUrl || currentColor.imageUrl || currentProduct.imageUrl;

  // Atualiza constraints de drag baseado na largura do conteúdo
  useEffect(() => {
    if (carouselRef.current) {
      const scrollWidth = carouselRef.current.scrollWidth;
      const offsetWidth = carouselRef.current.offsetWidth;
      setDragConstraint(Math.min(0, offsetWidth - scrollWidth - 32));
    }
  }, [activeProducts.length]);

  // Reseta lado e cor ao trocar de peça
  const handleSelectProduct = (index: number) => {
    setSelectedProductIndex(index);
    setViewSide("FRONT");
    setSelectedColorIndex(0);
  };

  // Flip manual com animação controlada
  const handleToggleSide = (side: "FRONT" | "BACK") => {
    if (viewSide === side) return;
    setIsFlipping(true);
    setViewSide(side);
    setTimeout(() => {
      setIsFlipping(false);
    }, 600);
  };

  const handleAddToCart = () => {
    addItem({
      productId: currentProduct.id,
      title: currentProduct.name,
      price: currentProduct.price,
      size: selectedSize,
      colorName: currentColor.name,
      quantity: 1,
      imageUrl: frontImage,
    });
    toast.success(`Peça adicionada à sua sacola: ${currentProduct.name} (${selectedSize})`);
    openCart();
  };

  return (
    <section className="relative w-full bg-zinc-950 text-zinc-100 border-b border-zinc-900 overflow-hidden select-none py-10 md:py-14">
      {/* Background Cyber Glow & Grid Accents */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(217,119,6,0.12),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header da Arara */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Sparkles size={11} />
                Arara Virtual 3D
              </span>
              <span className="text-zinc-500 text-xs">•</span>
              <span className="text-zinc-400 text-xs font-mono">
                {activeProducts.length} {activeProducts.length === 1 ? "peça em destaque" : "peças em destaque"}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white font-sans">
              Showroom Interativo de Peças
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mt-1">
              Arraste a arara para escolher sua camiseta, alterne as cores e gire a peça em 360° para inspecionar a estampa frontal e traseira.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span className="px-2 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
              Arrasto livre ↔
            </span>
            <span className="px-2 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
              Flip 3D
            </span>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* PARTE 1: ARARA HORIZONTAL COM DRAG (Framer Motion)  */}
        {/* ---------------------------------------------------- */}
        <div className="relative mb-10 pt-4">
          {/* Trilho Metálico Superior (Rack Bar) */}
          <div className="relative w-full h-3.5 bg-gradient-to-r from-zinc-800 via-zinc-600 to-zinc-800 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.8)] border border-zinc-700/80 mb-2">
            {/* Parafusos/Suportes industriais nas pontas */}
            <div className="absolute -left-1.5 -top-1 w-5 h-5 rounded-full bg-zinc-900 border-2 border-zinc-500 shadow-md flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            </div>
            <div className="absolute -right-1.5 -top-1 w-5 h-5 rounded-full bg-zinc-900 border-2 border-zinc-500 shadow-md flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            </div>
            {/* Brilho de reflexo metálico */}
            <div className="absolute inset-x-4 top-0.5 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          </div>

          {/* Contêiner de Arrasto Horizontal com Overflow Hidden */}
          <div className="relative overflow-hidden cursor-grab active:cursor-grabbing pb-4">
            <motion.div
              ref={carouselRef}
              drag="x"
              dragConstraints={{ left: dragConstraint, right: 0 }}
              dragElastic={0.12}
              className="flex items-start gap-4 sm:gap-6 pt-1 px-2"
            >
              {activeProducts.map((prod, idx) => {
                const isSelected = idx === selectedProductIndex;
                const prodThumb = prod.colors?.[0]?.imageUrl || prod.imageUrl;

                return (
                  <motion.div
                    key={prod.id}
                    onClick={() => handleSelectProduct(idx)}
                    whileHover={{ y: -3, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`shrink-0 flex flex-col items-center transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? "opacity-100 scale-105 z-20"
                        : "opacity-65 hover:opacity-90 scale-100 z-10"
                    }`}
                  >
                    {/* Gancho & Cabide fixado ao trilho */}
                    <HangerHook />

                    {/* Card da Camiseta Pendurada */}
                    <div
                      className={`relative w-32 sm:w-36 md:w-40 aspect-[3/4] rounded-2xl p-2.5 transition-all duration-300 flex flex-col justify-between ${
                        isSelected
                          ? "bg-zinc-900 border-2 border-amber-500 shadow-[0_0_24px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/50"
                          : "bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 shadow-lg"
                      }`}
                    >
                      {/* Badge Ativo */}
                      {isSelected && (
                        <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-amber-500 text-zinc-950 font-mono font-bold text-[9px] uppercase tracking-wider shadow">
                          Na Arara
                        </span>
                      )}

                      {/* Imagem da Camiseta */}
                      <div className="w-full flex-1 flex items-center justify-center overflow-hidden py-1">
                        <img
                          src={prodThumb}
                          alt={prod.name}
                          className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
                          loading="lazy"
                        />
                      </div>

                      {/* Detalhes rápidos */}
                      <div className="text-center pt-1 border-t border-zinc-800/80">
                        <p className="text-[11px] font-semibold text-zinc-100 truncate">
                          {prod.name}
                        </p>
                        <p className="text-[10px] font-mono text-amber-400 font-bold">
                          {formatCurrency(prod.price)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* PARTE 2: INSPEÇÃO & CARD FLIP 3D DA PEÇA EM DESTAQUE */}
        {/* ---------------------------------------------------- */}
        <div className="relative rounded-3xl bg-zinc-900/60 border border-zinc-800/80 p-6 md:p-8 backdrop-blur-sm shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Visualizador 3D com Giro Flip */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center">
              {/* Perspective Container */}
              <div
                className="relative w-64 sm:w-72 md:w-80 aspect-[3/4] flex items-center justify-center"
                style={{ perspective: "1200px" }}
              >
                {/* 3D Inner Card that rotates on Y axis */}
                <div
                  className="w-full h-full relative transition-transform duration-700 ease-out"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: viewSide === "BACK" ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  {/* FACE FRONTAL */}
                  <div
                    className="absolute inset-0 rounded-2xl bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-4 border border-zinc-800 flex flex-col items-center justify-center shadow-2xl"
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                    }}
                  >
                    <span className="absolute top-3 left-3 text-[10px] font-mono tracking-wider px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-400 border border-zinc-700">
                      VISTA FRONTAL
                    </span>

                    <img
                      src={frontImage}
                      alt={`${currentProduct.name} - Frente`}
                      className="w-full h-full object-contain filter drop-shadow-[0_16px_24px_rgba(0,0,0,0.7)] transition-all duration-300"
                    />
                  </div>

                  {/* FACE TRASEIRA (ROTATE 180 DEG) */}
                  <div
                    className="absolute inset-0 rounded-2xl bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-4 border border-zinc-800 flex flex-col items-center justify-center shadow-2xl"
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <span className="absolute top-3 left-3 text-[10px] font-mono tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      VISTA TRASEIRA
                    </span>

                    <img
                      src={backImage}
                      alt={`${currentProduct.name} - Costas`}
                      className="w-full h-full object-contain filter drop-shadow-[0_16px_24px_rgba(0,0,0,0.7)] transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              {/* Botões Minimalistas: FRONT e BACK */}
              <div className="flex items-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => handleToggleSide("FRONT")}
                  className={`px-5 py-2 rounded-xl text-xs font-mono font-bold tracking-wider transition-all cursor-pointer flex items-center gap-1.5 border ${
                    viewSide === "FRONT"
                      ? "bg-white text-zinc-950 border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                      : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700"
                  }`}
                >
                  <RotateCw size={13} className={viewSide === "FRONT" ? "text-zinc-950" : ""} />
                  <span>FRONT</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleSide("BACK")}
                  className={`px-5 py-2 rounded-xl text-xs font-mono font-bold tracking-wider transition-all cursor-pointer flex items-center gap-1.5 border ${
                    viewSide === "BACK"
                      ? "bg-amber-400 text-zinc-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                      : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700"
                  }`}
                >
                  <RotateCw size={13} className={viewSide === "BACK" ? "text-zinc-950" : ""} />
                  <span>BACK</span>
                </button>
              </div>
            </div>

            {/* Painel de Customização & Compra (Lado Direito) */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                    {currentProduct.category}
                  </span>
                  {currentProduct.collection && (
                    <span className="text-[10px] font-mono text-zinc-400">
                      {currentProduct.collection}
                    </span>
                  )}
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {currentProduct.name}
                </h3>

                <div className="flex items-baseline gap-3 mt-3">
                  <span className="text-2xl sm:text-3xl font-mono font-black text-amber-400">
                    {formatCurrency(currentProduct.price)}
                  </span>
                  <span className="text-xs text-zinc-400 font-sans">
                    Em até 3x sem juros ou via Pix
                  </span>
                </div>

                {currentProduct.description && (
                  <p className="text-xs sm:text-sm text-zinc-400 mt-3 font-light leading-relaxed">
                    {currentProduct.description}
                  </p>
                )}
              </div>

              {/* Seletor de Cores */}
              <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-300 uppercase tracking-wider text-[11px]">
                    Cor Selecionada:
                  </span>
                  <span className="font-mono text-amber-400 font-medium">
                    {currentColor.name}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {currentProduct.colors.map((color, cIdx) => {
                    const isSelectedColor = cIdx === selectedColorIndex;

                    return (
                      <button
                        key={`${color.name}-${cIdx}`}
                        type="button"
                        onClick={() => setSelectedColorIndex(cIdx)}
                        className={`group relative flex items-center justify-center w-9 h-9 rounded-full transition-all cursor-pointer border ${
                          isSelectedColor
                            ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-zinc-950 scale-110 border-white"
                            : "border-zinc-700 hover:scale-105 opacity-80 hover:opacity-100"
                        }`}
                        title={color.name}
                      >
                        <span
                          className="w-full h-full rounded-full shadow-inner"
                          style={{ backgroundColor: color.hex }}
                        />
                        {isSelectedColor && (
                          <Check
                            size={14}
                            className={
                              color.hex.toLowerCase() === "#ffffff" ||
                              color.hex.toLowerCase().includes("fff") ||
                              color.hex.toLowerCase().includes("f5f2eb")
                                ? "text-zinc-950 absolute"
                                : "text-white absolute"
                            }
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Seletor de Tamanhos (P, M, G, GG - Sem XG) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-300 uppercase tracking-wider text-[11px]">
                    Grade Streetwear:
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Modelagem Oversized Heavyweight
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {(["P", "M", "G", "GG"] as const).map((sz) => {
                    const isSelectedSize = selectedSize === sz;

                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
                          isSelectedSize
                            ? "bg-white text-zinc-950 border-white shadow-md"
                            : "bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Botão de Compra / Adicionar à Sacola */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-zinc-950 font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(245,158,11,0.3)] transition-all cursor-pointer"
                >
                  <ShoppingBag size={18} />
                  <span>Garantir Peça na Sacola • {formatCurrency(currentProduct.price)}</span>
                </button>
                <p className="text-[11px] text-zinc-500 text-center mt-2 flex items-center justify-center gap-1.5">
                  <Info size={12} />
                  Confecção sob demanda com prensagem térmica a 160°C e despacho rápido.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
