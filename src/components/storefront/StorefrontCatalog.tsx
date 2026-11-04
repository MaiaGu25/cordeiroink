"use client";

import { useState, useMemo } from "react";
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
  Loader2,
  Plus,
  Minus,
} from "lucide-react";
import {
  CATALOG_CATEGORIES,
  type CatalogCategory,
  type AvailableStockSize,
} from "@/lib/storefront-constants";
import { useCart } from "./CartContext";
import { ShippingCalculator } from "@/components/shipping/ShippingCalculator";
import type { ShippingOption } from "@/lib/shipping-constants";

export interface CatalogVariant {
  id: string;
  catalogItemId?: string;
  colorName: string;
  hexCode: string;
  imageUrl: string;
  backImageUrl?: string | null;
  images?: string[];
}

export interface CatalogItem {
  id: string;
  title: string;
  description: string | null;
  price: number;
  imageUrl: string;
  backImageUrl?: string | null;
  images?: string[];
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
  const initialVariant = allVariants[0];
  const initialImg =
    initialVariant?.images?.[0] ||
    initialVariant?.imageUrl ||
    product.images?.[0] ||
    product.imageUrl;

  const [activeImage, setActiveImage] = useState<string>(initialImg);
  const [activeColorName, setActiveColorName] = useState<string | null>(
    initialVariant?.colorName || null
  );

  const whatsappMsg = encodeURIComponent(
    `Olá! Vi a peça "${product.title}"${
      activeColorName ? ` na cor ${activeColorName}` : ""
    } (${formatCurrency(product.price)}) na vitrine da Cordeiro Ink e gostaria de encomendar.`
  );
  const waLink = `https://wa.me/${brandPhone}?text=${whatsappMsg}`;

