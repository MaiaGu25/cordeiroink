"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  X,
  MessageCircle,
  Sparkles,
  Check,
  ShoppingBag,
  Plus,
  Minus,
} from "lucide-react";
import { CATALOG_CATEGORIES, type CatalogCategory } from "@/lib/storefront-constants";
import { useCart } from "./CartContext";
import { ShippingCalculator } from "@/components/shipping/ShippingCalculator";
import type { ShippingOption } from "@/lib/shipping-constants";

import type { AvailableStockSize } from "@/actions/storefront";

export interface CatalogVariant {
  id: string;
  catalogItemId?: string;
  colorName: string;
  hexCode: string;
  imageUrl: string;
}

export interface CatalogItem {
  id: string;
  title: string;
  description: string | null;
  price: number;
  imageUrl: string;
  category: string;
  isActive: boolean;
  variants?: CatalogVariant[];
}

interface StorefrontCatalogProps {
  items: CatalogItem[];
  stockItems?: AvailableStockSize[];
}

// Exemplos realistas com múltiplas variações e fotos para a vitrine
const PLACEHOLDER_ITEMS: CatalogItem[] = [
  {
    id: "sample-1",
    title: "Blessed Heritage Heavyweight Tee",
    category: "Oversized",
    price: 149.9,
    description:
      "Modelagem streetwear autoral em malha 100% algodão 260gsm. Corte amplo e estruturado com gola canelada de 3cm e costura ombro a ombro reforçada.",
    imageUrl:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop",
    isActive: true,
    variants: [
      {
        id: "v1-1",
        colorName: "Preto Street",
        hexCode: "#0D0D0D",
        imageUrl:
          "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop",
      },
      {
        id: "v1-2",
        colorName: "Off-White Raw",
        hexCode: "#F5F5F0",
        imageUrl:
          "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1000&auto=format&fit=crop",
      },
      {
        id: "v1-3",
        colorName: "Marrom Cacau",
        hexCode: "#4A2E18",
        imageUrl:
          "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=1000&auto=format&fit=crop",
      },
    ],
  },
  {
    id: "sample-2",
    title: "Nocturnal Wolf Cyberpunk Tee",
    category: "Adulto",
    price: 159.9,
    description:
      "Estampa dorsal A3 em alta gramatura com toque zero. Prensagem térmica industrial a 160°C de máxima durabilidade.",
    imageUrl:
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop",
    isActive: true,
    variants: [
      {
        id: "v2-1",
        colorName: "Preto Fundo",
        hexCode: "#121212",
        imageUrl:
          "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop",
      },
      {
        id: "v2-2",
        colorName: "Cinza Chumbo",
        hexCode: "#333333",
        imageUrl:
          "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000&auto=format&fit=crop",
      },
    ],
  },
  {
    id: "sample-3",
    title: "Minimal Gothic Boxy Fit",
    category: "Feminina",
    price: 139.9,
    description:
      "Modelagem boxy crop com caimento impecável. Confeccionada em algodão penteado de toque macio e estampa frontal discreta.",
    imageUrl:
      "https://images.unsplash.com/photo-1554568218-0f1715e72254?q=80&w=1000&auto=format&fit=crop",
    isActive: true,
    variants: [
      {
        id: "v3-1",
        colorName: "Creme Baunilha",
        hexCode: "#F7F2E7",
        imageUrl:
          "https://images.unsplash.com/photo-1554568218-0f1715e72254?q=80&w=1000&auto=format&fit=crop",
      },
      {
        id: "v3-2",
        colorName: "Preto Clássico",
        hexCode: "#000000",
        imageUrl:
          "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop",
      },
    ],
  },
  {
    id: "sample-4",
    title: "Core Urban Tank Regata",
    category: "Regata",
    price: 119.9,
    description:
      "Cava larga e costura estruturada. O caimento clássico do basquete urbano com a estética minimalista da Cordeiro Ink.",
    imageUrl:
      "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?q=80&w=1000&auto=format&fit=crop",
    isActive: true,
    variants: [
      {
        id: "v4-1",
        colorName: "Preto",
        hexCode: "#0F0F0F",
        imageUrl:
          "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?q=80&w=1000&auto=format&fit=crop",
      },
      {
        id: "v4-2",
        colorName: "Branco Neve",
        hexCode: "#FAFAFA",
        imageUrl:
          "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1000&auto=format&fit=crop",
      },
    ],
  },
];

