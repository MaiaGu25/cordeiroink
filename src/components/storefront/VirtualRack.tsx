"use client";

import React, { useState, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  ShoppingBag,
  Sparkles,
  Check,
  Plus,
  Minus,
  MessageCircle,
  LayoutGrid,
  Maximize2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { VirtualRackProduct } from "@/lib/storefront-constants";
import { useCart } from "./CartContext";
import { toast } from "sonner";

interface VirtualRackProps {
  products: VirtualRackProduct[];
}

/**
 * Cabide de madeira esculpida com gancho metálico realista suspenso no trilho.
 */
function WoodenHanger({ isMini = false }: { isMini?: boolean }) {
  if (isMini) {
    return (
      <div className="flex flex-col items-center select-none pointer-events-none -mb-1.5 z-30">
        <svg
          width="16"
          height="16"
          viewBox="0 0 26 26"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-neutral-500 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
        >
          <path
            d="M13 3C15.5 3 17.5 5 17.5 7.5C17.5 9.5 16 11 14.5 11.8L13 12.8V17"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="13" cy="3" r="1.5" fill="currentColor" />
        </svg>
        <svg
          width="64"
          height="13"
          viewBox="0 0 110 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="-mt-1.5 drop-shadow-[0_2px_3px_rgba(0,0,0,0.2)]"
        >
          <path
            d="M55 2C42 7 18 13 4 19C15 20 40 16 55 16C70 16 95 20 106 19C92 13 68 7 55 2Z"
            fill="#8B5A2B"
          />
        </svg>
      </div>
    );
  }

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

      {/* Corpo de Madeira Esculpida */}
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
 * 3. Arte (estampa PNG isolada com coordenadas dinâmicas)
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

      {/* Camada 3: Arte isolada da estampa com posicionamento dinâmico */}
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

/**
 * Coleção rica de demonstração streetwear caso o banco tenha poucas peças.
 * Inspirada exatamente no vídeo de referência do usuário.
 */
const DEFAULT_STREETWEAR_ITEMS: VirtualRackProduct[] = [
  {
    id: "demo-crimson-memory",
    name: "CRIMSON MEMORY LS SHIRT",
    price: 189.9,
    category: "Camisa",
    collection: "Drop 01 - Lagos",
    description:
      "Camisa manga longa estruturada em algodão premium com estampa de punhal e sangue no peito e arte dorsal impactante.",
    baseImage: "/mockups/blank-front.svg",
    baseBackImage: "/mockups/blank-back.svg",
    printImage:
      "https://mghkmhcejxrwdpeaeebb.supabase.co/storage/v1/object/public/storefront/catalog/B-1792954601865.png",
    printBackImage:
      "https://mghkmhcejxrwdpeaeebb.supabase.co/storage/v1/object/public/storefront/catalog/C-1792954620285.png",
    printWidth: 42.0,
    printTop: 28.0,
    printLeft: 50.0,
    printWidthBack: 52.0,
    printTopBack: 24.0,
    printLeftBack: 50.0,
    colors: [
      {
        name: "Branco Neve",
        hex: "#F9F9F9",
        imageUrl: "/mockups/blank-front.svg",
        backImageUrl: "/mockups/blank-back.svg",
      },
      {
        name: "Preto",
        hex: "#18181b",
        imageUrl: "/mockups/blank-front.svg",
        backImageUrl: "/mockups/blank-back.svg",
      },
      {
        name: "Off-White",
        hex: "#EFECE6",
        imageUrl: "/mockups/blank-front.svg",
        backImageUrl: "/mockups/blank-back.svg",
      },
    ],
  },
  {
    id: "demo-never-them",
    name: "IT'S US NEVER THEM TEE",
    price: 159.9,
    category: "Oversized",
    collection: "Drop 01 - Lagos",
    description:
      "Modelagem oversized boxy com tipografia streetwear autoral e acabamento pesado de ribana canelada 3cm.",
    baseImage: "/mockups/blank-front.svg",
    baseBackImage: "/mockups/blank-back.svg",
    printImage:
      "https://mghkmhcejxrwdpeaeebb.supabase.co/storage/v1/object/public/storefront/catalog/B-1792954601865.png",
    printBackImage:
      "https://mghkmhcejxrwdpeaeebb.supabase.co/storage/v1/object/public/storefront/catalog/C-1792954620285.png",
    printWidth: 46.0,
    printTop: 26.0,
    printLeft: 50.0,
    printWidthBack: 50.0,
    printTopBack: 25.0,
    printLeftBack: 50.0,
    colors: [
      {
        name: "Preto",
        hex: "#18181b",
        imageUrl: "/mockups/blank-front.svg",
        backImageUrl: "/mockups/blank-back.svg",
      },
      {
        name: "Rosa Chiclete",
        hex: "#F472B6",
        imageUrl: "/mockups/blank-front.svg",
        backImageUrl: "/mockups/blank-back.svg",
      },
      {
        name: "Amarelo Canário",
        hex: "#FACC15",
        imageUrl: "/mockups/blank-front.svg",
        backImageUrl: "/mockups/blank-back.svg",
      },
    ],
  },
  {
    id: "demo-distressed-tank",
    name: "DISTRESSED PAINTED LOGO TANK TOP",
    price: 149.9,
    category: "Regata",
    collection: "Drop 01 - Lagos",
    description:
      "Regata streetwear com corte amplo, gola grossa e efeito desgastado distressed com estampa tipográfica frontal.",
    baseImage: "/mockups/blank-front.svg",
    baseBackImage: "/mockups/blank-back.svg",
    printImage:
      "https://mghkmhcejxrwdpeaeebb.supabase.co/storage/v1/object/public/storefront/catalog/B-1792954601865.png",
    printBackImage:
      "https://mghkmhcejxrwdpeaeebb.supabase.co/storage/v1/object/public/storefront/catalog/C-1792954620285.png",
    printWidth: 45.0,
    printTop: 28.0,
    printLeft: 50.0,
    printWidthBack: 48.0,
    printTopBack: 25.0,
    printLeftBack: 50.0,
    colors: [
      {
        name: "Preto",
        hex: "#18181b",
        imageUrl: "/mockups/blank-front.svg",
        backImageUrl: "/mockups/blank-back.svg",
      },
      {
        name: "Beige Pedra",
        hex: "#D6CEBF",
        imageUrl: "/mockups/blank-front.svg",
        backImageUrl: "/mockups/blank-back.svg",
      },
    ],
  },
  {
    id: "demo-blessed-heritage",
    name: "BLESSED HERITAGE HEAVYWEIGHT TEE",
    price: 169.9,
    category: "Oversized",
    collection: "Drop 01 - Lagos",
    description:
      "Malha 100% algodão 260g/m² com caimento impecável e estampa cristã minimalista que expressa a fé autoral.",
    baseImage: "/mockups/blank-front.svg",
    baseBackImage: "/mockups/blank-back.svg",
    printImage:
      "https://mghkmhcejxrwdpeaeebb.supabase.co/storage/v1/object/public/storefront/catalog/B-1792954601865.png",
    printBackImage:
      "https://mghkmhcejxrwdpeaeebb.supabase.co/storage/v1/object/public/storefront/catalog/C-1792954620285.png",
    printWidth: 44.0,
    printTop: 28.0,
    printLeft: 50.0,
    printWidthBack: 50.0,
    printTopBack: 25.0,
    printLeftBack: 50.0,
    colors: [
      {
        name: "Preto Street",
        hex: "#121212",
        imageUrl: "/mockups/blank-front.svg",
        backImageUrl: "/mockups/blank-back.svg",
      },
      {
        name: "Off-White Raw",
        hex: "#F5F5F0",
        imageUrl: "/mockups/blank-front.svg",
        backImageUrl: "/mockups/blank-back.svg",
      },
      {
        name: "Marrom Cacau",
        hex: "#4A2E18",
        imageUrl: "/mockups/blank-front.svg",
        backImageUrl: "/mockups/blank-back.svg",
      },
    ],
  },
  {
    id: "demo-varsity-bomber",
    name: "HOLY SPIRIT VARSITY JACKET",
    price: 329.9,
    category: "Jaqueta",
    collection: "Drop 01 - Lagos",
    description:
      "Jaqueta estilo letterman colegial com mangas em couro ecológico e bordados de alta gramatura.",
    baseImage: "/mockups/blank-front.svg",
    baseBackImage: "/mockups/blank-back.svg",
    printImage:
      "https://mghkmhcejxrwdpeaeebb.supabase.co/storage/v1/object/public/storefront/catalog/B-1792954601865.png",
    printBackImage:
      "https://mghkmhcejxrwdpeaeebb.supabase.co/storage/v1/object/public/storefront/catalog/C-1792954620285.png",
    printWidth: 40.0,
    printTop: 30.0,
    printLeft: 50.0,
    printWidthBack: 54.0,
    printTopBack: 24.0,
    printLeftBack: 50.0,
    colors: [
      {
        name: "Preto & Branco",
        hex: "#18181b",
        imageUrl: "/mockups/blank-front.svg",
        backImageUrl: "/mockups/blank-back.svg",
      },
      {
        name: "Azul Marinho",
        hex: "#1E3A8A",
        imageUrl: "/mockups/blank-front.svg",
        backImageUrl: "/mockups/blank-back.svg",
      },
      {
        name: "Verde Varsity",
        hex: "#14532D",
        imageUrl: "/mockups/blank-front.svg",
        backImageUrl: "/mockups/blank-back.svg",
      },
    ],
  },
  {
    id: "demo-faith-over-fear",
    name: "FAITH OVER FEAR OVERSIZED TEE",
    price: 159.9,
    category: "Oversized",
    collection: "Drop 01 - Lagos",
    description:
      "Camiseta corte boxy fit em amarelo canário com estampa dorsal de fé viva e presença marcante.",
    baseImage: "/mockups/blank-front.svg",
    baseBackImage: "/mockups/blank-back.svg",
    printImage:
      "https://mghkmhcejxrwdpeaeebb.supabase.co/storage/v1/object/public/storefront/catalog/B-1792954601865.png",
    printBackImage:
      "https://mghkmhcejxrwdpeaeebb.supabase.co/storage/v1/object/public/storefront/catalog/C-1792954620285.png",
    printWidth: 45.0,
    printTop: 27.0,
    printLeft: 50.0,
    printWidthBack: 52.0,
    printTopBack: 24.0,
    printLeftBack: 50.0,
    colors: [
      {
        name: "Amarelo Canário",
        hex: "#EAB308",
        imageUrl: "/mockups/blank-front.svg",
        backImageUrl: "/mockups/blank-back.svg",
      },
      {
        name: "Preto Fundo",
        hex: "#18181b",
        imageUrl: "/mockups/blank-front.svg",
        backImageUrl: "/mockups/blank-back.svg",
      },
      {
        name: "Branco Puro",
        hex: "#FFFFFF",
        imageUrl: "/mockups/blank-front.svg",
        backImageUrl: "/mockups/blank-back.svg",
      },
    ],
  },
];

export function VirtualRack({ products = [] }: VirtualRackProps) {
  const { addItem, openCart } = useCart();

  // Se houver menos de 4 produtos no banco, mescla para garantir a arara cheia e cinematográfica
  const activeProducts =
    products.length >= 4
      ? products
      : [
          ...products,
          ...DEFAULT_STREETWEAR_ITEMS.filter(
            (def) => !products.some((p) => p.name === def.name || p.id === def.id)
          ),
        ];

  const [viewMode, setViewMode] = useState<"FOCUS" | "OVERVIEW">("FOCUS");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [viewSide, setViewSide] = useState<"FRONT" | "BACK">("FRONT");
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados do Modal de Disponibilidade
  const [modalSize, setModalSize] = useState("M");
  const [modalQuantity, setModalQuantity] = useState(1);

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

  const handleSelectProduct = (index: number) => {
    setSelectedIndex(index);
    setViewSide("FRONT");
    setSelectedColorIndex(0);
    setViewMode("FOCUS");
  };

  const handleAddToCart = () => {
    addItem({
      productId: currentProduct.id,
      title: currentProduct.name,
      colorName: currentColor.name,
      size: modalSize,
      price: currentProduct.price,
      quantity: modalQuantity,
      imageUrl: currentPrint || currentProduct.imageUrl || currentBase,
    });
    setIsModalOpen(false);
    toast.success(`${currentProduct.name} adicionado à sacola!`);
    openCart();
  };

  const brandPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "5511999999999";
  const waMsg = encodeURIComponent(
    `Olá! Vi a peça "${currentProduct.name}" na cor ${currentColor.name} (Tamanho ${modalSize}, ${modalQuantity}x) na Arara Virtual da Cordeiro Ink e gostaria de encomendar.`
  );
  const waLink = `https://wa.me/${brandPhone}?text=${waMsg}`;

  return (
    <section className="relative w-full bg-[#F7F4EE] text-[#0A0A0A] pt-8 sm:pt-12 md:pt-16 pb-0 overflow-hidden select-none border-b border-neutral-300">
      <div className="max-w-6xl mx-auto px-4 relative">
        {/* BARRA SUPERIOR: ALTERNADOR DISCRETO [ ⊞ ARARA COMPLETA | ◫ DETALHE ] */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-widest uppercase text-neutral-500">
              ARARA VIRTUAL • STREETWEAR AUTORAL
            </span>
          </div>

          <div className="inline-flex items-center p-0.5 rounded-full bg-neutral-200/90 border border-neutral-300 shadow-inner">
            <button
              type="button"
              onClick={() => setViewMode("OVERVIEW")}
              className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "OVERVIEW"
                  ? "bg-[#0A0A0A] text-white shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
              title="Visualizar todas as peças na arara"
            >
              <LayoutGrid size={12} />
              <span className="hidden sm:inline">ARARA COMPLETA</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("FOCUS")}
              className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "FOCUS"
                  ? "bg-[#0A0A0A] text-white shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
              title="Focar na peça com giro 3D"
            >
              <Maximize2 size={12} />
              <span className="hidden sm:inline">FOCAR PEÇA</span>
            </button>
          </div>
        </div>

        {/* TRILHO METÁLICO DA ARARA (RACK BAR) */}
        <div className="relative w-full max-w-5xl mx-auto mb-2">
          <div className="h-2 w-full bg-gradient-to-r from-neutral-400 via-neutral-300 to-neutral-400 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.15)] border border-neutral-300 relative">
            {/* Ponteiras de fixação industrial nas extremidades */}
            <div className="absolute -left-2 -top-1 w-4 h-4 rounded-full bg-neutral-800 border border-neutral-600 shadow" />
            <div className="absolute -right-2 -top-1 w-4 h-4 rounded-full bg-neutral-800 border border-neutral-600 shadow" />
            {/* Brilho sutil do metal escovado */}
            <div className="absolute inset-x-8 top-0.5 h-[1px] bg-white/60" />
          </div>
        </div>

        {/* ============================================================== */}
        {/* MODO 1: VISÃO DA ARARA COMPLETA (PANORÂMICA / OVERVIEW)         */}
        {/* Todas as peças penduradas lado a lado no trilho (igual ao vídeo) */}
        {/* ============================================================== */}
        {viewMode === "OVERVIEW" && (
          <div className="flex flex-col items-center py-6 sm:py-10 animate-in fade-in duration-300">
            {/* Peças penduradas em fila indiana no trilho */}
            <div className="w-full overflow-x-auto pb-6 scrollbar-none flex items-start justify-center gap-4 sm:gap-6 md:gap-8 px-4">
              {activeProducts.map((prod, idx) => {
                const isCurrent = idx === selectedIndex;
                const prodColor = prod.colors?.[0]?.hex || "#18181b";
                return (
                  <div
                    key={prod.id}
                    onClick={() => handleSelectProduct(idx)}
                    className="flex flex-col items-center cursor-pointer group shrink-0 transition-transform duration-300 hover:-translate-y-2"
                  >
                    {/* Cabide individual */}
                    <WoodenHanger isMini />

                    {/* Miniatura da Peça com Sanduíche de Camadas */}
                    <div
                      className={`w-28 h-36 sm:w-36 sm:h-48 md:w-40 md:h-52 relative transition-all duration-300 ${
                        isCurrent
                          ? "scale-105 filter drop-shadow-[0_12px_20px_rgba(0,0,0,0.25)]"
                          : "opacity-85 group-hover:opacity-100 filter drop-shadow-[0_6px_12px_rgba(0,0,0,0.15)]"
                      }`}
                    >
                      <ShirtLayeredRender
                        baseImage={prod.baseImage || "/mockups/blank-front.svg"}
                        printImage={prod.printImage || prod.imageUrl}
                        colorHex={prodColor}
                        printTop={prod.printTop ?? 28}
                        printLeft={prod.printLeft ?? 50}
                        printWidth={prod.printWidth ?? 45}
                        alt={prod.name}
                      />
                    </div>

                    {/* Título e Preço da Peça */}
                    <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-center max-w-[120px] mt-2 group-hover:text-amber-600 transition-colors line-clamp-1">
                      {prod.name}
                    </span>
                    <span className="text-[9px] font-mono font-bold text-neutral-500">
                      {formatCurrency(prod.price)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Botão SEE AVAILABILITY no modo panorâmico */}
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-2 rounded-md border border-neutral-800 hover:bg-[#0A0A0A] hover:text-[#F7F4EE] text-[11px] font-mono font-bold uppercase tracking-widest transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
              >
                SEE AVAILABILITY
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODO 2: VISÃO DE FOCO STREETWEAR COM GIRO 3D E PROFUNDIDADE     */}
        {/* A peça selecionada em destaque com vizinhas desfocadas          */}
        {/* ============================================================== */}
        {viewMode === "FOCUS" && (
          <div className="relative flex items-center justify-center min-h-[440px] sm:min-h-[500px] md:min-h-[540px] animate-in fade-in duration-300">
            {/* Botão de Navegação Esquerda (<) */}
            {total > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Peça anterior"
                className="absolute left-2 sm:left-6 md:left-10 z-40 w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-neutral-300/80 bg-white/80 hover:bg-white text-neutral-800 hover:text-black flex items-center justify-center transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-sm"
              >
                <ChevronLeft size={20} />
              </button>
            )}

            {/* Peça Vizinha Esquerda (Desfocada / Em Profundidade de Campo) */}
            {total > 1 && (
              <div
                onClick={handlePrev}
                className="hidden md:flex flex-col items-center absolute -left-14 lg:left-2 z-10 opacity-30 hover:opacity-50 transition-all duration-500 scale-75 blur-[1.8px] cursor-pointer pointer-events-auto"
                title={`Ver ${prevProduct.name}`}
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

            {/* PEÇA CENTRAL PRINCIPAL (DESTAQUE MÁXIMO COM HANGTAGS) */}
            <div className="relative flex flex-col items-center z-20 transition-transform duration-500">
              {/* Cabide de Madeira Suspenso */}
              <WoodenHanger />

              {/* CONTAINER DO PRODUTO COM AS HANGTAGS SUSPENSAS NO OMBRO DIREITO */}
              <div className="relative">
                {/* -------------------------------------------------------- */}
                {/* HANGTAGS DE CORES SUSPENSAS POR CORDINHA (IGUAL AO VÍDEO) */}
                {/* Ficam penduradas na lateral direita da peça              */}
                {/* -------------------------------------------------------- */}
                {currentProduct.colors && currentProduct.colors.length > 1 && (
                  <div className="absolute -right-4 sm:-right-8 top-8 sm:top-10 z-40 flex items-start gap-1.5 sm:gap-2">
                    {currentProduct.colors.map((color, idx) => {
                      const isSelected = selectedColorIndex === idx;
                      return (
                        <button
                          key={color.hex + idx}
                          type="button"
                          onClick={() => setSelectedColorIndex(idx)}
                          title={`Selecionar cor: ${color.name}`}
                          className="group flex flex-col items-center cursor-pointer transition-transform duration-200 hover:-translate-y-1"
                        >
                          {/* Fio / Cordinha que suspende a etiqueta */}
                          <div
                            className={`w-[1px] transition-colors ${
                              isSelected
                                ? "h-6 sm:h-8 bg-neutral-800"
                                : "h-4 sm:h-6 bg-neutral-400 group-hover:bg-neutral-600"
                            }`}
                          />

                          {/* Etiqueta retangular de tecido (Hangtag) */}
                          <div
                            className={`w-4 h-7 sm:w-5 sm:h-9 rounded-[2px] border transition-all shadow-md relative overflow-hidden ${
                              isSelected
                                ? "border-black ring-2 ring-black/50 scale-110 shadow-lg"
                                : "border-neutral-400 hover:border-neutral-700 opacity-90 hover:opacity-100"
                            }`}
                            style={{ backgroundColor: color.hex }}
                          >
                            {/* Ilhós/furo no topo da etiqueta */}
                            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/80 border border-black/30" />
                          </div>

                          {/* Nome da cor */}
                          <span
                            className={`text-[8px] font-mono mt-1 uppercase transition-opacity ${
                              isSelected
                                ? "font-bold text-neutral-900 opacity-100"
                                : "text-neutral-500 opacity-0 group-hover:opacity-100"
                            }`}
                          >
                            {color.name.slice(0, 5)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Container 3D Flip da Camiseta */}
                <div
                  className="relative w-72 sm:w-80 md:w-96 aspect-[3/4] flex items-center justify-center cursor-pointer"
                  style={{ perspective: "1400px" }}
                  onClick={() => setIsModalOpen(true)}
                  title="Clique para ver disponibilidade e comprar"
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
            </div>

            {/* Peça Vizinha Direita (Desfocada / Em Profundidade de Campo) */}
            {total > 1 && (
              <div
                onClick={handleNext}
                className="hidden md:flex flex-col items-center absolute -right-14 lg:right-2 z-10 opacity-30 hover:opacity-50 transition-all duration-500 scale-75 blur-[1.8px] cursor-pointer pointer-events-auto"
                title={`Ver ${nextProduct.name}`}
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
                className="absolute right-2 sm:right-6 md:right-10 z-40 w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-neutral-300/80 bg-white/80 hover:bg-white text-neutral-800 hover:text-black flex items-center justify-center transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-sm"
              >
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        )}

        {/* CONTROLES INFERIORES NO MODO FOCO (TÍTULO, TOGGLE FRONT/BACK, SEE AVAILABILITY) */}
        {viewMode === "FOCUS" && (
          <div className="flex flex-col items-center text-center mt-2 sm:mt-4 space-y-2.5 pb-8">
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

            {/* Preço Discreto */}
            <div className="text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-widest">
              {formatCurrency(currentProduct.price)}
            </div>

            {/* BOTÃO SEE AVAILABILITY (IGUAL AO VÍDEO) */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="mt-1 px-6 py-2 rounded-md border border-neutral-800 hover:bg-[#0A0A0A] hover:text-[#F7F4EE] text-[11px] font-mono font-bold uppercase tracking-widest transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
            >
              SEE AVAILABILITY
            </button>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* FAIXA MARQUEE STREETWEAR VERDE NEON (IGUAL AO VÍDEO)            */}
      {/* Ticker contínuo horizontal com mensagem autoral Cordeiro Ink     */}
      {/* ============================================================== */}
      <div className="w-full bg-[#10E63D] text-black py-2.5 overflow-hidden select-none border-y border-black font-mono font-black text-xs tracking-widest uppercase">
        <div className="animate-marquee flex whitespace-nowrap">
          <span className="mx-4 flex items-center gap-3">
            <span>✦</span> CORDEIRO INK <span>✦</span> NOVO DROP <span>✦</span> IT'S US NEVER THEM <span>✦</span> STREETWEAR AUTORAL <span>✦</span> LIMITED EDITION <span>✦</span> MALHA HEAVYWEIGHT <span>✦</span> CONFIRA A ARARA
          </span>
          <span className="mx-4 flex items-center gap-3" aria-hidden="true">
            <span>✦</span> CORDEIRO INK <span>✦</span> NOVO DROP <span>✦</span> IT'S US NEVER THEM <span>✦</span> STREETWEAR AUTORAL <span>✦</span> LIMITED EDITION <span>✦</span> MALHA HEAVYWEIGHT <span>✦</span> CONFIRA A ARARA
          </span>
          <span className="mx-4 flex items-center gap-3" aria-hidden="true">
            <span>✦</span> CORDEIRO INK <span>✦</span> NOVO DROP <span>✦</span> IT'S US NEVER THEM <span>✦</span> STREETWEAR AUTORAL <span>✦</span> LIMITED EDITION <span>✦</span> MALHA HEAVYWEIGHT <span>✦</span> CONFIRA A ARARA
          </span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL DE DISPONIBILIDADE & COMPRA (SEE AVAILABILITY)           */}
      {/* Abre ao clicar em SEE AVAILABILITY ou na própria camiseta        */}
      {/* ============================================================== */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl bg-[#FAF9F6] border border-[#E6DED2] rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botão Fechar (X) */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/70 text-white hover:bg-black transition cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* LADO ESQUERDO: PREVIEW DA PEÇA EM CABIDE COM COR SELECIONADA */}
            <div className="w-full md:w-1/2 bg-[#F2ECE1] p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[#E6DED2] relative">
              <WoodenHanger />
              <div className="w-56 h-72 sm:w-64 sm:h-80 relative my-2">
                <ShirtLayeredRender
                  baseImage={viewSide === "FRONT" ? currentBase : currentBaseBack}
                  printImage={viewSide === "FRONT" ? currentPrint : currentPrintBack}
                  colorHex={currentColor.hex}
                  printTop={viewSide === "FRONT" ? printTop : printTopBack}
                  printLeft={viewSide === "FRONT" ? printLeft : printLeftBack}
                  printWidth={viewSide === "FRONT" ? printWidth : printWidthBack}
                  alt={currentProduct.name}
                />
              </div>

              {/* Botãozinho para alternar Frente / Costas dentro do modal */}
              <div className="inline-flex items-center p-0.5 rounded-full bg-neutral-300/80 border border-neutral-400 mt-2">
                <button
                  type="button"
                  onClick={() => setViewSide("FRONT")}
                  className={`px-3 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-widest transition-all cursor-pointer ${
                    viewSide === "FRONT"
                      ? "bg-[#0A0A0A] text-white shadow-sm"
                      : "text-neutral-700 hover:text-neutral-900"
                  }`}
                >
                  FRENTE
                </button>
                <button
                  type="button"
                  onClick={() => setViewSide("BACK")}
                  className={`px-3 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-widest transition-all cursor-pointer ${
                    viewSide === "BACK"
                      ? "bg-[#0A0A0A] text-white shadow-sm"
                      : "text-neutral-700 hover:text-neutral-900"
                  }`}
                >
                  COSTAS
                </button>
              </div>
            </div>

            {/* LADO DIREITO: SELETORES E FINALIZAÇÃO DE COMPRA */}
            <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-4">
                {/* Categoria / Coleção */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 font-bold">
                    {currentProduct.collection || "Drop 01"} • {currentProduct.category}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold flex items-center gap-1">
                    <Sparkles size={10} />
                    Disponível
                  </span>
                </div>

                {/* Título e Preço */}
                <div>
                  <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider text-[#0A0A0A]">
                    {currentProduct.name}
                  </h2>
                  <p className="text-xl sm:text-2xl font-serif font-bold text-[#0A0A0A] mt-1">
                    {formatCurrency(currentProduct.price)}
                  </p>
                </div>

                {/* Seletor de Cores */}
                {currentProduct.colors && currentProduct.colors.length > 0 && (
                  <div>
                    <label className="block text-[11px] font-mono uppercase font-bold tracking-wider text-neutral-600 mb-1.5">
                      Cor: <span className="text-black font-black">{currentColor.name}</span>
                    </label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {currentProduct.colors.map((c, idx) => {
                        const isSel = selectedColorIndex === idx;
                        return (
                          <button
                            key={c.hex + idx}
                            type="button"
                            onClick={() => setSelectedColorIndex(idx)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-2 transition cursor-pointer ${
                              isSel
                                ? "border-[#0A0A0A] bg-[#0A0A0A] text-white shadow-sm"
                                : "border-neutral-300 bg-white text-neutral-800 hover:border-neutral-600"
                            }`}
                          >
                            <span
                              className="w-3 h-3 rounded-full border border-white/40 shrink-0"
                              style={{ backgroundColor: c.hex }}
                            />
                            <span>{c.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Seletor de Tamanhos */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-mono uppercase font-bold tracking-wider text-neutral-600">
                      Tamanho
                    </label>
                    <span className="text-[10px] font-mono text-neutral-500">
                      Modelagem Streetwear Ampla
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {["P", "M", "G", "GG"].map((sz) => {
                      const isSel = modalSize === sz;
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setModalSize(sz)}
                          className={`py-2 rounded-xl text-xs font-mono font-bold transition cursor-pointer border ${
                            isSel
                              ? "border-[#0A0A0A] bg-[#0A0A0A] text-white shadow-sm"
                              : "border-neutral-300 bg-white text-neutral-800 hover:border-neutral-500"
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quantidade */}
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-neutral-600">
                    Qtd:
                  </span>
                  <div className="flex items-center border border-neutral-300 rounded-xl bg-white overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setModalQuantity((q) => Math.max(1, q - 1))}
                      className="p-1.5 hover:bg-neutral-100 transition cursor-pointer"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-3 text-xs font-mono font-bold">{modalQuantity}</span>
                    <button
                      type="button"
                      onClick={() => setModalQuantity((q) => q + 1)}
                      className="p-1.5 hover:bg-neutral-100 transition cursor-pointer"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Descrição & Especificações Técnicas */}
                <div className="pt-2 border-t border-neutral-200/80 space-y-1 text-[11px] text-neutral-600 leading-relaxed">
                  <p>{currentProduct.description}</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-neutral-500 pt-1">
                    <li>100% Algodão Premium Penteado Heavyweight</li>
                    <li>Gola canelada de 3cm com pesponto reforçado</li>
                    <li>Estampa toque zero em alta resolução</li>
                  </ul>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="pt-4 mt-4 border-t border-neutral-200/80 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#0A0A0A] hover:bg-neutral-800 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ShoppingBag size={14} />
                  <span>Adicionar à Sacola</span>
                </button>

                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 rounded-xl border border-neutral-300 hover:border-emerald-600 hover:bg-emerald-50 text-neutral-800 hover:text-emerald-700 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <MessageCircle size={14} />
                  <span>Pedir no Whats</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