  return (
    <div className="group flex flex-col justify-between space-y-4 min-w-0 overflow-hidden break-words">
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
              const targetImg = v.images?.[0] || v.imageUrl;
              const isSelected = activeColorName === v.colorName;
              return (
                <button
                  key={v.id || v.colorName}
                  type="button"
                  onClick={() => {
                    setActiveImage(targetImg);
                    setActiveColorName(v.colorName);
                  }}
                  onMouseEnter={() => {
                    setActiveImage(targetImg);
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
        <div className="pt-2 space-y-1 min-w-0 break-words">
          <h3
            onClick={onOpenDetails}
            className="font-serif text-base sm:text-lg font-bold text-[#0A0A0A] tracking-tight group-hover:text-[#555555] transition-colors cursor-pointer break-words"
          >
            {product.title}
          </h3>
          {product.description && (
            <p className="font-sans text-xs text-[#737373] line-clamp-2 font-light break-words">
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

  const { addItem } = useCart();
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(variants.length > 0 ? 0 : -1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("G");
  const [quantity, setQuantity] = useState(1);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [destinationCep, setDestinationCep] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const activeVariant = selectedVariantIndex >= 0 ? variants[selectedVariantIndex] : null;

  // Resolve as fotos da variação ativa ou fotos gerais da peça
  const activePhotos: string[] = useMemo(() => {
    if (activeVariant) {
      if (Array.isArray(activeVariant.images) && activeVariant.images.length > 0) {
        return activeVariant.images.filter(Boolean);
      }
      const list = [activeVariant.imageUrl, activeVariant.backImageUrl].filter(Boolean) as string[];
      if (list.length > 0) return list;
    }
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images.filter(Boolean);
    }
    return [product.imageUrl, product.backImageUrl].filter(Boolean) as string[];
  }, [activeVariant, product]);

  const activePhoto = activePhotos[selectedImageIndex] || activePhotos[0] || product.imageUrl;
  const activeColorName = activeVariant?.colorName || "Padrão";

  // Troca de cor imediata (corrige bug da primeira cor e carrega galeria da variação)
  const handleSelectVariant = (idx: number) => {
    setSelectedVariantIndex(idx);
    setSelectedImageIndex(0);
  };

  const handlePrev = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? activePhotos.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedImageIndex((prev) => (prev === activePhotos.length - 1 ? 0 : prev + 1));
  };

  const isSizeAvailable = (sz: string) => {
    if (!stockItems || stockItems.length === 0) return true;
    const colorPrefix = (activeColorName || "").split(" ")[0].toLowerCase();

    const matchingColorShirts = stockItems.filter((item) => {
      if (!item.shirtColor) return true;
      const c = item.shirtColor.toLowerCase();
      return (
        c.includes(colorPrefix) ||
        colorPrefix.includes(c) ||
        c === activeColorName?.toLowerCase()
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

  const subtotal = product.price * quantity;
  const shippingPrice = selectedShipping ? selectedShipping.price : 0;
  const grandTotal = subtotal + shippingPrice;

  let whatsappMsgText = `Olá! Gostei da peça "${product.title}" na cor ${activeColorName} (Tam ${selectedSize}, ${quantity}x = ${formatCurrency(subtotal)}) na Cordeiro Ink.`;
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
    if (isAdding) return;
    if (!isCurrentSizeAvailable) {
      alert("O tamanho selecionado está esgotado no estoque.");
      return;
    }
    setIsAdding(true);
    addItem({
      productId: product.id,
      title: product.title,
      colorName: activeColorName,
      size: selectedSize,
      price: product.price,
      quantity,
      imageUrl: activePhoto,
    });
    setTimeout(() => {
      setIsAdding(false);
      onClose();
    }, 300);
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

        {/* Lado Esquerdo: Galeria com Foto Principal e Miniaturas */}
        <div className="w-full md:w-1/2 bg-[#F2ECE1] relative flex flex-col justify-between p-4 sm:p-6 border-b md:border-b-0 md:border-r border-[#E6DED2]">
          {/* Main Slide Image */}
          <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-black/5 flex items-center justify-center shadow-sm">
            <img
              src={activePhoto}
              alt={product.title}
              className="w-full h-full object-cover animate-in fade-in duration-300"
            />

            {/* Setas de Navegação da Galeria */}
            {activePhotos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black text-white transition cursor-pointer shadow"
                  title="Foto anterior"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black text-white transition cursor-pointer shadow"
                  title="Próxima foto"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}

            {/* Contador de Fotos */}
            {activePhotos.length > 1 && (
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-sm text-white text-[10px] font-mono font-bold">
                {selectedImageIndex + 1} / {activePhotos.length}
              </div>
            )}
          </div>

          {/* Miniaturas (Thumbnails) da Galeria */}
          {activePhotos.length > 1 && (
            <div className="flex items-center gap-2 pt-3 overflow-x-auto scrollbar-none py-1">
              {activePhotos.map((photoUrl, idx) => {
                const isSelectedThumb = selectedImageIndex === idx;
                return (
                  <button
                    key={photoUrl + idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-12 h-14 rounded-lg overflow-hidden border-2 transition shrink-0 cursor-pointer ${
                      isSelectedThumb
                        ? "border-[#0A0A0A] scale-105 shadow"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={photoUrl}
                      alt={`${product.title} miniatura ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Lado Direito: Detalhes, Seletor de Cores e Compra */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between space-y-6 overflow-y-auto min-w-0 break-words">
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-sans tracking-[0.2em] text-[#737373] font-semibold">
                {product.category}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A] leading-tight break-words">
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
                <p className="font-sans text-xs sm:text-sm text-[#666666] leading-relaxed font-light break-words">
                  {product.description}
                </p>
              </div>
            )}

            {/* Seletor de Cores Interativo com Troca Direta de Galeria */}
            {variants.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[#E6DED2]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[#0A0A0A]">
                    Cor Selecionada:
                  </span>
                  <span className="text-xs font-sans text-[#737373] font-medium">
                    {activeColorName}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  {variants.map((v, idx) => {
                    const isSelected = selectedVariantIndex === idx;
                    return (
                      <button
                        key={v.id || v.colorName + idx}
                        type="button"
                        onClick={() => handleSelectVariant(idx)}
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

              <div className="grid grid-cols-4 gap-2">
                {["P", "M", "G", "GG"].map((sz) => {
                  const available = isSizeAvailable(sz);
                  return (
                    <button
                      key={sz}
                      type="button"
                      disabled={!available}
                      onClick={() => setSelectedSize(sz)}
                      className={`py-2.5 rounded-xl font-sans text-xs font-bold uppercase transition border cursor-pointer ${
                        selectedSize === sz
                          ? "bg-[#0A0A0A] text-[#FAF9F6] border-[#0A0A0A] shadow"
                          : available
                          ? "bg-transparent text-[#0A0A0A] border-[#E6DED2] hover:border-[#0A0A0A]"
                          : "opacity-30 border-dashed border-[#D5CABE] cursor-not-allowed line-through text-[#999999]"
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>

              {!isCurrentSizeAvailable && (
                <p className="text-[11px] text-amber-600 font-medium">
                  ⚠️ Tamanho esgotado no estoque de peças lisas desta cor.
                </p>
              )}
            </div>

            {/* Simulador de Frete */}
            <div className="pt-2 border-t border-[#E6DED2]">
              <ShippingCalculator
                onSelectOption={(option) => setSelectedShipping(option)}
                selectedOption={selectedShipping}
                onCepChange={(c: string) => setDestinationCep(c)}
              />
            </div>
          </div>

          {/* Quantidade e Ação */}
          <div className="pt-4 border-t border-[#E6DED2] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[#0A0A0A]">
                Quantidade:
              </span>
              <div className="flex items-center border border-[#E6DED2] rounded-xl overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1 text-xs hover:bg-black/5 transition"
                >
                  -
                </button>
                <span className="px-3 py-1 font-mono text-xs font-bold">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-1 text-xs hover:bg-black/5 transition"
                >
                  +
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!isCurrentSizeAvailable || isAdding}
                className="w-full py-3.5 rounded-full bg-[#0A0A0A] hover:bg-[#222222] disabled:opacity-50 text-[#F7F4EE] font-sans text-xs uppercase tracking-wider font-semibold transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {isAdding ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Adicionando...</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={15} />
                    <span>Adicionar à Sacola ({formatCurrency(subtotal)})</span>
                  </>
                )}
              </button>

              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs uppercase tracking-wider font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer text-center"
              >
                <span>Pedir no WhatsApp</span>
                <ArrowUpRight size={13} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