export function StorefrontCatalog({ items, stockItems }: StorefrontCatalogProps) {
  const displayItems = items && items.length > 0 ? items : PLACEHOLDER_ITEMS;
  const brandPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "5511999999999";

  // Filtro de Categoria
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");

  // Modal de Detalhes com Carrossel
  const [activeModalProduct, setActiveModalProduct] = useState<CatalogItem | null>(null);

  const filteredItems =
    selectedCategory === "Todas"
      ? displayItems
      : displayItems.filter(
          (item) => item.category?.toLowerCase() === selectedCategory.toLowerCase()
        );

  return (
    <section id="catalogo" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto space-y-10 sm:space-y-14">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E6DED2] pb-8">
          <div className="space-y-3">
            <span className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#737373] font-semibold block">
              Streetwear Cristão & Coleção Autoral
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-[#0A0A0A]">
              Peças em Destaque
            </h2>
          </div>

          <p className="font-sans text-xs sm:text-sm text-[#737373] max-w-md font-light leading-relaxed">
            Cada camiseta é cortada e prensada sob demanda no ateliê em malha heavyweight com estampas cristãs que carregam uma mensagem viva.
          </p>
        </div>

        {/* Categorias: Filtro Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("Todas")}
            className={`px-4 py-2 rounded-full text-xs font-sans font-semibold tracking-wider uppercase transition cursor-pointer shrink-0 ${
              selectedCategory === "Todas"
                ? "bg-[#0A0A0A] text-[#F7F4EE] shadow-sm"
                : "bg-[#F2ECE1] text-[#737373] hover:text-[#0A0A0A] hover:bg-[#E6DED2]"
            }`}
          >
            Todas ({displayItems.length})
          </button>

          {CATALOG_CATEGORIES.map((cat) => {
            const count = displayItems.filter(
              (i) => i.category?.toLowerCase() === cat.toLowerCase()
            ).length;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-sans font-semibold tracking-wider uppercase transition cursor-pointer shrink-0 ${
                  selectedCategory === cat
                    ? "bg-[#0A0A0A] text-[#F7F4EE] shadow-sm"
                    : "bg-[#F2ECE1] text-[#737373] hover:text-[#0A0A0A] hover:bg-[#E6DED2]"
                }`}
              >
                {cat} {count > 0 ? `(${count})` : ""}
              </button>
            );
          })}
        </div>

        {/* Product Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-[#F7F4EE] rounded-3xl border border-dashed border-[#D5CABE] space-y-3">
            <p className="font-serif text-xl text-[#0A0A0A]">
              Nenhum produto cadastrado na categoria "{selectedCategory}".
            </p>
            <p className="font-sans text-xs text-[#737373]">
              Selecione outra categoria ou veja todas as peças disponíveis.
            </p>
            <button
              onClick={() => setSelectedCategory("Todas")}
              className="mt-2 px-4 py-2 rounded-full bg-[#0A0A0A] text-[#F7F4EE] text-xs font-semibold uppercase tracking-wider"
            >
              Ver Todas as Peças
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {filteredItems.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                brandPhone={brandPhone}
                onOpenDetails={() => setActiveModalProduct(product)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalhes com Carrossel de Fotos por Cor */}
      {activeModalProduct && (
        <ProductDetailModal
          product={activeModalProduct}
          brandPhone={brandPhone}
          stockItems={stockItems}
          onClose={() => setActiveModalProduct(null)}
        />
      )}
    </section>
  );
}

/**
 * Card individual com interatividade nas bolinhas de cores (swatches).
 * Clicar ou passar o mouse na cor troca a foto do card instantaneamente!
 */
function ProductCard({
  product,
  brandPhone,
  onOpenDetails,
}: {
  product: CatalogItem;
  brandPhone: string;
  onOpenDetails: () => void;
}) {
  const allVariants = product.variants && product.variants.length > 0 ? product.variants : [];
  const [activeImage, setActiveImage] = useState<string>(product.imageUrl);
  const [activeColorName, setActiveColorName] = useState<string | null>(
    allVariants[0]?.colorName || null
  );

  const whatsappMsg = encodeURIComponent(
    `Olá! Vi a peça "${product.title}"${
      activeColorName ? ` na cor ${activeColorName}` : ""
    } (${formatCurrency(product.price)}) na vitrine da Cordeiro Ink e gostaria de encomendar.`
  );
  const waLink = `https://wa.me/${brandPhone}?text=${whatsappMsg}`;

  return (
    <div className="group flex flex-col justify-between space-y-4">
      <div>
        {/* Photo Container with click to open details */}
        <div
          onClick={onOpenDetails}
          className="relative aspect-[3/4] w-full overflow-hidden bg-[#F2ECE1] rounded-2xl border border-[#E6DED2] cursor-pointer"
        >
          <img
            src={activeImage}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />

          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-full bg-[#0A0A0A]/80 backdrop-blur-sm text-[#F7F4EE] text-[10px] font-sans font-semibold tracking-wider uppercase">
              {product.category}
            </span>
          </div>

          {/* Quick View Button on Hover */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <span className="px-4 py-2 rounded-full bg-[#FAF9F6] text-[#0A0A0A] font-sans text-xs font-semibold uppercase tracking-wider shadow-md pointer-events-auto">
              Ver Detalhes
            </span>
          </div>
        </div>

        {/* Color Swatches (Bolinhas de Cores Interativas) */}
        {allVariants.length > 0 && (
          <div className="pt-3 flex items-center gap-1.5">
            {allVariants.map((v) => {
              const isSelected = activeImage === v.imageUrl;
              return (
                <button
                  key={v.id || v.colorName}
                  type="button"
                  onClick={() => {
                    setActiveImage(v.imageUrl);
                    setActiveColorName(v.colorName);
                  }}
                  onMouseEnter={() => {
                    setActiveImage(v.imageUrl);
                    setActiveColorName(v.colorName);
                  }}
                  title={v.colorName}
                  className={`w-4 h-4 rounded-full border border-black/20 transition-all cursor-pointer ${
                    isSelected
                      ? "ring-2 ring-[#0A0A0A] ring-offset-2 scale-110"
                      : "hover:scale-110 opacity-80 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: v.hexCode }}
                  aria-label={v.colorName}
                />
              );
            })}
            {activeColorName && (
              <span className="text-[10px] font-sans text-[#737373] ml-1 truncate font-medium">
                {activeColorName}
              </span>
            )}
          </div>
        )}

        {/* Title & Description */}
        <div className="pt-2 space-y-1">
          <h3
            onClick={onOpenDetails}
            className="font-serif text-base sm:text-lg font-bold text-[#0A0A0A] tracking-tight group-hover:text-[#555555] transition-colors cursor-pointer"
          >
            {product.title}
          </h3>
          {product.description && (
            <p className="font-sans text-xs text-[#737373] line-clamp-2 font-light">
              {product.description}
            </p>
          )}
        </div>
      </div>

      {/* Price & Action */}
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
}

/**
 * Modal Imersivo de Detalhes do Produto com Carrossel de Imagens e Variações de Cores.
 */
function ProductDetailModal({
  product,
  brandPhone,
  stockItems,
  onClose,
}: {
  product: CatalogItem;
  brandPhone: string;
  stockItems?: AvailableStockSize[];
  onClose: () => void;
}) {
  const variants = product.variants && product.variants.length > 0 ? product.variants : [];

  // Cria a lista unificada de slides do carrossel (capa principal + variações)
  const slides = [
    {
      id: "cover",
      url: product.imageUrl,
      colorName: variants[0]?.colorName || "Padrão",
      hexCode: variants[0]?.hexCode || "#000000",
    },
    ...variants
      .filter((v) => v.imageUrl !== product.imageUrl)
      .map((v) => ({
        id: v.id,
        url: v.imageUrl,
        colorName: v.colorName,
        hexCode: v.hexCode,
      })),
  ];

  const { addItem } = useCart();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("G");
  const [quantity, setQuantity] = useState(1);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [destinationCep, setDestinationCep] = useState("");

  const activeSlide = slides[currentSlideIndex] || slides[0];

  const isSizeAvailable = (sz: string) => {
    if (!stockItems || stockItems.length === 0) return true;
    const colorPrefix = (activeSlide.colorName || "").split(" ")[0].toLowerCase();

    const matchingColorShirts = stockItems.filter((item) => {
      if (!item.shirtColor) return true;
      const c = item.shirtColor.toLowerCase();
      return (
        c.includes(colorPrefix) ||
        colorPrefix.includes(c) ||
        c === activeSlide.colorName?.toLowerCase()
      );
    });

    if (matchingColorShirts.length === 0) return true;

    const sizeItem = matchingColorShirts.find(
      (item) => item.shirtSize?.trim().toUpperCase() === sz.trim().toUpperCase()
    );

    if (!sizeItem) return false;
    return sizeItem.stockQuantity > 0;
  };

  const isCurrentSizeAvailable = isSizeAvailable(selectedSize);

  const handleSelectColor = (hexCode: string) => {
    const idx = slides.findIndex((s) => s.hexCode === hexCode);
    if (idx !== -1) {
      setCurrentSlideIndex(idx);
    }
  };

  const handlePrev = () => {
    setCurrentSlideIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlideIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const subtotal = product.price * quantity;
  const shippingPrice = selectedShipping ? selectedShipping.price : 0;
  const grandTotal = subtotal + shippingPrice;

  let whatsappMsgText = `Olá! Gostei da peça "${product.title}" na cor ${activeSlide.colorName} (Tam ${selectedSize}, ${quantity}x = ${formatCurrency(subtotal)}) na Cordeiro Ink.`;
  if (selectedShipping) {
    const daysText =
      typeof selectedShipping.deliveryDays === "number" && selectedShipping.deliveryDays > 0
        ? `prazo de ${selectedShipping.deliveryDays} dias úteis`
        : `prazo: ${selectedShipping.deliveryDays}`;
    const priceText =
      selectedShipping.price > 0 ? formatCurrency(selectedShipping.price) : "Grátis / A combinar";
    whatsappMsgText += `\nFrete selecionado: ${selectedShipping.service} (${priceText}, ${daysText})${
      destinationCep ? ` para o CEP ${destinationCep}` : ""
    }.`;
    whatsappMsgText += `\nTotal do Pedido: ${formatCurrency(grandTotal)}.`;
  }
  const whatsappMsg = encodeURIComponent(whatsappMsgText);
  const waLink = `https://wa.me/${brandPhone}?text=${whatsappMsg}`;

  const handleAddToCart = () => {
    if (!isCurrentSizeAvailable) {
      alert("O tamanho selecionado está esgotado no estoque.");
      return;
    }
    addItem({
      productId: product.id,
      title: product.title,
      colorName: activeSlide.colorName,
      size: selectedSize,
      price: product.price,
      quantity,
      imageUrl: activeSlide.url,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[#FAF9F6] border border-[#E6DED2] rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/70 text-white hover:bg-black transition cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Lado Esquerdo: Carrossel de Fotos */}
        <div className="w-full md:w-1/2 bg-[#F2ECE1] relative flex flex-col justify-between p-4 sm:p-6 border-b md:border-b-0 md:border-r border-[#E6DED2]">
          {/* Main Slide Image */}
          <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-black/5 flex items-center justify-center">
            <img
              src={activeSlide.url}
              alt={product.title}
              className="w-full h-full object-cover animate-in fade-in duration-300"
            />

            {/* Setas de Navegação do Carrossel */}
            {slides.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black text-white transition cursor-pointer shadow"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black text-white transition cursor-pointer shadow"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}

            {/* Slide Index Counter */}
            {slides.length > 1 && (
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-sm text-white text-[10px] font-mono font-bold">
                {currentSlideIndex + 1} / {slides.length}
              </div>
            )}
          </div>

          {/* Miniaturas (Thumbnails) do Carrossel */}
          {slides.length > 1 && (
            <div className="flex items-center gap-2 pt-3 overflow-x-auto">
              {slides.map((s, idx) => (
                <button
                  key={s.id + idx}
                  type="button"
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`relative w-12 h-14 rounded-lg overflow-hidden border-2 transition shrink-0 cursor-pointer ${
                    currentSlideIndex === idx
                      ? "border-[#0A0A0A] scale-105"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={s.url}
                    alt={s.colorName}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Lado Direito: Detalhes, Seletor de Cores e Compra */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between space-y-6 overflow-y-auto">
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-sans tracking-[0.2em] text-[#737373] font-semibold">
                {product.category}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A] leading-tight">
                {product.title}
              </h2>
              <p className="font-sans text-xl font-bold text-[#0A0A0A] pt-1">
                {formatCurrency(product.price)}
              </p>
            </div>

            {product.description && (
              <div className="pt-2 border-t border-[#E6DED2]">
                <h4 className="text-xs font-sans font-semibold uppercase tracking-wider text-[#0A0A0A] mb-1">
                  Detalhes da Peça
                </h4>
                <p className="font-sans text-xs sm:text-sm text-[#666666] leading-relaxed font-light">
                  {product.description}
                </p>
              </div>
            )}

            {/* Seletor de Cores Interativo com Mudança no Carrossel */}
            {variants.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[#E6DED2]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[#0A0A0A]">
                    Cor Selecionada:
                  </span>
                  <span className="text-xs font-sans text-[#737373] font-medium">
                    {activeSlide.colorName}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  {variants.map((v) => {
                    const isSelected = activeSlide.hexCode === v.hexCode;
                    return (
                      <button
                        key={v.id || v.colorName}
                        type="button"
                        onClick={() => handleSelectColor(v.hexCode)}
                        className={`w-7 h-7 rounded-full border border-black/20 transition-all cursor-pointer flex items-center justify-center ${
                          isSelected
                            ? "ring-2 ring-[#0A0A0A] ring-offset-2 scale-110 shadow-sm"
                            : "hover:scale-105 opacity-80 hover:opacity-100"
                        }`}
                        style={{ backgroundColor: v.hexCode }}
                        title={v.colorName}
                      >
                        {isSelected && (
                          <Check
                            size={12}
                            className={
                              v.hexCode.toLowerCase() === "#ffffff" ||
                              v.hexCode.toLowerCase() === "#fafafa" ||
                              v.hexCode.toLowerCase() === "#f5f5f0"
                                ? "text-black"
                                : "text-white"
                            }
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Seletor de Tamanho */}
            <div className="space-y-2 pt-2 border-t border-[#E6DED2]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[#0A0A0A]">
                  Tamanho:
                </span>
                <span className="text-[11px] font-sans text-[#737373]">
                  Modelagem Streetwear
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {["P", "M", "G", "GG", "XG"].map((sz) => {
                  const available = isSizeAvailable(sz);
                  return (
                    <button
                      key={sz}
                      type="button"
                      disabled={!available}
                      onClick={() => setSelectedSize(sz)}
                      title={!available ? `Tamanho ${sz} esgotado no estoque` : undefined}
                      className={`py-2 rounded-xl text-xs font-mono font-bold transition border ${
                        !available
                          ? "opacity-30 line-through cursor-not-allowed bg-zinc-200/50 text-zinc-400 border-zinc-200"
                          : selectedSize === sz
                          ? "bg-[#0A0A0A] text-[#F7F4EE] border-[#0A0A0A] cursor-pointer"
                          : "bg-[#F7F4EE] text-[#0A0A0A] border-[#E6DED2] hover:border-[#0A0A0A] cursor-pointer"
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Seletor de Quantidade */}
            <div className="flex items-center justify-between pt-2 border-t border-[#E6DED2]">
              <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[#0A0A0A]">
                Quantidade:
              </span>
              <div className="flex items-center gap-2 bg-[#F2ECE1] border border-[#E6DED2] rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="p-1.5 rounded-lg text-[#0A0A0A] hover:bg-black/5 transition cursor-pointer"
                  title="Diminuir quantidade"
                >
                  <Minus size={13} />
                </button>
                <span className="font-mono text-xs font-bold px-2 min-w-[20px] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="p-1.5 rounded-lg text-[#0A0A0A] hover:bg-black/5 transition cursor-pointer"
                  title="Aumentar quantidade"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>

            {/* Módulo de Cálculo de Frete (Melhor Envio Sandbox) */}
            <div className="pt-2 border-t border-[#E6DED2]">
              <ShippingCalculator
                quantity={quantity}
                selectedOption={selectedShipping}
                onSelectOption={setSelectedShipping}
                variant="storefront"
                initialCep={destinationCep}
                onCepChange={setDestinationCep}
              />
            </div>

            {/* Resumo Financeiro da Peça com Frete */}
            <div className="p-3.5 rounded-2xl bg-[#F2ECE1]/60 border border-[#E6DED2] space-y-1.5 text-xs">
              <div className="flex justify-between text-[#737373]">
                <span>Subtotal ({quantity}x)</span>
                <span className="font-mono">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#737373]">
                <span>
                  Frete ({selectedShipping ? selectedShipping.service : "A calcular"})
                </span>
                <span className="font-mono">
                  {selectedShipping
                    ? selectedShipping.price === 0
                      ? "Grátis / R$ 0,00"
                      : formatCurrency(selectedShipping.price)
                    : "Calcular acima"}
                </span>
              </div>
              <div className="pt-1.5 border-t border-[#E6DED2] flex justify-between items-baseline font-bold">
                <span className="font-serif text-sm text-[#0A0A0A]">
                  Total do Pedido
                </span>
                <span className="font-mono text-base text-[#0A0A0A]">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Botões de Ação: Adicionar à Sacola & Pedir no WhatsApp */}
          <div className="pt-4 border-t border-[#E6DED2] space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!isCurrentSizeAvailable}
                className={`w-full py-3.5 rounded-full border-2 font-sans text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 transition ${
                  !isCurrentSizeAvailable
                    ? "bg-zinc-200 border-zinc-300 text-zinc-400 cursor-not-allowed"
                    : "bg-[#FAF9F6] border-[#0A0A0A] text-[#0A0A0A] hover:bg-black/5 cursor-pointer"
                }`}
              >
                <ShoppingBag size={15} />
                <span>{isCurrentSizeAvailable ? "Adicionar à Sacola" : "Tamanho Esgotado"}</span>
              </button>

              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-full bg-[#0A0A0A] hover:bg-[#222222] text-[#F7F4EE] font-sans text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 transition shadow-md hover:shadow-xl text-center"
              >
                <MessageCircle size={15} />
                <span>Pedir no WhatsApp</span>
              </a>
            </div>
            <p className="text-[10px] text-center text-[#737373] font-sans font-light">
              Produção sob encomenda com fé, acabamento artesanal e envio direto pelos Correios.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
