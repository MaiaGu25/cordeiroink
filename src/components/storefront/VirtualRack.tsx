"use client";

import React, { useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";
import {
  X,
  ShoppingBag,
  Sparkles,
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
 * Ícone SVG da logo oficial da "Cordeiro Ink" utilizado como seletor dinâmico de cores.
 * É preenchido dinamicamente com a cor da variação (fill={color.hex}).
 */
function CordeiroInkLogoIcon({
  fill,
  size = 28,
  className = "",
}: {
  fill: string;
  size?: number;
  className?: string;
}) {
  const isLight =
    fill.toLowerCase() === "#ffffff" ||
    fill.toLowerCase() === "#fff" ||
    fill.toLowerCase() === "#fdfdfd" ||
    fill.toLowerCase() === "#fafafa" ||
    fill.toLowerCase() === "#f9f9f9" ||
    fill.toLowerCase() === "#efece6" ||
    fill.toLowerCase() === "#f5f5f0";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Silhueta minimalista streetwear do Cordeiro */}
      <path
        d="M18 3C13.5 3 10.5 6 10.5 10C10.5 12 11.5 13.8 13 15V20.5L8.5 25.5V33H12.5L15.5 28.5H20.5L23.5 33H27.5V25.5L23 20.5V15C24.5 13.8 25.5 12 25.5 10C25.5 6 22.5 3 18 3Z"
        fill={fill}
        stroke="#0A0A0A"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {/* Detalhe dos chifres curvos */}
      <path
        d="M13 7.5C11.5 6.5 9 7 9 9C9 10.5 11 11 12 10.5"
        stroke="#0A0A0A"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M23 7.5C24.5 6.5 27 7 27 9C27 10.5 25 11 24 10.5"
        stroke="#0A0A0A"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Cruz Sagrada minimalista */}
      <path
        d="M18 8.5V18M14.5 12H21.5"
        stroke={isLight ? "#0A0A0A" : "#FFFFFF"}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Cabide de madeira esculpida agrupado com position: absolute na gola da camiseta.
 * Move-se solidariamente com a peça durante o arraste e física da arara.
 */
function WoodenHanger({ isMini = false }: { isMini?: boolean }) {
  if (isMini) {
    return (
      <div className="flex flex-col items-center select-none pointer-events-none z-30">
        <svg
          width="18"
          height="18"
          viewBox="0 0 26 26"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-neutral-500"
        >
          <path
            d="M13 2C15.5 2 17.5 4 17.5 6.5C17.5 8.5 16 10 14.5 10.8L13 11.8V16"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <circle cx="13" cy="2" r="1.5" fill="currentColor" />
        </svg>
        <svg
          width="70"
          height="14"
          viewBox="0 0 110 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="-mt-1.5"
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
    <div className="flex flex-col items-center select-none pointer-events-none z-30">
      {/* Gancho Metálico Prateado - alinhado com o trilho da arara */}
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-neutral-500 drop-shadow-[0_2px_3px_rgba(0,0,0,0.25)]"
      >
        <path
          d="M14 2C16.8 2 19 4.2 19 7C19 9.2 17.2 11 15.5 11.9L14 12.9V18"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <circle cx="14" cy="2" r="1.5" fill="currentColor" />
      </svg>

      {/* Corpo de Madeira Esculpida com Chanfros Realistas */}
      <svg
        width="116"
        height="24"
        viewBox="0 0 110 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="-mt-2.5 drop-shadow-[0_4px_6px_rgba(0,0,0,0.2)]"
      >
        <path
          d="M55 2C42 7 18 13 4 19C15 20 40 16 55 16C70 16 95 20 106 19C92 13 68 7 55 2Z"
          fill="url(#hangerWoodGrad)"
        />
        <path
          d="M55 2L4 19C15 20 40 16 55 16C70 16 95 20 106 19L55 2Z"
          stroke="#4A2E18"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient
            id="hangerWoodGrad"
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
 * Função auxiliar para detectar cores brancas ou quase brancas.
 */
function isWhiteColor(hex: string): boolean {
  if (!hex) return false;
  const h = hex.trim().toLowerCase();
  return (
    h === "#ffffff" ||
    h === "#fff" ||
    h === "#fdfdfd" ||
    h === "#fafafa" ||
    h === "#f9f9f9" ||
    h === "#f5f5f5"
  );
}

/**
 * Renderizador de 3 Camadas Dinâmicas com CSS Blend Modes e Tratamento Especial para Branco:
 * 1. Fundo (cor selecionada mascarada pela silhueta exata da peça, desativada para branco)
 * 2. Textura: para branco usa filter: brightness(1.8) contrast(1.1) sem multiply; para cores usa mix-blend-multiply
 * 3. Arte: estampa PNG isolada com coordenadas dinâmicas e fundo 100% transparente
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
  const isWhite = isWhiteColor(colorHex);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-visible select-none bg-transparent">
      {/* Camada 1: Fundo com a cor selecionada (mascarada com o contorno da camiseta). Desativada se for cor branca */}
      {!isWhite && (
        <div
          className="absolute inset-0 pointer-events-none transition-colors duration-300 bg-transparent"
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
      )}

      {/* Camada 2: Mockup cinza. Se for branco: filter: brightness(1.8) contrast(1.1) sem multiply. Se colorido: mix-blend-multiply */}
      <img
        src={effectiveBase}
        alt={alt}
        className={`absolute inset-0 w-full h-full object-contain pointer-events-none select-none bg-transparent ${
          isWhite ? "" : "mix-blend-multiply"
        }`}
        style={
          isWhite
            ? { filter: "brightness(1.8) contrast(1.1)" }
            : undefined
        }
        loading="eager"
      />

      {/* Camada 3: Arte isolada da estampa PNG transparente com posicionamento dinâmico */}
      {printImage && (
        <div
          className="absolute pointer-events-none select-none transition-all duration-150 z-20"
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
            className="w-full h-auto object-contain select-none bg-transparent"
            loading="eager"
          />
        </div>
      )}
    </div>
  );
}

/**
 * Coleção de demonstração fiel ao estilo streetwear da marca.
 */
const DEFAULT_STREETWEAR_ITEMS: VirtualRackProduct[] = [
  {
    id: "demo-crimson-memory",
    name: "CRIMSON MEMORY LS SHIRT",
    price: 189.9,
    category: "Camisa",
    collection: "Drop 01 - Lagos",
    description:
      "Camisa manga longa estruturada em algodão premium com estampa de punhal no peito e arte dorsal impactante.",
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
        hex: "#FFFFFF",
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
  const [isFocused, setIsFocused] = useState(false);

  // COSTAS COMO VISÃO PADRÃO AO CARREGAR A PÁGINA (BACK)
  const [viewSide, setViewSide] = useState<"FRONT" | "BACK">("BACK");
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados do Modal de Compra
  const [modalSize, setModalSize] = useState("M");
  const [modalQuantity, setModalQuantity] = useState(1);

  const total = activeProducts.length;
  const currentProduct = activeProducts[selectedIndex] || activeProducts[0];

  // Motion value para arraste e rotação dinâmica
  const dragX = useMotionValue(0);
  const rackRotation = useTransform(dragX, [-200, 0, 200], [4.5, 0, -4.5]);

  const currentColor =
    currentProduct.colors?.[selectedColorIndex] ||
    currentProduct.colors?.[0] || {
      name: "Preto",
      hex: "#18181b",
      imageUrl: "",
    };

  const currentBase = currentProduct.baseImage || "/mockups/blank-front.svg";
  const currentBaseBack = currentProduct.baseBackImage || "/mockups/blank-back.svg";
  const currentPrint = currentProduct.printImage || currentProduct.imageUrl;
  const currentPrintBack =
    currentProduct.printBackImage || currentProduct.backImageUrl || currentPrint;

  const printTop = currentProduct.printTop ?? 28.0;
  const printLeft = currentProduct.printLeft ?? 50.0;
  const printWidth = currentProduct.printWidth ?? 45.0;

  const printTopBack = currentProduct.printTopBack ?? 25.0;
  const printLeftBack = currentProduct.printLeftBack ?? 50.0;
  const printWidthBack = currentProduct.printWidthBack ?? 50.0;

  const handleNext = () => {
    setSelectedIndex((prev) => (prev + 1) % total);
    setViewSide("BACK");
    setSelectedColorIndex(0);
  };

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev - 1 + total) % total);
    setViewSide("BACK");
    setSelectedColorIndex(0);
  };

  const handleSelectProduct = (index: number) => {
    setSelectedIndex(index);
    setViewSide("BACK");
    setSelectedColorIndex(0);
    setViewMode("FOCUS");
    setIsFocused(true);
  };

  // Arraste fluido via Framer Motion sem necessidade de setas genéricas
  const handleDragEnd = (
    _: any,
    info: { offset: { x: number; y: number }; velocity: { x: number; y: number } }
  ) => {
    const swipeThreshold = 50;
    const velocityThreshold = 250;

    if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
      handleNext();
    } else if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
      handlePrev();
    }
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
    <section className="relative w-full bg-[#F7F4EE] text-[#0A0A0A] pt-6 sm:pt-10 md:pt-12 pb-6 sm:pb-10 overflow-hidden select-none border-b border-neutral-300">
      <div className="max-w-6xl mx-auto px-4 relative">
        {/* BARRA SUPERIOR: ALTERNADOR DISCRETO [ ⊞ ARARA COMPLETA | ◫ FOCAR PEÇA ] */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
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
        <div className="relative w-full max-w-5xl mx-auto mb-[-6px] z-10 pointer-events-none">
          <div className="h-2 w-full bg-gradient-to-r from-neutral-400 via-neutral-300 to-neutral-400 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.15)] border border-neutral-300 relative">
            {/* Ponteiras industriais */}
            <div className="absolute -left-2 -top-1 w-4 h-4 rounded-full bg-neutral-800 border border-neutral-600 shadow" />
            <div className="absolute -right-2 -top-1 w-4 h-4 rounded-full bg-neutral-800 border border-neutral-600 shadow" />
            {/* Brilho do metal escovado */}
            <div className="absolute inset-x-8 top-0.5 h-[1px] bg-white/60" />
          </div>
        </div>

        {/* ============================================================== */}
        {/* MODO 1: VISÃO DA ARARA COMPLETA (PANORÂMICA)                    */}
        {/* ============================================================== */}
        {viewMode === "OVERVIEW" && (
          <div className="flex flex-col items-center py-6 sm:py-10 animate-in fade-in duration-300">
            <div className="w-full overflow-x-auto pb-6 scrollbar-none flex items-start justify-center gap-4 sm:gap-6 md:gap-8 px-4">
              {activeProducts.map((prod, idx) => {
                const isCurrent = idx === selectedIndex;
                const prodColor = prod.colors?.[0]?.hex || "#18181b";
                return (
                  <motion.div
                    key={prod.id}
                    onClick={() => handleSelectProduct(idx)}
                    whileHover={{ y: -6, scale: 1.03 }}
                    className="flex flex-col items-center cursor-pointer group shrink-0 transition-all bg-transparent"
                  >
                    {/* Container da Peça com Cabide em position: absolute posicionado na gola */}
                    <div
                      className={`relative w-28 h-36 sm:w-36 sm:h-48 md:w-40 md:h-52 bg-transparent transition-all duration-300 ${
                        isCurrent
                          ? "scale-105 filter drop-shadow-[0_12px_20px_rgba(0,0,0,0.22)]"
                          : "opacity-85 group-hover:opacity-100 filter drop-shadow-[0_6px_12px_rgba(0,0,0,0.12)]"
                      }`}
                    >
                      {/* Cabide posicionado com position: absolute na gola da peça */}
                      <div className="absolute -top-3 sm:-top-3.5 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                        <WoodenHanger isMini />
                      </div>

                      <ShirtLayeredRender
                        baseImage={prod.baseBackImage || prod.baseImage || "/mockups/blank-back.svg"}
                        printImage={prod.printBackImage || prod.printImage || prod.imageUrl}
                        colorHex={prodColor}
                        printTop={prod.printTopBack ?? 25}
                        printLeft={prod.printLeftBack ?? 50}
                        printWidth={prod.printWidthBack ?? 50}
                        alt={prod.name}
                      />
                    </div>

                    <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-center max-w-[120px] mt-2 group-hover:text-amber-600 transition-colors line-clamp-1">
                      {prod.name}
                    </span>
                    <span className="text-[9px] font-mono font-bold text-neutral-500">
                      {formatCurrency(prod.price)}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-6 py-2 rounded-md border border-neutral-800 hover:bg-[#0A0A0A] hover:text-[#F7F4EE] text-[11px] font-mono font-bold uppercase tracking-widest transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
            >
              SEE AVAILABILITY
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODO 2: VISÃO DE FOCO COM CARROSSEL NATIVO DE ARRASTE (DRAG)    */}
        {/* Cabide com position: absolute na gola, logo SVG e costas padrão */}
        {/* ============================================================== */}
        {viewMode === "FOCUS" && (
          <div className="relative flex items-center justify-center min-h-[460px] sm:min-h-[520px] md:min-h-[560px] overflow-visible">
            {/* Área de Arraste Touch & Mouse fluida (Framer Motion) */}
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.65}
              onDragEnd={handleDragEnd}
              style={{ x: dragX, rotate: rackRotation }}
              className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing bg-transparent select-none touch-pan-y"
            >
              {/* RENDERIZAÇÃO DAS PEÇAS EM PROFUNDIDADE DE CAMPO AO LONGO DO TRILHO */}
              {activeProducts.map((prod, idx) => {
                let diff = (idx - selectedIndex + total) % total;
                if (diff > total / 2) diff -= total;

                // Renderiza a peça ativa e até 2 vizinhas de cada lado
                if (Math.abs(diff) > 2) return null;

                const isCenter = diff === 0;
                const prodBase = isCenter
                  ? viewSide === "BACK"
                    ? currentBaseBack
                    : currentBase
                  : prod.baseBackImage || prod.baseImage || "/mockups/blank-back.svg";

                const prodPrint = isCenter
                  ? viewSide === "BACK"
                    ? currentPrintBack
                    : currentPrint
                  : prod.printBackImage || prod.printImage || prod.imageUrl;

                const prodColor = isCenter
                  ? currentColor.hex
                  : prod.colors?.[0]?.hex || "#18181b";

                const pTop = isCenter
                  ? viewSide === "BACK"
                    ? printTopBack
                    : printTop
                  : prod.printTopBack ?? 25;

                const pLeft = isCenter
                  ? viewSide === "BACK"
                    ? printLeftBack
                    : printLeft
                  : prod.printLeftBack ?? 50;

                const pWidth = isCenter
                  ? viewSide === "BACK"
                    ? printWidthBack
                    : printWidth
                  : prod.printWidthBack ?? 50;

                return (
                  <motion.div
                    key={prod.id}
                    onClick={() => {
                      if (!isCenter) handleSelectProduct(idx);
                    }}
                    animate={{
                      x: diff * (typeof window !== "undefined" && window.innerWidth < 640 ? 210 : 280),
                      scale: isCenter ? 1 : 0.76,
                      opacity: isCenter ? 1 : Math.abs(diff) === 1 ? 0.32 : 0,
                      filter: isCenter ? "blur(0px)" : "blur(2.2px)",
                      zIndex: isCenter ? 30 : 10 - Math.abs(diff),
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 280,
                      damping: 28,
                      mass: 0.8,
                    }}
                    className={`absolute flex flex-col items-center bg-transparent ${
                      isCenter ? "cursor-default" : "cursor-pointer pointer-events-auto"
                    }`}
                  >
                    {/* CONTAINER DA CAMISETA (COM O CABIDE AGRUPADO DENTRO EM POSITION: ABSOLUTE NA GOLA) */}
                    <div className="relative bg-transparent">
                      {/* CONTAINER DA CAMISETA COM CABIDE DENTRO NA GOLA */}
                      <div
                        className="relative w-72 sm:w-80 md:w-96 aspect-[3/4] flex items-center justify-center bg-transparent cursor-pointer group"
                        style={{ perspective: "1400px" }}
                        onClick={(e) => {
                          if (isCenter) {
                            e.stopPropagation();
                            setIsFocused(true);
                          }
                        }}
                      >
                        {/* CABIDE AGRUPADO DENTRO DO CONTAINER: position: absolute na gola da camiseta */}
                        <div className="absolute -top-6 sm:-top-7 left-1/2 -translate-x-1/2 z-30 pointer-events-none transition-transform group-hover:scale-105">
                          <WoodenHanger />
                        </div>

                        {/* CARTÃO 3D COM GIRO DAS COSTAS E FRENTE */}
                        <div
                          className="w-full h-full relative transition-transform duration-700 ease-out bg-transparent group-hover:scale-[1.02]"
                          style={{
                            transformStyle: "preserve-3d",
                            transform:
                              isCenter && viewSide === "FRONT"
                                ? "rotateY(180deg)"
                                : "rotateY(0deg)",
                          }}
                        >
                          {/* Face Traseira (Visão padrão ao carregar) */}
                          <div
                            className="absolute inset-0 flex items-center justify-center overflow-visible bg-transparent"
                            style={{
                              backfaceVisibility: "hidden",
                              WebkitBackfaceVisibility: "hidden",
                            }}
                          >
                            <ShirtLayeredRender
                              baseImage={prodBase}
                              printImage={prodPrint}
                              colorHex={prodColor}
                              printTop={pTop}
                              printLeft={pLeft}
                              printWidth={pWidth}
                              alt={`${prod.name} - Costas`}
                            />
                          </div>

                          {/* Face Frontal (Aparece ao alternar para FRONT com flip de 180deg) */}
                          {isCenter && (
                            <div
                              className="absolute inset-0 flex items-center justify-center overflow-visible bg-transparent"
                              style={{
                                backfaceVisibility: "hidden",
                                WebkitBackfaceVisibility: "hidden",
                                transform: "rotateY(180deg)",
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
                          )}
                        </div>

                        {/* Indicador sutil de clique para focar */}
                        {isCenter && (
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-mono text-white flex items-center gap-1.5 shadow-lg pointer-events-none">
                            <Maximize2 size={11} />
                            <span>Clique para focar</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        )}

        {/* CONTROLES INFERIORES NO MODO ARARA (TÍTULO, PREÇO E BOTÃO DE FOCO) */}
        {viewMode === "FOCUS" && (
          <div className="flex flex-col items-center text-center mt-2 sm:mt-4 space-y-2 pb-4">
            <h3 className="text-sm sm:text-base md:text-lg font-black uppercase tracking-wider text-[#0A0A0A] max-w-md mx-auto">
              {currentProduct.name}
            </h3>

            <div className="text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-widest">
              {formatCurrency(currentProduct.price)}
            </div>

            {/* BOTÃO PARA ATIVAR O MODO FOCO IMERSIVO */}
            <button
              type="button"
              onClick={() => setIsFocused(true)}
              className="mt-1 px-5 py-2 rounded-full bg-[#0A0A0A] text-[#F7F4EE] hover:bg-neutral-800 text-[11px] font-mono font-bold uppercase tracking-widest transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Maximize2 size={13} />
              <span>FOCAR PEÇA & CORES</span>
            </button>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* MODO DE FOCO IMERSIVO COM BACKDROP-BLUR-MD                     */}
      {/* Destaque suave com zoom, controles limpos e dismiss ao clicar fora */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isFocused && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none overflow-y-auto">
            {/* Overlay com Fundo Borrado (backdrop-blur-md) escurecendo levemente o restante do site */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsFocused(false)}
              className="fixed inset-0 bg-black/65 backdrop-blur-md cursor-pointer"
            />

            {/* Botão discreto de fechar no topo direito */}
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setIsFocused(false)}
              className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 p-2.5 rounded-full bg-neutral-900/90 hover:bg-black text-white border border-neutral-700 shadow-2xl cursor-pointer transition-transform hover:scale-110 active:scale-95"
              title="Fechar foco"
            >
              <X size={18} />
            </motion.button>

            {/* Card Central da Peça em Destaque (Zoom Suave e Projeção Frontal) */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="relative z-50 flex flex-col items-center max-w-lg w-full py-4 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Container da Peça com Cabide e Seleção de Cores */}
              <div className="relative flex items-center justify-center">
                {/* SELEÇÃO DE CORES VIA LOGO DA CORDEIRO INK (Visíveis de forma elegante no modo foco) */}
                {currentProduct.colors && currentProduct.colors.length > 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    className="absolute -right-6 sm:-right-10 md:-right-12 top-8 sm:top-12 z-40 flex flex-col items-center gap-2.5 bg-neutral-900/80 backdrop-blur-sm p-1.5 sm:p-2 rounded-2xl border border-neutral-700/80 shadow-2xl"
                  >
                    <span className="text-[8px] font-mono font-bold tracking-widest text-neutral-300 uppercase -rotate-90 origin-center my-1">
                      CORES
                    </span>
                    {currentProduct.colors.map((color, cIdx) => {
                      const isSelected = selectedColorIndex === cIdx;
                      return (
                        <button
                          key={color.hex + cIdx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedColorIndex(cIdx);
                          }}
                          title={`Cor: ${color.name}`}
                          className={`group flex items-center justify-center p-1 rounded-xl transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? "scale-125 filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] ring-2 ring-white bg-white/20"
                              : "opacity-75 hover:opacity-100 hover:scale-110"
                          }`}
                        >
                          <CordeiroInkLogoIcon fill={color.hex} size={28} />
                        </button>
                      );
                    })}
                  </motion.div>
                )}

                {/* Garment com Cabide na gola e Flip 3D */}
                <div
                  className="relative w-72 sm:w-80 md:w-96 aspect-[3/4] flex items-center justify-center"
                  style={{ perspective: "1400px" }}
                >
                  {/* Cabide esculpido na gola */}
                  <div className="absolute -top-6 sm:-top-7 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                    <WoodenHanger />
                  </div>

                  {/* Cartão com Giro 3D */}
                  <div
                    className="w-full h-full relative transition-transform duration-700 ease-out"
                    style={{
                      transformStyle: "preserve-3d",
                      transform: viewSide === "FRONT" ? "rotateY(180deg)" : "rotateY(0deg)",
                    }}
                  >
                    {/* Face Traseira (Costas como padrão) */}
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
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

                    {/* Face Frontal (Flip 180deg) */}
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
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
                  </div>
                </div>
              </div>

              {/* CONTROLES LIMPOS: Alternador Cápsula [ BACK | FRONT ] */}
              <div className="inline-flex items-center p-0.5 rounded-full bg-neutral-900/90 border border-neutral-700 shadow-xl mt-3">
                <button
                  type="button"
                  onClick={() => setViewSide("BACK")}
                  className={`px-4 py-1 rounded-full text-[11px] font-mono font-bold tracking-widest transition-all cursor-pointer ${
                    viewSide === "BACK"
                      ? "bg-white text-neutral-950 shadow-sm"
                      : "text-neutral-300 hover:text-white"
                  }`}
                >
                  BACK
                </button>
                <button
                  type="button"
                  onClick={() => setViewSide("FRONT")}
                  className={`px-4 py-1 rounded-full text-[11px] font-mono font-bold tracking-widest transition-all cursor-pointer ${
                    viewSide === "FRONT"
                      ? "bg-white text-neutral-950 shadow-sm"
                      : "text-neutral-300 hover:text-white"
                  }`}
                >
                  FRONT
                </button>
              </div>

              {/* Informações da Peça */}
              <div className="mt-3 space-y-1">
                <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
                  {currentProduct.name}
                </h3>
                <p className="text-xs font-mono font-bold text-neutral-300">
                  {formatCurrency(currentProduct.price)} • {currentColor.name}
                </p>
                {currentProduct.description && (
                  <p className="text-[11px] text-neutral-400 max-w-sm mx-auto line-clamp-2 px-2">
                    {currentProduct.description}
                  </p>
                )}
              </div>

              {/* Botão SEE AVAILABILITY */}
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsFocused(false);
                    setIsModalOpen(true);
                  }}
                  className="px-6 py-2.5 rounded-full bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-mono font-bold uppercase tracking-widest transition-all cursor-pointer shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <ShoppingBag size={14} />
                  <span>SEE AVAILABILITY</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* MODAL DE DISPONIBILIDADE & COMPRA (SEE AVAILABILITY)           */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="relative w-full max-w-3xl bg-[#FAF9F6] border border-[#E6DED2] rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col md:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/70 text-white hover:bg-black transition cursor-pointer"
              >
                <X size={18} />
              </button>

              {/* LADO ESQUERDO: PREVIEW DA PEÇA COM CABIDE NA GOLA */}
              <div className="w-full md:w-1/2 bg-[#F2ECE1] p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[#E6DED2] relative">
                <div className="relative w-56 h-72 sm:w-64 sm:h-80 my-2 bg-transparent">
                  <div className="absolute -top-5 sm:-top-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                    <WoodenHanger />
                  </div>
                  <ShirtLayeredRender
                    baseImage={viewSide === "BACK" ? currentBaseBack : currentBase}
                    printImage={viewSide === "BACK" ? currentPrintBack : currentPrint}
                    colorHex={currentColor.hex}
                    printTop={viewSide === "BACK" ? printTopBack : printTop}
                    printLeft={viewSide === "BACK" ? printLeftBack : printLeft}
                    printWidth={viewSide === "BACK" ? printWidthBack : printWidth}
                    alt={currentProduct.name}
                  />
                </div>

                <div className="inline-flex items-center p-0.5 rounded-full bg-neutral-300/80 border border-neutral-400 mt-2">
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
                </div>
              </div>

              {/* LADO DIREITO: SELETORES E COMPRA */}
              <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 font-bold">
                      {currentProduct.collection || "Drop 01"} • {currentProduct.category}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold flex items-center gap-1">
                      <Sparkles size={10} />
                      Disponível
                    </span>
                  </div>

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
                              <CordeiroInkLogoIcon fill={c.hex} size={16} />
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

                  <div className="pt-2 border-t border-neutral-200/80 space-y-1 text-[11px] text-neutral-600 leading-relaxed">
                    <p>{currentProduct.description}</p>
                    <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-neutral-500 pt-1">
                      <li>100% Algodão Premium Penteado Heavyweight</li>
                      <li>Gola canelada de 3cm com costura pespontada reforçada</li>
                      <li>Estampa toque zero em alta definição</li>
                    </ul>
                  </div>
                </div>

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
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
