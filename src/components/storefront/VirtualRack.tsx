"use client";

import React, { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { VirtualRackProduct } from "@/lib/storefront-constants";

interface VirtualRackProps {
  products: VirtualRackProduct[];
}

/**
 * Cabide de madeira realista suspenso no trilho metálico.
 */
function WoodenHanger() {
  return (
    <div className="flex flex-col items-center select-none pointer-events-none -mb-3 z-30">
      {/* Gancho Metálico Prateado */}
      <svg
        width="26"
        height="26"
        viewBox="0 0 26 26"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-neutral-500 drop-shadow-[0_2px_3px_rgba(0,0,0,0.35)]"
      >
        <path
          d="M13 3C15.5 3 17.5 5 17.5 7.5C17.5 9.5 16 11 14.5 11.8L13 12.8V17"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <circle cx="13" cy="3" r="1.5" fill="currentColor" />
      </svg>

      {/* Corpo de Madeira Esculpida com chanfros */}
      <svg
        width="110"
        height="22"
        viewBox="0 0 110 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="-mt-2.5 drop-shadow-[0_4px_6px_rgba(0,0,0,0.25)]"
      >
        <path
          d="M55 2C42 7 18 13 4 19C15 20 40 16 55 16C70 16 95 20 106 19C92 13 68 7 55 2Z"
          fill="url(#woodGradient)"
        />
        <path
          d="M55 2L4 19C15 20 40 16 55 16C70 16 95 20 106 19L55 2Z"
          stroke="#4A2E18"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient
            id="woodGradient"
            x1="4"
            y1="2"
            x2="106"
            y2="20"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#9C6B43" />
            <stop offset="0.5" stopColor="#B38054" />
            <stop offset="1" stopColor="#7D4F28" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/**
 * Renderizador de 3 Camadas Dinâmicas com CSS Blend Modes:
 * 1. Fundo (cor selecionada, silhueta com maskImage)
 * 2. Textura (camiseta cinza neutro com mix-blend-multiply)
 * 3. Arte (estampa PNG isolada com coordenadas top/left/width dinâmicas)
 */
interface ShirtLayeredRenderProps {
  baseImage: string;
  printImage?: string | null;
  colorHex: string;
  printTop: number;
  printLeft: number;
  printWidth: number;
  alt: string;
}

export function ShirtLayeredRender({
  baseImage,
  printImage,
  colorHex,
  printTop,
  printLeft,
  printWidth,
  alt,
}: ShirtLayeredRenderProps) {
  const effectiveBase = baseImage || "/mockups/blank-front.svg";

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden select-none">
      {/* Camada 1: Fundo com a cor selecionada (mascarada pela silhueta da camiseta) */}
      <div
        className="absolute inset-0 transition-colors duration-300 pointer-events-none"
        style={{
          backgroundColor: colorHex,
          maskImage: `url('${effectiveBase}')`,
          WebkitMaskImage: `url('${effectiveBase}')`,
          maskSize: "contain",
          WebkitMaskSize: "contain",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskPosition: "center",
        }}
      />

      {/* Camada 2: Textura de sombra/volume da camiseta cinza em mix-blend-multiply */}
      <img
        src={effectiveBase}
        alt={alt}
        className="absolute inset-0 w-full h-full object-contain mix-blend-multiply pointer-events-none select-none filter drop-shadow-[0_18px_30px_rgba(0,0,0,0.18)]"
        loading="lazy"
      />

      {/* Camada 3: Arte isolada da estampa com posicionamento dinâmico consumido do banco */}
      {printImage && (
        <div
          className="absolute pointer-events-none select-none transition-all duration-150"
          style={{
            top: `${printTop}%`,
            left: `${printLeft}%`,
            width: `${printWidth}%`,
            transform: "translateX(-50%)",
          }}
        >
          <img
            src={printImage}
            alt="Estampa"
            className="w-full h-auto object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.22)] select-none"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
}

export function VirtualRack({ products = [] }: VirtualRackProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [viewSide, setViewSide] = useState<"FRONT" | "BACK">("FRONT");
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  // Fallback demonstrativo caso a lista esteja vazia
  const activeProducts =
    products.length > 0
      ? products
      : [
          {
            id: "rack-demo-1",
            name: "DISTRESSED PAINTED LOGO TANK TOP",
            price: 149.9,
            category: "Regata",
            collection: "Drop 01 - Lagos",
            description: "Streetwear minimalista confeccionado em algodão premium.",
            baseImage: "/mockups/blank-front.svg",
            baseBackImage: "/mockups/blank-back.svg",
            printImage:
              "https://mghkmhcejxrwdpeaeebb.supabase.co/storage/v1/object/public/storefront/catalog/B-1792954601865.png",
            printBackImage:
              "https://mghkmhcejxrwdpeaeebb.supabase.co/storage/v1/object/public/storefront/catalog/C-1792954620285.png",
            printWidth: 44.0,
            printTop: 28.0,
            printLeft: 50.0,
            printWidthBack: 52.0,
            printTopBack: 24.0,
            printLeftBack: 50.0,
            colors: [
              {
                name: "Preto",
                hex: "#18181b",
                imageUrl: "/mockups/blank-front.svg",
                backImageUrl: "/mockups/blank-back.svg",
              },
              {
                name: "Off-White",
                hex: "#f4f4f5",
                imageUrl: "/mockups/blank-front.svg",
                backImageUrl: "/mockups/blank-back.svg",
              },
              {
                name: "Marrom Terra",
                hex: "#4a3525",
                imageUrl: "/mockups/blank-front.svg",
                backImageUrl: "/mockups/blank-back.svg",
              },
            ],
          },
        ];

  const total = activeProducts.length;
  const currentProduct = activeProducts[selectedIndex] || activeProducts[0];

  // Índices para o efeito carrossel em profundidade de arara
  const prevIndex = (selectedIndex - 1 + total) % total;
  const nextIndex = (selectedIndex + 1) % total;

  const prevProduct = activeProducts[prevIndex];
  const nextProduct = activeProducts[nextIndex];

  // Cor selecionada
  const currentColor =
    currentProduct.colors?.[selectedColorIndex] ||
    currentProduct.colors?.[0] || {
      name: "Preto",
      hex: "#18181b",
      imageUrl: "",
    };

  // Imagens base e estampas da peça ativa
  const currentBase = currentProduct.baseImage || "/mockups/blank-front.svg";
  const currentBaseBack = currentProduct.baseBackImage || "/mockups/blank-back.svg";
  const currentPrint = currentProduct.printImage || currentProduct.imageUrl;
  const currentPrintBack =
    currentProduct.printBackImage || currentProduct.backImageUrl || currentPrint;

  // Coordenadas dinâmicas
  const printTop = currentProduct.printTop ?? 28.0;
  const printLeft = currentProduct.printLeft ?? 50.0;
  const printWidth = currentProduct.printWidth ?? 45.0;

  const printTopBack = currentProduct.printTopBack ?? 25.0;
  const printLeftBack = currentProduct.printLeftBack ?? 50.0;
  const printWidthBack = currentProduct.printWidthBack ?? 50.0;

  const handleNext = () => {
    setSelectedIndex((prev) => (prev + 1) % total);
    setViewSide("FRONT");
    setSelectedColorIndex(0);
  };

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev - 1 + total) % total);
    setViewSide("FRONT");
    setSelectedColorIndex(0);
  };

  return (
    <section className="relative w-full bg-[#F7F4EE] text-[#0A0A0A] py-10 sm:py-14 md:py-18 overflow-hidden select-none border-b border-neutral-200/60">
      <div className="max-w-6xl mx-auto px-4 relative">
        {/* TRILHO METÁLICO DA ARARA (RACK BAR) */}
        <div className="relative w-full max-w-4xl mx-auto mb-1">
          <div className="h-2 w-full bg-gradient-to-r from-neutral-400 via-neutral-300 to-neutral-400 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.15)] border border-neutral-300 relative">
            {/* Ponteiras de fixação industrial nas extremidades */}
            <div className="absolute -left-2 -top-1 w-4 h-4 rounded-full bg-neutral-800 border border-neutral-600 shadow" />
            <div className="absolute -right-2 -top-1 w-4 h-4 rounded-full bg-neutral-800 border border-neutral-600 shadow" />
            {/* Brilho sutil do metal escovado */}
            <div className="absolute inset-x-8 top-0.5 h-[1px] bg-white/60" />
          </div>
        </div>

        {/* CONTAINER CENTRAL DA ARARA VIRTUAL COM PROFUNDIDADE DE CAMPO */}
        <div className="relative flex items-center justify-center min-h-[420px] sm:min-h-[480px] md:min-h-[520px]">
          {/* Botão de Navegação Esquerda (<) */}
          {total > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Peça anterior"
              className="absolute left-2 sm:left-6 md:left-12 z-40 w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-neutral-300/80 bg-white/80 hover:bg-white text-neutral-800 hover:text-black flex items-center justify-center transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-sm"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {/* Peça Vizinha Esquerda (Desfocada / Em Profundidade) */}
          {total > 1 && (
            <div
              onClick={handlePrev}
              className="hidden md:flex flex-col items-center absolute -left-12 lg:left-6 z-10 opacity-30 hover:opacity-50 transition-all duration-500 scale-75 blur-[1.5px] cursor-pointer pointer-events-auto"
            >
              <WoodenHanger />
              <div className="w-56 h-72 relative">
                <ShirtLayeredRender
                  baseImage={prevProduct.baseImage || "/mockups/blank-front.svg"}
                  printImage={prevProduct.printImage || prevProduct.imageUrl}
                  colorHex={prevProduct.colors?.[0]?.hex || "#18181b"}
                  printTop={prevProduct.printTop ?? 28}
                  printLeft={prevProduct.printLeft ?? 50}
                  printWidth={prevProduct.printWidth ?? 45}
                  alt={prevProduct.name}
                />
              </div>
            </div>
          )}

          {/* PEÇA CENTRAL PRINCIPAL (DESTAQUE MÁXIMO STREETWEAR) */}
          <div className="flex flex-col items-center z-20 transition-transform duration-500">
            {/* Cabide de Madeira Suspenso */}
            <WoodenHanger />

            {/* Container 3D Flip da Camiseta */}
            <div
              className="relative w-72 sm:w-80 md:w-96 aspect-[3/4] flex items-center justify-center"
              style={{ perspective: "1400px" }}
            >
              <div
                className="w-full h-full relative transition-transform duration-700 ease-out"
                style={{
                  transformStyle: "preserve-3d",
                  transform: viewSide === "BACK" ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
              >
                {/* Face Frontal (3 Camadas: Cor + Textura + Arte) */}
                <div
                  className="absolute inset-0 flex items-center justify-center overflow-visible"
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                  }}
                >
                  <ShirtLayeredRender
                    baseImage={currentBase}
                    printImage={currentPrint}
                    colorHex={currentColor.hex}
                    printTop={printTop}
                    printLeft={printLeft}
                    printWidth={printWidth}
                    alt={`${currentProduct.name} - Frente`}
                  />
                </div>

                {/* Face Traseira (3 Camadas Costas) */}
                <div
                  className="absolute inset-0 flex items-center justify-center overflow-visible"
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <ShirtLayeredRender
                    baseImage={currentBaseBack}
                    printImage={currentPrintBack}
                    colorHex={currentColor.hex}
                    printTop={printTopBack}
                    printLeft={printLeftBack}
                    printWidth={printWidthBack}
                    alt={`${currentProduct.name} - Costas`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Peça Vizinha Direita (Desfocada / Em Profundidade) */}
          {total > 1 && (
            <div
              onClick={handleNext}
              className="hidden md:flex flex-col items-center absolute -right-12 lg:right-6 z-10 opacity-30 hover:opacity-50 transition-all duration-500 scale-75 blur-[1.5px] cursor-pointer pointer-events-auto"
            >
              <WoodenHanger />
              <div className="w-56 h-72 relative">
                <ShirtLayeredRender
                  baseImage={nextProduct.baseImage || "/mockups/blank-front.svg"}
                  printImage={nextProduct.printImage || nextProduct.imageUrl}
                  colorHex={nextProduct.colors?.[0]?.hex || "#18181b"}
                  printTop={nextProduct.printTop ?? 28}
                  printLeft={nextProduct.printLeft ?? 50}
                  printWidth={nextProduct.printWidth ?? 45}
                  alt={nextProduct.name}
                />
              </div>
            </div>
          )}

          {/* Botão de Navegação Direita (>) */}
          {total > 1 && (
            <button
              type="button"
              onClick={handleNext}
              aria-label="Próxima peça"
              className="absolute right-2 sm:right-6 md:right-12 z-40 w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-neutral-300/80 bg-white/80 hover:bg-white text-neutral-800 hover:text-black flex items-center justify-center transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-sm"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>

        {/* CONTROLES MINIMALISTAS INFERIORES (ESTÉTICA STREETWEAR CLEAN) */}
        <div className="flex flex-col items-center text-center mt-3 sm:mt-5 space-y-3">
          {/* Título da Peça em Tipografia Streetwear Bold */}
          <h3 className="text-sm sm:text-base md:text-lg font-black uppercase tracking-wider text-[#0A0A0A] max-w-md mx-auto">
            {currentProduct.name}
          </h3>

          {/* Botão Cápsula Minimalista: FRONT | BACK */}
          <div className="inline-flex items-center p-0.5 rounded-full bg-neutral-200/90 border border-neutral-300 shadow-inner">
            <button
              type="button"
              onClick={() => setViewSide("FRONT")}
              className={`px-4 py-1 rounded-full text-[11px] font-mono font-bold tracking-widest transition-all cursor-pointer ${
                viewSide === "FRONT"
                  ? "bg-[#0A0A0A] text-white shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              FRONT
            </button>
            <button
              type="button"
              onClick={() => setViewSide("BACK")}
              className={`px-4 py-1 rounded-full text-[11px] font-mono font-bold tracking-widest transition-all cursor-pointer ${
                viewSide === "BACK"
                  ? "bg-[#0A0A0A] text-white shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              BACK
            </button>
          </div>

          {/* Círculos Minimalistas para Troca de Cores */}
          {currentProduct.colors && currentProduct.colors.length > 0 && (
            <div className="flex items-center justify-center gap-2 pt-0.5">
              {currentProduct.colors.map((color, idx) => {
                const isSelected = selectedColorIndex === idx;
                return (
                  <button
                    key={color.hex + idx}
                    type="button"
                    onClick={() => setSelectedColorIndex(idx)}
                    title={color.name}
                    className={`w-4 h-4 rounded-full border transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#0A0A0A] scale-125 ring-2 ring-black/20 shadow-sm"
                        : "border-neutral-300 hover:scale-110 opacity-70 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: color.hex }}
                  />
                );
              })}
            </div>
          )}

          {/* Preço Discreto e Minimalista */}
          <div className="text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-widest pt-0.5">
            {formatCurrency(currentProduct.price)}
          </div>
        </div>
      </div>
    </section>
  );
}
