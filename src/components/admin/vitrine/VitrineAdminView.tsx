"use client";

import { useState, useTransition, useRef } from "react";
import {
  Sparkles,
  Plus,
  Image as ImageIcon,
  Trash2,
  Edit2,
  Power,
  Upload,
  Loader2,
  X,
  ExternalLink,
  MessageCircle,
  Eye,
  Palette,
  Sliders,
  RotateCw,
  Maximize2,
  Move,
  RefreshCw,
  Layers,
  Shirt,
} from "lucide-react";
import {
  createCatalogItem,
  updateCatalogItem,
  deleteCatalogItem,
  uploadStorefrontFile,
} from "@/actions/storefront";
import {
  getProductTemplates,
  createProductTemplate,
  updateProductTemplate,
  deleteProductTemplate,
} from "@/actions/templates";
import { uploadFileViaApi } from "@/lib/api-upload";
import { CATALOG_CATEGORIES, type VariantInput } from "@/lib/storefront-constants";
import { formatCurrency } from "@/lib/utils";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { SafeImage } from "@/components/ui/SafeImage";
import { BannerManagerSection, type BannerItem } from "./BannerManagerSection";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const PREVIEW_PALETTE = [
  { name: "Preto", hex: "#18181b" },
  { name: "Branco", hex: "#f4f4f5" },
  { name: "Off-White", hex: "#e7e5e4" },
  { name: "Azul Marinho", hex: "#1e3a8a" },
  { name: "Vinho", hex: "#7f1d1d" },
  { name: "Verde Militar", hex: "#14532d" },
  { name: "Mostarda", hex: "#b45309" },
];

interface CatalogVariant {
  id: string;
  catalogItemId: string;
  colorName: string;
  hexCode: string;
  imageUrl: string;
}

interface CatalogItem {
  id: string;
  title: string;
  description: string | null;
  price: number;
  imageUrl: string;
  backImageUrl?: string | null;
  category: string;
  showOnVirtualRack?: boolean;
  templateId?: string | null;
  template?: any | null;
  baseShirtUrl?: string | null;
  baseShirtBackUrl?: string | null;
  printImageUrl?: string | null;
  printBackImageUrl?: string | null;
  printWidth?: number | null;
  printTop?: number | null;
  printLeft?: number | null;
  printWidthBack?: number | null;
  printTopBack?: number | null;
  printLeftBack?: number | null;
  isActive: boolean;
  createdAt: Date;
  variants?: CatalogVariant[];
}

interface LeadQuote {
  id: string;
  customerName: string;
  whatsapp: string;
  shirtModel: string;
  size: string;
  customDesignUrl: string | null;
  notes: string | null;
  status: string;
  createdAt: Date;
}

interface VitrineAdminViewProps {
  initialItems: CatalogItem[];
  initialLeads: LeadQuote[];
  initialBanners?: BannerItem[];
  initialTemplates?: any[];
}

interface PrintPositioningBlockProps {
  isFront: boolean;
  setIsFront: (front: boolean) => void;
  previewColor: string;
  setPreviewColor: (c: string) => void;
  baseShirtUrl: string;
  setBaseShirtUrl: (s: string) => void;
  baseShirtBackUrl: string;
  setBaseShirtBackUrl: (s: string) => void;
  printImageUrl: string;
  setPrintImageUrl: (s: string) => void;
  printBackImageUrl: string;
  setPrintBackImageUrl: (s: string) => void;
  printWidth: number;
  setPrintWidth: (n: number) => void;
  printTop: number;
  setPrintTop: (n: number) => void;
  printLeft: number;
  setPrintLeft: (n: number) => void;
  printWidthBack: number;
  setPrintWidthBack: (n: number) => void;
  printTopBack: number;
  setPrintTopBack: (n: number) => void;
  printLeftBack: number;
  setPrintLeftBack: (n: number) => void;
  isUploading: boolean;
  onUploadLayer: (
    file: File,
    target: "PRINT_FRONT" | "PRINT_BACK" | "BASE_FRONT" | "BASE_BACK"
  ) => Promise<void>;
  templates?: any[];
  selectedTemplateId?: string;
  onSelectTemplate?: (id: string) => void;
}

function PrintPositioningBlock({
  isFront,
  setIsFront,
  previewColor,
  setPreviewColor,
  baseShirtUrl,
  setBaseShirtUrl,
  baseShirtBackUrl,
  setBaseShirtBackUrl,
  printImageUrl,
  setPrintImageUrl,
  printBackImageUrl,
  setPrintBackImageUrl,
  printWidth,
  setPrintWidth,
  printTop,
  setPrintTop,
  printLeft,
  setPrintLeft,
  printWidthBack,
  setPrintWidthBack,
  printTopBack,
  setPrintTopBack,
  printLeftBack,
  setPrintLeftBack,
  isUploading,
  onUploadLayer,
  templates = [],
  selectedTemplateId,
  onSelectTemplate,
}: PrintPositioningBlockProps) {
  const frontPrintInputRef = useRef<HTMLInputElement>(null);
  const backPrintInputRef = useRef<HTMLInputElement>(null);
  const frontBaseInputRef = useRef<HTMLInputElement>(null);
  const backBaseInputRef = useRef<HTMLInputElement>(null);

  const currentBase = isFront
    ? baseShirtUrl || "/mockups/blank-front.svg"
    : baseShirtBackUrl || "/mockups/blank-back.svg";
  const currentPrint = isFront ? printImageUrl : printBackImageUrl;
  const currentWidth = isFront ? printWidth : printWidthBack;
  const currentTop = isFront ? printTop : printTopBack;
  const currentLeft = isFront ? printLeft : printLeftBack;

  const setCurrentWidth = (val: number) => {
    if (isFront) setPrintWidth(val);
    else setPrintWidthBack(val);
  };
  const setCurrentTop = (val: number) => {
    if (isFront) setPrintTop(val);
    else setPrintTopBack(val);
  };
  const setCurrentLeft = (val: number) => {
    if (isFront) setPrintLeft(val);
    else setPrintLeftBack(val);
  };

  const handleReset = () => {
    if (isFront) {
      setPrintWidth(45);
      setPrintTop(28);
      setPrintLeft(50);
    } else {
      setPrintWidthBack(50);
      setPrintTopBack(25);
      setPrintLeftBack(50);
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-zinc-900/90 border border-amber-500/30 space-y-4">
      {/* 4 Hidden file inputs distintos para cada camada */}
      <input
        type="file"
        ref={frontBaseInputRef}
        accept="image/png,image/webp,image/svg+xml,image/jpeg"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onUploadLayer(f, "BASE_FRONT");
          if (e.target) e.target.value = "";
        }}
      />
      <input
        type="file"
        ref={backBaseInputRef}
        accept="image/png,image/webp,image/svg+xml,image/jpeg"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onUploadLayer(f, "BASE_BACK");
          if (e.target) e.target.value = "";
        }}
      />
      <input
        type="file"
        ref={frontPrintInputRef}
        accept="image/png,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onUploadLayer(f, "PRINT_FRONT");
          if (e.target) e.target.value = "";
        }}
      />
      <input
        type="file"
        ref={backPrintInputRef}
        accept="image/png,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onUploadLayer(f, "PRINT_BACK");
          if (e.target) e.target.value = "";
        }}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-amber-400" />
          <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
            Posicionamento da Estampa & Preview em Tempo Real (Arara Virtual)
          </h4>
        </div>

        {/* Tab Frente / Costas */}
        <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-[11px] font-semibold w-fit">
          <button
            type="button"
            onClick={() => setIsFront(true)}
            className={`px-3 py-1 rounded-lg transition cursor-pointer ${
              isFront
                ? "bg-amber-500 text-zinc-950 font-bold shadow"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Frente
          </button>
          <button
            type="button"
            onClick={() => setIsFront(false)}
            className={`px-3 py-1 rounded-lg transition cursor-pointer ${
              !isFront
                ? "bg-amber-500 text-zinc-950 font-bold shadow"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Costas
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* PREVIEW VISUAL EM TEMPO REAL (MOCKUP CINZA + BLEND MODE + ESTAMPA) */}
        <div className="md:col-span-5 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-semibold text-zinc-400">
              Mockup Visual ({isFront ? "Frente" : "Costas"}):
            </span>
            <div className="flex items-center gap-1.5">
              {PREVIEW_PALETTE.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setPreviewColor(c.hex)}
                  title={c.name}
                  className={`w-4 h-4 rounded-full border transition cursor-pointer ${
                    previewColor === c.hex
                      ? "border-amber-400 scale-125 ring-1 ring-amber-400/50"
                      : "border-zinc-700 hover:scale-110"
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          <div className="relative w-full aspect-[3/4] max-h-[290px] rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center overflow-hidden shadow-inner select-none">
            {/* Camada 1: Cor de fundo mascarada pela silhueta */}
            <div
              className="absolute inset-0 transition-colors duration-300 pointer-events-none"
              style={{
                backgroundColor: previewColor,
                maskImage: `url('${currentBase}')`,
                WebkitMaskImage: `url('${currentBase}')`,
                maskSize: "contain",
                WebkitMaskSize: "contain",
                maskRepeat: "no-repeat",
                WebkitMaskRepeat: "no-repeat",
                maskPosition: "center",
                WebkitMaskPosition: "center",
              }}
            />

            {/* Camada 2: Mockup cinza em mix-blend-multiply */}
            <img
              src={currentBase}
              alt="Mockup Camiseta"
              className="relative z-10 w-full h-full object-contain mix-blend-multiply pointer-events-none select-none"
            />

            {/* Camada 3: Arte PNG Isolada movida pelos sliders em tempo real */}
            {currentPrint ? (
              <div
                className="absolute z-20 pointer-events-none transition-all duration-75 flex items-center justify-center"
                style={{
                  top: `${currentTop}%`,
                  left: `${currentLeft}%`,
                  width: `${currentWidth}%`,
                  transform: "translateX(-50%)",
                }}
              >
                <img
                  src={currentPrint}
                  alt="Estampa"
                  className="w-full h-auto object-contain drop-shadow-md select-none"
                />
              </div>
            ) : (
              <div
                className="absolute z-20 pointer-events-none border-2 border-dashed border-amber-400/60 rounded-lg p-2 text-center flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]"
                style={{
                  top: `${currentTop}%`,
                  left: `${currentLeft}%`,
                  width: `${currentWidth}%`,
                  transform: "translateX(-50%)",
                  minHeight: "60px",
                }}
              >
                <span className="text-[9px] font-bold text-amber-300 uppercase">
                  Área da Estampa
                </span>
                <span className="text-[8px] text-zinc-300">
                  Suba o PNG transparente ao lado
                </span>
              </div>
            )}

            <div className="absolute bottom-1.5 right-1.5 z-30 px-1.5 py-0.5 rounded bg-zinc-900/80 border border-zinc-800 text-[8px] font-mono text-zinc-400">
              W:{currentWidth}% Y:{currentTop}% X:{currentLeft}%
            </div>
          </div>
        </div>

        {/* CONTROLES DESLIZANTES (RANGE SLIDERS) & INPUTS */}
        <div className="md:col-span-7 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
              <Sliders size={13} className="text-amber-400" />
              <span>Controles Deslizantes ({isFront ? "Frente" : "Costas"})</span>
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition"
              title="Restaurar valores padrão"
            >
              <RefreshCw size={10} />
              <span>Restaurar Padrão</span>
            </button>
          </div>

          {/* Slider 1: Escala / Tamanho (printWidth) */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-zinc-400 flex items-center gap-1">
                <Maximize2 size={11} /> Escala da Estampa (Tamanho %):
              </span>
              <span className="font-mono font-bold text-amber-400">{currentWidth}%</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="15"
                max="90"
                step="1"
                value={currentWidth}
                onChange={(e) => setCurrentWidth(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <input
                type="number"
                min="15"
                max="90"
                value={currentWidth}
                onChange={(e) => setCurrentWidth(Number(e.target.value))}
                className="w-14 px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-xs font-mono text-center text-zinc-100"
              />
            </div>
          </div>

          {/* Slider 2: Posição Vertical (printTop / Eixo Y) */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-zinc-400 flex items-center gap-1">
                <Move size={11} /> Posição Vertical (Eixo Y %):
              </span>
              <span className="font-mono font-bold text-amber-400">{currentTop}%</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="5"
                max="85"
                step="1"
                value={currentTop}
                onChange={(e) => setCurrentTop(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <input
                type="number"
                min="5"
                max="85"
                value={currentTop}
                onChange={(e) => setCurrentTop(Number(e.target.value))}
                className="w-14 px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-xs font-mono text-center text-zinc-100"
              />
            </div>
          </div>

          {/* Slider 3: Posição Horizontal (printLeft / Eixo X) */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-zinc-400 flex items-center gap-1">
                <Move size={11} className="rotate-90" /> Posição Horizontal (Eixo X %):
              </span>
              <span className="font-mono font-bold text-amber-400">{currentLeft}%</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="15"
                max="85"
                step="1"
                value={currentLeft}
                onChange={(e) => setCurrentLeft(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <input
                type="number"
                min="15"
                max="85"
                value={currentLeft}
                onChange={(e) => setCurrentLeft(Number(e.target.value))}
                className="w-14 px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-xs font-mono text-center text-zinc-100"
              />
            </div>
          </div>

          {/* SELEÇÃO DO MOLDE & UPLOAD DAS ESTAMPAS */}
          <div className="pt-3 border-t border-zinc-800 space-y-3">
            {/* 1. Molde / Modelagem Padrão (Select de Mockup Base) */}
            <div className="p-3.5 rounded-xl bg-zinc-950/90 border border-amber-500/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-200 flex items-center gap-1.5">
                  <Shirt size={13} className="text-amber-400" />
                  <span>Molde / Modelagem Padrão (Mockup Base Cinza)</span>
                </span>
                <span className="text-[9px] text-amber-400 font-mono">Bases Reutilizáveis</span>
              </div>

              <div>
                <select
                  value={selectedTemplateId || ""}
                  onChange={(e) => onSelectTemplate?.(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs font-semibold text-zinc-100 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="">Selecione um molde de modelagem...</option>
                  {(templates || []).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.category || "Camisetas"})
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-zinc-400 block mt-1">
                  As bases cinzas da frente e das costas são vinculadas automaticamente do molde cadastrado.
                </span>
              </div>

              {/* Detalhes expansíveis para personalização manual de mockup desta peça */}
              <details className="text-[10px] text-zinc-400 pt-1">
                <summary className="cursor-pointer hover:text-zinc-200 font-medium transition select-none">
                  ⚙️ Personalizar bases manualmente para este produto (opcional)
                </summary>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2 pt-2 border-t border-zinc-800">
                  <div>
                    <label className="block text-[9px] font-semibold text-zinc-300 mb-0.5">
                      Base Frente Customizada
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={baseShirtUrl}
                        onChange={(e) => setBaseShirtUrl(e.target.value)}
                        placeholder="/mockups/blank-front.svg"
                        className="w-full px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-200 font-mono"
                      />
                      <button
                        type="button"
                        disabled={isUploading}
                        onClick={() => frontBaseInputRef.current?.click()}
                        className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
                        title="Upload Base Frente"
                      >
                        <Upload size={10} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-semibold text-zinc-300 mb-0.5">
                      Base Costas Customizada
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={baseShirtBackUrl}
                        onChange={(e) => setBaseShirtBackUrl(e.target.value)}
                        placeholder="/mockups/blank-back.svg"
                        className="w-full px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-200 font-mono"
                      />
                      <button
                        type="button"
                        disabled={isUploading}
                        onClick={() => backBaseInputRef.current?.click()}
                        className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
                        title="Upload Base Costas"
                      >
                        <Upload size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              </details>
            </div>

            {/* 2. Arte / Estampa Isolada (Frente e Costas) */}
            <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-200 flex items-center gap-1.5">
                  <Layers size={12} className="text-amber-400" />
                  <span>Arte / Estampa Isolada (PNG Transparente)</span>
                </span>
                <span className="text-[9px] text-zinc-500 font-mono">PNG / WEBP Transparente</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Estampa Frente */}
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-300 mb-1">
                    Arte / Estampa (Frente)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={printImageUrl}
                      onChange={(e) => setPrintImageUrl(e.target.value)}
                      placeholder="https://.../estampa-frente.png"
                      className="w-full px-2 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-200 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => frontPrintInputRef.current?.click()}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-[11px] font-bold flex items-center gap-1 shrink-0 transition cursor-pointer shadow"
                      title="Upload Estampa Frente PNG"
                    >
                      {isUploading ? <Loader2 size={11} className="animate-spin" /> : <Upload size={11} />}
                      <span>Upload</span>
                    </button>
                  </div>
                </div>

                {/* Estampa Costas */}
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-300 mb-1">
                    Arte / Estampa (Costas)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={printBackImageUrl}
                      onChange={(e) => setPrintBackImageUrl(e.target.value)}
                      placeholder="https://.../estampa-costas.png"
                      className="w-full px-2 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-200 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => backPrintInputRef.current?.click()}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-[11px] font-bold flex items-center gap-1 shrink-0 transition cursor-pointer shadow"
                      title="Upload Estampa Costas PNG"
                    >
                      {isUploading ? <Loader2 size={11} className="animate-spin" /> : <Upload size={11} />}
                      <span>Upload</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function VitrineAdminView({
  initialItems,
  initialLeads,
  initialBanners = [],
  initialTemplates = [],
}: VitrineAdminViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"CATALOG" | "LEADS" | "BANNERS" | "TEMPLATES">("CATALOG");
  const [templatesList, setTemplatesList] = useState<any[]>(initialTemplates);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [editSelectedTemplateId, setEditSelectedTemplateId] = useState<string>("");

  // Estados do Modal de Cadastro/Edição de Moldes (Templates)
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
  const [tplName, setTplName] = useState("");
  const [tplCategory, setTplCategory] = useState("Camisetas");
  const [tplBaseFront, setTplBaseFront] = useState("/mockups/blank-front.svg");
  const [tplBaseBack, setTplBaseBack] = useState("/mockups/blank-back.svg");
  const [tplBaseSide, setTplBaseSide] = useState("");
  const [tplDesc, setTplDesc] = useState("");
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [isUploadingTemplateBase, setIsUploadingTemplateBase] = useState(false);
  const tplFrontInputRef = useRef<HTMLInputElement>(null);
  const tplBackInputRef = useRef<HTMLInputElement>(null);

  // Estados de Criação
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingVariantIndex, setUploadingVariantIndex] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [category, setCategory] = useState<string>("Adulto");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [backImageUrl, setBackImageUrl] = useState("");
  const [showOnVirtualRack, setShowOnVirtualRack] = useState(false);
  const [variants, setVariants] = useState<VariantInput[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados de Criação de Estampa & Mockup
  const [baseShirtUrl, setBaseShirtUrl] = useState("/mockups/blank-front.svg");
  const [baseShirtBackUrl, setBaseShirtBackUrl] = useState("/mockups/blank-back.svg");
  const [printImageUrl, setPrintImageUrl] = useState("");
  const [printBackImageUrl, setPrintBackImageUrl] = useState("");
  const [printWidth, setPrintWidth] = useState(45);
  const [printTop, setPrintTop] = useState(28);
  const [printLeft, setPrintLeft] = useState(50);
  const [printWidthBack, setPrintWidthBack] = useState(50);
  const [printTopBack, setPrintTopBack] = useState(25);
  const [printLeftBack, setPrintLeftBack] = useState(50);
  const [previewSide, setPreviewSide] = useState<"FRONT" | "BACK">("FRONT");
  const [previewColor, setPreviewColor] = useState("#18181b");
  const [isUploadingPrint, setIsUploadingPrint] = useState(false);

  // Estados de Edição
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState<number | "">("");
  const [editCategory, setEditCategory] = useState<string>("Adulto");
  const [editDescription, setEditDescription] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editBackImageUrl, setEditBackImageUrl] = useState("");
  const [editShowOnVirtualRack, setEditShowOnVirtualRack] = useState(false);
  const [editVariants, setEditVariants] = useState<VariantInput[]>([]);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Estados de Edição de Estampa & Mockup
  const [editBaseShirtUrl, setEditBaseShirtUrl] = useState("/mockups/blank-front.svg");
  const [editBaseShirtBackUrl, setEditBaseShirtBackUrl] = useState("/mockups/blank-back.svg");
  const [editPrintImageUrl, setEditPrintImageUrl] = useState("");
  const [editPrintBackImageUrl, setEditPrintBackImageUrl] = useState("");
  const [editPrintWidth, setEditPrintWidth] = useState(45);
  const [editPrintTop, setEditPrintTop] = useState(28);
  const [editPrintLeft, setEditPrintLeft] = useState(50);
  const [editPrintWidthBack, setEditPrintWidthBack] = useState(50);
  const [editPrintTopBack, setEditPrintTopBack] = useState(25);
  const [editPrintLeftBack, setEditPrintLeftBack] = useState(50);
  const [editPreviewSide, setEditPreviewSide] = useState<"FRONT" | "BACK">("FRONT");
  const [editPreviewColor, setEditPreviewColor] = useState("#18181b");
  const [isUploadingEditPrint, setIsUploadingEditPrint] = useState(false);

  // Upload handler para as 4 camadas separadas (Base Frente/Costas e Estampa Frente/Costas)
  const handleUploadLayerFile = async (
    file: File,
    target: "PRINT_FRONT" | "PRINT_BACK" | "BASE_FRONT" | "BASE_BACK",
    isEdit = false
  ) => {
    if (isEdit) setIsUploadingEditPrint(true);
    else setIsUploadingPrint(true);

    const folder = target.startsWith("BASE") ? "mockups" : "prints";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const res = await uploadFileViaApi(formData);

    if (res.success && res.url) {
      if (isEdit) {
        if (target === "PRINT_FRONT") setEditPrintImageUrl(res.url);
        else if (target === "PRINT_BACK") setEditPrintBackImageUrl(res.url);
        else if (target === "BASE_FRONT") setEditBaseShirtUrl(res.url);
        else if (target === "BASE_BACK") setEditBaseShirtBackUrl(res.url);
      } else {
        if (target === "PRINT_FRONT") setPrintImageUrl(res.url);
        else if (target === "PRINT_BACK") setPrintBackImageUrl(res.url);
        else if (target === "BASE_FRONT") setBaseShirtUrl(res.url);
        else if (target === "BASE_BACK") setBaseShirtBackUrl(res.url);
      }

      const label =
        target === "BASE_FRONT"
          ? "Mockup Base Frente enviado!"
          : target === "BASE_BACK"
          ? "Mockup Base Costas enviado!"
          : target === "PRINT_FRONT"
          ? "Estampa Frente PNG enviada!"
          : "Estampa Costas PNG enviada!";
      toast.success(label);
    } else {
      toast.error(res.error || "Erro no upload da imagem");
    }
    if (isEdit) setIsUploadingEditPrint(false);
    else setIsUploadingPrint(false);
  };

  // Estado de Exclusão
  const [itemToDelete, setItemToDelete] = useState<CatalogItem | null>(null);

  // Upload de Imagem Principal
  const handleMainFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    isEdit = false
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "catalog");

    const res = await uploadFileViaApi(formData);
    if (res.success && res.url) {
      if (isEdit) {
        setEditImageUrl(res.url);
      } else {
        setImageUrl(res.url);
      }
      toast.success("Foto principal enviada com sucesso!");
    } else {
      toast.error(res.error || "Erro no upload da imagem");
    }

    setIsUploading(false);
    if (e.target) {
      e.target.value = "";
    }
  };

  // Upload de Imagem de Variação de Cor
  const handleVariantFileUpload = async (
    file: File,
    index: number,
    isEdit = false
  ) => {
    setUploadingVariantIndex(index);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "catalog");

    const res = await uploadFileViaApi(formData);
    if (res.success && res.url) {
      if (isEdit) {
        setEditVariants((prev) => {
          const next = [...prev];
          next[index] = { ...next[index], imageUrl: res.url! };
          return next;
        });
      } else {
        setVariants((prev) => {
          const next = [...prev];
          next[index] = { ...next[index], imageUrl: res.url! };
          return next;
        });
      }
      toast.success("Foto da variação enviada com sucesso!");
    } else {
      toast.error(res.error || "Erro no upload da foto da variação");
    }
    setUploadingVariantIndex(null);
  };

  const handleAddVariant = (isEdit = false) => {
    const newVar: VariantInput = {
      colorName: "",
      hexCode: "#000000",
      imageUrl: "",
    };
    if (isEdit) {
      setEditVariants((prev) => [...prev, newVar]);
    } else {
      setVariants((prev) => [...prev, newVar]);
    }
  };

  const handleRemoveVariant = (index: number, isEdit = false) => {
    if (isEdit) {
      setEditVariants((prev) => prev.filter((_, i) => i !== index));
    } else {
      setVariants((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Ações de Gestão de Moldes / Modelagens
  const handleOpenTemplateModal = (template?: any) => {
    if (template) {
      setEditingTemplate(template);
      setTplName(template.name);
      setTplCategory(template.category || "Camisetas");
      setTplBaseFront(template.baseImageFront || "/mockups/blank-front.svg");
      setTplBaseBack(template.baseImageBack || "/mockups/blank-back.svg");
      setTplBaseSide(template.baseImageSide || "");
      setTplDesc(template.description || "");
    } else {
      setEditingTemplate(null);
      setTplName("");
      setTplCategory("Camisetas");
      setTplBaseFront("/mockups/blank-front.svg");
      setTplBaseBack("/mockups/blank-back.svg");
      setTplBaseSide("");
      setTplDesc("");
    }
    setIsTemplateModalOpen(true);
  };

  const handleUploadTemplateBase = async (file: File, side: "FRONT" | "BACK") => {
    try {
      setIsUploadingTemplateBase(true);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "templates");
      const res = await uploadFileViaApi(fd);
      if (res.success && res.url) {
        if (side === "FRONT") setTplBaseFront(res.url);
        else setTplBaseBack(res.url);
        toast.success(`Mockup ${side === "FRONT" ? "Frente" : "Costas"} carregado!`);
      } else {
        toast.error("Erro no upload do mockup: " + (res.error || "Desconhecido"));
      }
    } catch (e: any) {
      toast.error("Erro no upload: " + e.message);
    } finally {
      setIsUploadingTemplateBase(false);
    }
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tplName.trim()) {
      toast.error("Informe o nome da modelagem/molde.");
      return;
    }
    try {
      setIsSavingTemplate(true);
      if (editingTemplate) {
        const res = await updateProductTemplate(editingTemplate.id, {
          name: tplName,
          category: tplCategory,
          baseImageFront: tplBaseFront,
          baseImageBack: tplBaseBack,
          baseImageSide: tplBaseSide || undefined,
          description: tplDesc || undefined,
        });
        if (res.success && res.template) {
          toast.success(`Molde "${tplName}" atualizado com sucesso!`);
          setTemplatesList((prev) =>
            prev.map((t) => (t.id === editingTemplate.id ? { ...t, ...res.template } : t))
          );
          setIsTemplateModalOpen(false);
          router.refresh();
        } else {
          toast.error(res.error || "Erro ao atualizar molde");
        }
      } else {
        const res = await createProductTemplate({
          name: tplName,
          category: tplCategory,
          baseImageFront: tplBaseFront,
          baseImageBack: tplBaseBack,
          baseImageSide: tplBaseSide || undefined,
          description: tplDesc || undefined,
        });
        if (res.success && res.template) {
          toast.success(`Molde "${tplName}" cadastrado com sucesso!`);
          setTemplatesList((prev) => [res.template, ...prev]);
          setIsTemplateModalOpen(false);
          router.refresh();
        } else {
          toast.error(res.error || "Erro ao cadastrar molde");
        }
      }
    } catch (e: any) {
      toast.error("Erro: " + e.message);
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handleDeleteTemplate = async (id: string, name: string) => {
    if (!confirm(`Deseja realmente excluir o molde "${name}"? Os produtos vinculados manterão suas imagens atuais.`)) {
      return;
    }
    try {
      const res = await deleteProductTemplate(id);
      if (res.success) {
        toast.success(`Molde "${name}" removido.`);
        setTemplatesList((prev) => prev.filter((t) => t.id !== id));
        router.refresh();
      } else {
        toast.error(res.error || "Erro ao remover molde");
      }
    } catch (e: any) {
      toast.error("Erro ao excluir: " + e.message);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl || price === "") {
      toast.error("Preencha título, preço e envie a foto principal do produto.");
      return;
    }

    startTransition(async () => {
      try {
        const res: any = await createCatalogItem({
          title,
          price: Number(price),
          category,
          description,
          imageUrl,
          backImageUrl: backImageUrl.trim() || undefined,
          showOnVirtualRack,
          templateId: selectedTemplateId || undefined,
          baseShirtUrl: baseShirtUrl.trim() || undefined,
          baseShirtBackUrl: baseShirtBackUrl.trim() || undefined,
          printImageUrl: printImageUrl.trim() || undefined,
          printBackImageUrl: printBackImageUrl.trim() || undefined,
          printWidth: Number(printWidth),
          printTop: Number(printTop),
          printLeft: Number(printLeft),
          printWidthBack: Number(printWidthBack),
          printTopBack: Number(printTopBack),
          printLeftBack: Number(printLeftBack),
          variants,
        });

        if (res && typeof res === "object" && "success" in res && !res.success) {
          toast.error(String(res.error || "Erro ao salvar produto"));
          return;
        }

        toast.success(`Peça "${title}" cadastrada na vitrine com variações!`);
        setIsNewModalOpen(false);
        setTitle("");
        setPrice("");
        setDescription("");
        setImageUrl("");
        setBackImageUrl("");
        setShowOnVirtualRack(false);
        setSelectedTemplateId("");
        setBaseShirtUrl("/mockups/blank-front.svg");
        setBaseShirtBackUrl("/mockups/blank-back.svg");
        setPrintImageUrl("");
        setPrintBackImageUrl("");
        setPrintWidth(45);
        setPrintTop(28);
        setPrintLeft(50);
        setPrintWidthBack(50);
        setPrintTopBack(25);
        setPrintLeftBack(50);
        setVariants([]);
        router.refresh();
      } catch (err: any) {
        toast.error("Erro ao salvar produto: " + (err?.message || String(err)));
      }
    });
  };

  const handleOpenEdit = (item: CatalogItem) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditPrice(item.price);
    setEditCategory(item.category);
    setEditDescription(item.description || "");
    setEditImageUrl(item.imageUrl);
    setEditBackImageUrl(item.backImageUrl || "");
    setEditShowOnVirtualRack(Boolean(item.showOnVirtualRack));
    setEditSelectedTemplateId(item.templateId || "");
    setEditBaseShirtUrl(
      item.baseShirtUrl || item.template?.baseImageFront || "/mockups/blank-front.svg"
    );
    setEditBaseShirtBackUrl(
      item.baseShirtBackUrl || item.template?.baseImageBack || "/mockups/blank-back.svg"
    );
    setEditPrintImageUrl(item.printImageUrl || "");
    setEditPrintBackImageUrl(item.printBackImageUrl || "");
    setEditPrintWidth(item.printWidth ?? 45);
    setEditPrintTop(item.printTop ?? 28);
    setEditPrintLeft(item.printLeft ?? 50);
    setEditPrintWidthBack(item.printWidthBack ?? 50);
    setEditPrintTopBack(item.printTopBack ?? 25);
    setEditPrintLeftBack(item.printLeftBack ?? 50);
    setEditPreviewSide("FRONT");
    setEditPreviewColor(item.variants?.[0]?.hexCode || "#18181b");
    setEditVariants(
      (item.variants || []).map((v) => ({
        id: v.id,
        colorName: v.colorName,
        hexCode: v.hexCode,
        imageUrl: v.imageUrl,
      }))
    );
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    startTransition(async () => {
      try {
        const finalImageUrl = editImageUrl?.trim() || editingItem.imageUrl;
        const res: any = await updateCatalogItem(editingItem.id, {
          title: editTitle,
          price: Number(editPrice),
          category: editCategory,
          description: editDescription,
          imageUrl: finalImageUrl,
          backImageUrl: editBackImageUrl?.trim() || undefined,
          showOnVirtualRack: editShowOnVirtualRack,
          templateId: editSelectedTemplateId || undefined,
          baseShirtUrl: editBaseShirtUrl.trim() || undefined,
          baseShirtBackUrl: editBaseShirtBackUrl.trim() || undefined,
          printImageUrl: editPrintImageUrl.trim() || undefined,
          printBackImageUrl: editPrintBackImageUrl.trim() || undefined,
          printWidth: Number(editPrintWidth),
          printTop: Number(editPrintTop),
          printLeft: Number(editPrintLeft),
          printWidthBack: Number(editPrintWidthBack),
          printTopBack: Number(editPrintTopBack),
          printLeftBack: Number(editPrintLeftBack),
          variants: editVariants,
        });

        if (res && typeof res === "object" && "success" in res && !res.success) {
          toast.error(String(res.error || "Erro ao atualizar produto"));
          return;
        }

        toast.success(`Peça "${editTitle}" e variações atualizadas!`);
        setEditingItem(null);
        router.refresh();
      } catch (err: any) {
        toast.error("Erro ao atualizar: " + (err?.message || String(err)));
      }
    });
  };

  const handleToggleActive = (item: CatalogItem) => {
    startTransition(async () => {
      try {
        const res: any = await updateCatalogItem(item.id, {
          isActive: !item.isActive,
        });
        if (res && typeof res === "object" && "success" in res && !res.success) {
          toast.error(String(res.error || "Erro ao alterar visibilidade"));
          return;
        }
        toast.success(
          `Item ${!item.isActive ? "ativado na vitrine" : "inativado e oculto da vitrine"}!`
        );
        router.refresh();
      } catch (err: any) {
        toast.error("Erro ao alterar visibilidade: " + (err?.message || String(err)));
      }
    });
  };

  const handleDelete = () => {
    if (!itemToDelete) return;
    startTransition(async () => {
      try {
        const res: any = await deleteCatalogItem(itemToDelete.id);
        if (res && typeof res === "object" && "success" in res && !res.success) {
          toast.error(String(res.error || "Erro ao excluir"));
          return;
        }
        toast.success("Produto removido do catálogo.");
        setItemToDelete(null);
        router.refresh();
      } catch (err: any) {
        toast.error("Erro ao excluir: " + (err?.message || String(err)));
      }
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
              <Sparkles size={22} className="text-amber-400" />
              <span>Gerenciar Vitrine Pública</span>
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-amber-400 font-semibold">
              Loja & Variações
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Cadastre produtos com variações de cores/fotos, organize por categoria (Adulto, Infantil, Oversized, Feminina, Regata) e veja os orçamentos.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition"
          >
            <Eye size={14} />
            <span>Ver Vitrine ao Vivo</span>
          </a>

          <button
            onClick={() => {
              setIsNewModalOpen(true);
              setTitle("");
              setPrice("");
              setCategory("Adulto");
              setDescription("");
              setImageUrl("");
              setVariants([]);
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <Plus size={15} />
            <span>+ Novo Produto na Vitrine</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-zinc-900/60 border border-zinc-800/80 w-fit">
        <button
          onClick={() => setActiveTab("CATALOG")}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
            activeTab === "CATALOG"
              ? "bg-zinc-800 text-zinc-100 shadow-sm"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Sparkles size={14} />
          <span>Peças do Catálogo ({initialItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("LEADS")}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
            activeTab === "LEADS"
              ? "bg-zinc-800 text-zinc-100 shadow-sm"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <MessageCircle size={14} />
          <span>Orçamentos Personalizados ({initialLeads.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("BANNERS")}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
            activeTab === "BANNERS"
              ? "bg-zinc-800 text-zinc-100 shadow-sm"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <ImageIcon size={14} />
          <span>Banners da Home ({initialBanners.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("TEMPLATES")}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
            activeTab === "TEMPLATES"
              ? "bg-amber-500 text-zinc-950 font-bold shadow-sm"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Shirt size={14} />
          <span>Moldes / Modelagens ({templatesList.length})</span>
        </button>
      </div>

      {/* Content: Catálogo */}
      {activeTab === "CATALOG" && (
        <div className="space-y-4">
          {initialItems.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-zinc-900/40 border border-dashed border-zinc-800 flex flex-col items-center justify-center gap-3">
              <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400">
                <ImageIcon size={28} />
              </div>
              <h3 className="text-sm font-semibold text-zinc-200">
                Nenhum produto cadastrado na vitrine ainda
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm">
                Cadastre suas peças com múltiplas cores, fotos e categorias para exibição na vitrine online.
              </p>
              <button
                onClick={() => setIsNewModalOpen(true)}
                className="mt-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition shadow-sm cursor-pointer"
              >
                + Adicionar Primeiro Produto
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {initialItems.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-2xl border transition overflow-hidden flex flex-col justify-between group ${
                    item.isActive
                      ? "bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700"
                      : "bg-zinc-950/40 border-zinc-800/40 opacity-60"
                  }`}
                >
                  <div>
                    {/* Imagem do Produto */}
                    <div className="relative aspect-[3/4] w-full bg-zinc-900 overflow-hidden flex items-center justify-center">
                      <SafeImage
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        fallbackClassName="w-full h-full bg-zinc-900 flex flex-col items-center justify-center text-zinc-600"
                        iconSize={32}
                      />
                      <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border backdrop-blur-md font-semibold ${
                            item.isActive
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-zinc-800/80 text-zinc-400 border-zinc-700"
                          }`}
                        >
                          {item.isActive ? "Ativo" : "Inativo"}
                        </span>
                        {item.showOnVirtualRack && (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full border backdrop-blur-md font-bold bg-amber-500/20 text-amber-400 border-amber-500/40 flex items-center gap-1 shadow">
                            <Sparkles size={9} />
                            Arara 3D
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Detalhes */}
                    <div className="p-4 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400/90 font-semibold">
                          {item.category}
                        </span>
                        <span className="text-xs font-mono font-bold text-zinc-100">
                          {formatCurrency(item.price)}
                        </span>
                      </div>

                      <h4 className="text-sm font-semibold text-zinc-100 truncate">
                        {item.title}
                      </h4>

                      {/* Swatches de Cores */}
                      {item.variants && item.variants.length > 0 ? (
                        <div className="flex items-center gap-1.5 pt-1">
                          {item.variants.map((v) => (
                            <span
                              key={v.id || v.colorName}
                              title={`${v.colorName} (${v.hexCode})`}
                              className="w-3.5 h-3.5 rounded-full border border-zinc-700 shadow-sm shrink-0"
                              style={{ backgroundColor: v.hexCode }}
                            />
                          ))}
                          <span className="text-[10px] text-zinc-500 font-mono ml-1">
                            {item.variants.length} {item.variants.length === 1 ? "cor" : "cores"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-zinc-600 font-mono block pt-1">
                          Sem variações de cor adicionais
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-3 bg-zinc-950/60 border-t border-zinc-800/60 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(item)}
                      title={item.isActive ? "Desativar da vitrine" : "Ativar na vitrine"}
                      className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition cursor-pointer ${
                        item.isActive
                          ? "text-emerald-400 hover:bg-emerald-500/10"
                          : "text-zinc-500 hover:bg-zinc-800"
                      }`}
                    >
                      <Power size={13} />
                      <span className="text-[11px]">{item.isActive ? "Pausar" : "Ativar"}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        title="Editar produto e cores"
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition cursor-pointer"
                      >
                        <Edit2 size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setItemToDelete(item)}
                        title="Excluir produto"
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content: Orçamentos / Leads */}
      {activeTab === "LEADS" && (
        <div className="space-y-4">
          {initialLeads.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-zinc-900/40 border border-dashed border-zinc-800 flex flex-col items-center justify-center gap-3">
              <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400">
                <MessageCircle size={28} />
              </div>
              <h3 className="text-sm font-semibold text-zinc-200">
                Nenhum orçamento personalizado recebido ainda
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm">
                Quando os clientes preencherem o formulário "Personalize sua Peça" na vitrine pública, os contatos e arquivos aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-800 overflow-hidden bg-zinc-900/30">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-zinc-950/80 border-b border-zinc-800 text-[11px] font-mono uppercase text-zinc-400">
                    <tr>
                      <th className="px-4 py-3">Cliente</th>
                      <th className="px-4 py-3">WhatsApp</th>
                      <th className="px-4 py-3">Categoria</th>
                      <th className="px-4 py-3">Tamanho</th>
                      <th className="px-4 py-3">Arte Enviada</th>
                      <th className="px-4 py-3">Data</th>
                      <th className="px-4 py-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {initialLeads.map((lead) => {
                      const cleanPhone = lead.whatsapp.replace(/\D/g, "");
                      const waLink = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(
                        `Olá ${lead.customerName}! Recebemos seu pedido de camiseta personalizada (${lead.shirtModel} - Tam ${lead.size}) na Cordeiro Ink.`
                      )}`;

                      return (
                        <tr key={lead.id} className="hover:bg-zinc-900/50 transition">
                          <td className="px-4 py-3 font-semibold text-zinc-100">
                            {lead.customerName}
                          </td>
                          <td className="px-4 py-3 font-mono text-zinc-300">
                            {lead.whatsapp}
                          </td>
                          <td className="px-4 py-3 text-zinc-300">
                            {lead.shirtModel}
                          </td>
                          <td className="px-4 py-3 font-mono text-zinc-300 font-bold">
                            {lead.size}
                          </td>
                          <td className="px-4 py-3">
                            {lead.customDesignUrl ? (
                              <a
                                href={lead.customDesignUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-[11px] font-mono transition"
                              >
                                <ExternalLink size={11} />
                                <span>Ver Arte</span>
                              </a>
                            ) : (
                              <span className="text-zinc-600 font-mono">Sem arquivo</span>
                            )}
                          </td>
                          <td className="px-4 py-3 font-mono text-zinc-500">
                            {new Date(lead.createdAt).toLocaleDateString("pt-BR")}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition"
                            >
                              <MessageCircle size={12} />
                              <span>Conversar no WhatsApp</span>
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content: Banners da Home */}
      {activeTab === "BANNERS" && (
        <BannerManagerSection initialBanners={initialBanners} />
      )}

      {/* Content: Moldes e Modelagens */}
      {activeTab === "TEMPLATES" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <Shirt size={18} className="text-amber-400" />
                <h3 className="text-sm font-bold text-zinc-100">
                  Moldes & Modelagens Padrão (Mockups Base)
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Arquitetura Arara 3D
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
                Cadastre as bases cinzas neutras com texturas e sombras (frente e costas) de cada modelagem (ex: Oversized Streetwear, Regular Heavyweight, Moletom). Ao cadastrar novas peças, basta escolher a modelagem e subir apenas o PNG da estampa transparente.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleOpenTemplateModal()}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center gap-2 transition shadow cursor-pointer shrink-0"
            >
              <Plus size={15} />
              <span>+ Novo Molde</span>
            </button>
          </div>

          {templatesList.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-zinc-900/40 border border-dashed border-zinc-800 flex flex-col items-center justify-center gap-3">
              <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400">
                <Shirt size={28} />
              </div>
              <h3 className="text-sm font-semibold text-zinc-200">
                Nenhum molde cadastrado ainda
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm">
                Cadastre uma modelagem padrão para reutilizar os mockups neutros cinzas da frente e costas sem precisar subir as fotos repetidamente.
              </p>
              <button
                type="button"
                onClick={() => handleOpenTemplateModal()}
                className="mt-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition shadow-sm cursor-pointer"
              >
                Cadastrar Primeiro Molde
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templatesList.map((tpl) => {
                const totalLinked =
                  (tpl._count?.products || 0) + (tpl._count?.catalogItems || 0);

                return (
                  <div
                    key={tpl.id}
                    className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between gap-4 hover:border-zinc-700 transition"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                            <Shirt size={14} className="text-amber-400" />
                            <span>{tpl.name}</span>
                          </h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 inline-block mt-1">
                            {tpl.category}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-semibold text-zinc-400 px-2 py-0.5 rounded-md bg-zinc-950 border border-zinc-800 shrink-0">
                          {totalLinked} {totalLinked === 1 ? "peça" : "peças"}
                        </span>
                      </div>

                      {tpl.description && (
                        <p className="text-xs text-zinc-400 mb-3 line-clamp-2">
                          {tpl.description}
                        </p>
                      )}

                      {/* Mockups Frente e Costas */}
                      <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
                        <div className="flex flex-col items-center">
                          <span className="text-[9px] font-mono text-zinc-500 uppercase mb-1">
                            Frente
                          </span>
                          <div className="relative aspect-[3/4] w-full max-h-32 rounded-lg overflow-hidden bg-zinc-900 flex items-center justify-center border border-zinc-800">
                            <img
                              src={tpl.baseImageFront}
                              alt={`${tpl.name} Frente`}
                              className="w-full h-full object-contain p-1"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col items-center">
                          <span className="text-[9px] font-mono text-zinc-500 uppercase mb-1">
                            Costas
                          </span>
                          <div className="relative aspect-[3/4] w-full max-h-32 rounded-lg overflow-hidden bg-zinc-900 flex items-center justify-center border border-zinc-800">
                            <img
                              src={tpl.baseImageBack}
                              alt={`${tpl.name} Costas`}
                              className="w-full h-full object-contain p-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800/80">
                      <button
                        type="button"
                        onClick={() => handleOpenTemplateModal(tpl)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Edit2 size={12} />
                        <span>Editar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTemplate(tpl.id, tpl.name)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition cursor-pointer"
                        title="Excluir Molde"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal: Cadastrar ou Editar Molde */}
      {isTemplateModalOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => !isSavingTemplate && setIsTemplateModalOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 text-zinc-100 space-y-5 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Hidden file inputs para os mockups do molde */}
            <input
              type="file"
              ref={tplFrontInputRef}
              accept="image/png,image/webp,image/svg+xml,image/jpeg"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUploadTemplateBase(f, "FRONT");
                if (e.target) e.target.value = "";
              }}
            />
            <input
              type="file"
              ref={tplBackInputRef}
              accept="image/png,image/webp,image/svg+xml,image/jpeg"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUploadTemplateBase(f, "BACK");
                if (e.target) e.target.value = "";
              }}
            />

            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Shirt size={16} />
                </div>
                <h3 className="text-sm font-bold text-zinc-100">
                  {editingTemplate ? "Editar Molde / Modelagem" : "Cadastrar Novo Molde"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTemplateModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nome da Modelagem / Molde *
                </label>
                <input
                  type="text"
                  required
                  value={tplName}
                  onChange={(e) => setTplName(e.target.value)}
                  placeholder="Ex: Oversized Streetwear Boxy, Regular Heavyweight, Moletom"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Categoria da Modelagem
                </label>
                <select
                  value={tplCategory}
                  onChange={(e) => setTplCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="Camisetas">Camisetas</option>
                  <option value="Oversized">Oversized</option>
                  <option value="Adulto">Adulto / Regular</option>
                  <option value="Regatas">Regatas</option>
                  <option value="Feminina">Feminina</option>
                  <option value="Infantil">Infantil</option>
                  <option value="Moletom">Moletom</option>
                </select>
              </div>

              {/* Uploads das bases cinzas Frente e Costas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Frente */}
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                  <span className="text-[11px] font-bold text-zinc-200 block">
                    Mockup Base Cinza (Frente) *
                  </span>
                  <div className="relative aspect-[3/4] w-full max-h-36 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center overflow-hidden">
                    <img
                      src={tplBaseFront}
                      alt="Base Frente"
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={tplBaseFront}
                      onChange={(e) => setTplBaseFront(e.target.value)}
                      placeholder="/mockups/blank-front.svg"
                      className="w-full px-2 py-1 rounded bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-300 font-mono"
                    />
                    <button
                      type="button"
                      disabled={isUploadingTemplateBase}
                      onClick={() => tplFrontInputRef.current?.click()}
                      className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 text-[10px] font-bold flex items-center gap-1 shrink-0 transition cursor-pointer"
                    >
                      {isUploadingTemplateBase ? <Loader2 size={10} className="animate-spin" /> : <Upload size={10} />}
                      <span>Subir</span>
                    </button>
                  </div>
                </div>

                {/* Costas */}
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                  <span className="text-[11px] font-bold text-zinc-200 block">
                    Mockup Base Cinza (Costas) *
                  </span>
                  <div className="relative aspect-[3/4] w-full max-h-36 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center overflow-hidden">
                    <img
                      src={tplBaseBack}
                      alt="Base Costas"
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={tplBaseBack}
                      onChange={(e) => setTplBaseBack(e.target.value)}
                      placeholder="/mockups/blank-back.svg"
                      className="w-full px-2 py-1 rounded bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-300 font-mono"
                    />
                    <button
                      type="button"
                      disabled={isUploadingTemplateBase}
                      onClick={() => tplBackInputRef.current?.click()}
                      className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 text-[10px] font-bold flex items-center gap-1 shrink-0 transition cursor-pointer"
                    >
                      {isUploadingTemplateBase ? <Loader2 size={10} className="animate-spin" /> : <Upload size={10} />}
                      <span>Subir</span>
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Descrição Técnica da Modelagem (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={tplDesc}
                  onChange={(e) => setTplDesc(e.target.value)}
                  placeholder="Ex: Gola canelada de 3cm, caimento solto boxy, ombros caídos..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsTemplateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-medium transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingTemplate || isUploadingTemplateBase}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSavingTemplate && <Loader2 size={12} className="animate-spin" />}
                  <span>{editingTemplate ? "Salvar Alterações" : "Cadastrar Molde"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Adicionar Novo Produto */}
      {isNewModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => !isPending && setIsNewModalOpen(false)}
        >
          <div
            className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 text-zinc-100 space-y-5 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Sparkles size={16} />
                </div>
                <h3 className="text-sm font-bold text-zinc-100">
                  Cadastrar Peça & Variações de Cores
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              {/* Foto Principal de Capa */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Foto Principal de Capa *
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleMainFileUpload(e, false)}
                  className="hidden"
                />

                {imageUrl ? (
                  <div className="relative aspect-[3/4] w-36 rounded-xl overflow-hidden border border-zinc-700 mx-auto">
                    <SafeImage
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      containerClassName="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-500"
                    />
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/80 text-zinc-300 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-zinc-800 hover:border-zinc-600 rounded-xl p-5 text-center cursor-pointer transition bg-zinc-900/40 flex flex-col items-center justify-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 size={22} className="animate-spin text-amber-400" />
                        <span className="text-xs text-zinc-400 font-mono">
                          Fazendo upload da foto para o Supabase...
                        </span>
                      </>
                    ) : (
                      <>
                        <Upload size={22} className="text-zinc-500" />
                        <div>
                          <p className="text-xs font-semibold text-zinc-300">
                            Clique para subir a foto principal de capa
                          </p>
                          <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">
                            Bucket público storefront (PNG, JPG, WEBP)
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Título & Preço */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Título da Peça *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Heavyweight Boxy Tee"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Preço de Venda (R$) *
                  </label>
                  <CurrencyInput
                    value={price}
                    onChange={(val) => setPrice(val)}
                    placeholder="149,90"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Categoria Estrita */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Categoria *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {CATALOG_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Descrição / Detalhes do Tecido
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Malha 100% algodão 260g/m² com ribana canelada de 3cm e costura reforçada."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Seção Dinâmica de Variações de Cores */}
              <div className="pt-2 border-t border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Palette size={15} className="text-amber-400" />
                    <span className="text-xs font-bold text-zinc-200">
                      Variações de Cores & Fotos Específicas ({variants.length})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddVariant(false)}
                    className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Adicionar Cor</span>
                  </button>
                </div>

                {variants.length === 0 ? (
                  <p className="text-[11px] text-zinc-500 italic bg-zinc-900/40 p-3 rounded-xl border border-dashed border-zinc-800">
                    Nenhuma variação adicionada. O produto usará apenas a foto principal de capa. Clique em "Adicionar Cor" para cadastrar fotos por cor (ex: Preto, Off-White, Bege).
                  </p>
                ) : (
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {variants.map((variant, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs"
                      >
                        {/* Nome da Cor */}
                        <div className="flex-1">
                          <input
                            type="text"
                            required
                            placeholder="Nome da Cor (ex: Preto OLED)"
                            value={variant.colorName}
                            onChange={(e) => {
                              const val = e.target.value;
                              setVariants((prev) => {
                                const next = [...prev];
                                next[index].colorName = val;
                                return next;
                              });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        {/* Color Picker / Hex */}
                        <div className="flex items-center gap-2 shrink-0">
                          <input
                            type="color"
                            value={variant.hexCode || "#000000"}
                            onChange={(e) => {
                              const val = e.target.value;
                              setVariants((prev) => {
                                const next = [...prev];
                                next[index].hexCode = val;
                                return next;
                              });
                            }}
                            className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                            title="Seletor visual de cor"
                          />
                          <input
                            type="text"
                            value={variant.hexCode}
                            onChange={(e) => {
                              const val = e.target.value;
                              setVariants((prev) => {
                                const next = [...prev];
                                next[index].hexCode = val;
                                return next;
                              });
                            }}
                            placeholder="#000000"
                            className="w-20 px-2 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-[11px] text-zinc-100 focus:outline-none focus:border-amber-500 uppercase"
                          />
                        </div>

                        {/* Imagem desta Variação */}
                        <div className="flex items-center gap-2 shrink-0">
                          {variant.imageUrl ? (
                            <div className="relative w-9 h-11 rounded-lg overflow-hidden border border-zinc-700 bg-black">
                              <SafeImage
                                src={variant.imageUrl}
                                alt={variant.colorName}
                                className="w-full h-full object-cover"
                                containerClassName="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-500"
                                iconSize={14}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setVariants((prev) => {
                                    const next = [...prev];
                                    next[index].imageUrl = "";
                                    return next;
                                  });
                                }}
                                className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/80 text-zinc-300 hover:text-white"
                              >
                                <X size={10} />
                              </button>
                            </div>
                          ) : (
                            <label className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] flex items-center gap-1.5 cursor-pointer transition">
                              {uploadingVariantIndex === index ? (
                                <Loader2 size={12} className="animate-spin text-amber-400" />
                              ) : (
                                <Upload size={12} />
                              )}
                              <span>Foto desta cor</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleVariantFileUpload(file, index, false);
                                }}
                              />
                            </label>
                          )}

                          {/* Botão Remover Variação */}
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(index, false)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                            title="Remover cor"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Toggle Arara Virtual */}
              <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/40 transition">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOnVirtualRack}
                    onChange={(e) => setShowOnVirtualRack(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-zinc-950 border-zinc-700 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                      <Sparkles size={13} className="text-amber-400" />
                      Exibir na Arara Virtual 3D
                    </span>
                    <span className="text-[11px] text-zinc-400 block mt-0.5">
                      Destaca esta peça no showroom interativo no topo da vitrine com rotação 360° e flip frente/costas.
                    </span>
                  </div>
                </label>
              </div>

              {showOnVirtualRack && (
                <PrintPositioningBlock
                  isFront={previewSide === "FRONT"}
                  setIsFront={(f) => setPreviewSide(f ? "FRONT" : "BACK")}
                  previewColor={previewColor}
                  setPreviewColor={setPreviewColor}
                  baseShirtUrl={baseShirtUrl}
                  setBaseShirtUrl={setBaseShirtUrl}
                  baseShirtBackUrl={baseShirtBackUrl}
                  setBaseShirtBackUrl={setBaseShirtBackUrl}
                  printImageUrl={printImageUrl}
                  setPrintImageUrl={setPrintImageUrl}
                  printBackImageUrl={printBackImageUrl}
                  setPrintBackImageUrl={setPrintBackImageUrl}
                  printWidth={printWidth}
                  setPrintWidth={setPrintWidth}
                  printTop={printTop}
                  setPrintTop={setPrintTop}
                  printLeft={printLeft}
                  setPrintLeft={setPrintLeft}
                  printWidthBack={printWidthBack}
                  setPrintWidthBack={setPrintWidthBack}
                  printTopBack={printTopBack}
                  setPrintTopBack={setPrintTopBack}
                  printLeftBack={printLeftBack}
                  setPrintLeftBack={setPrintLeftBack}
                  isUploading={isUploadingPrint}
                  onUploadLayer={(file, target) => handleUploadLayerFile(file, target, false)}
                  templates={templatesList}
                  selectedTemplateId={selectedTemplateId}
                  onSelectTemplate={(tplId) => {
                    setSelectedTemplateId(tplId);
                    const found = templatesList.find((t) => t.id === tplId);
                    if (found) {
                      setBaseShirtUrl(found.baseImageFront);
                      setBaseShirtBackUrl(found.baseImageBack);
                    }
                  }}
                />
              )}

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-medium transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending || isUploading || uploadingVariantIndex !== null}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isPending ? "Publicando..." : "Publicar na Vitrine"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Produto e Variações */}
      {editingItem && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => !isPending && setEditingItem(null)}
        >
          <div
            className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 text-zinc-100 space-y-5 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Edit2 size={16} />
                </div>
                <h3 className="text-sm font-bold text-zinc-100">
                  Editar Peça & Variações
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              {/* Imagem Principal Atual / Trocar */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Foto Principal de Capa
                </label>
                <input
                  ref={editFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleMainFileUpload(e, true)}
                  className="hidden"
                />

                <div className="flex items-center gap-4">
                  <div className="relative aspect-[3/4] w-20 rounded-xl overflow-hidden border border-zinc-700 bg-zinc-900 shrink-0">
                    <SafeImage
                      src={editImageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      containerClassName="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-500"
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => editFileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          <span>Enviando...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={12} />
                          <span>Trocar Foto Principal</span>
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-zinc-500 mt-1">
                      Armazenado no bucket público do Supabase
                    </p>
                  </div>
                </div>
              </div>

              {/* Título & Preço */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Título da Peça *
                  </label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Preço (R$) *
                  </label>
                  <CurrencyInput
                    value={editPrice}
                    onChange={(val) => setEditPrice(val)}
                    placeholder="0,00"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Categoria Estrita */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Categoria *
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {CATALOG_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Descrição / Detalhes
                </label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Seção Dinâmica de Variações na Edição */}
              <div className="pt-2 border-t border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Palette size={15} className="text-amber-400" />
                    <span className="text-xs font-bold text-zinc-200">
                      Variações de Cores ({editVariants.length})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddVariant(true)}
                    className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Adicionar Cor</span>
                  </button>
                </div>

                {editVariants.length === 0 ? (
                  <p className="text-[11px] text-zinc-500 italic bg-zinc-900/40 p-3 rounded-xl border border-dashed border-zinc-800">
                    Nenhuma cor cadastrada. Clique no botão acima para adicionar fotos específicas por cor.
                  </p>
                ) : (
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {editVariants.map((variant, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs"
                      >
                        {/* Nome da Cor */}
                        <div className="flex-1">
                          <input
                            type="text"
                            required
                            placeholder="Nome da Cor (ex: Branco Neve)"
                            value={variant.colorName}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditVariants((prev) => {
                                const next = [...prev];
                                next[index].colorName = val;
                                return next;
                              });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        {/* Color Picker / Hex */}
                        <div className="flex items-center gap-2 shrink-0">
                          <input
                            type="color"
                            value={variant.hexCode || "#000000"}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditVariants((prev) => {
                                const next = [...prev];
                                next[index].hexCode = val;
                                return next;
                              });
                            }}
                            className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                            title="Seletor visual de cor"
                          />
                          <input
                            type="text"
                            value={variant.hexCode}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditVariants((prev) => {
                                const next = [...prev];
                                next[index].hexCode = val;
                                return next;
                              });
                            }}
                            placeholder="#000000"
                            className="w-20 px-2 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-[11px] text-zinc-100 focus:outline-none focus:border-amber-500 uppercase"
                          />
                        </div>

                        {/* Imagem desta Variação */}
                        <div className="flex items-center gap-2 shrink-0">
                          {variant.imageUrl ? (
                            <div className="relative w-9 h-11 rounded-lg overflow-hidden border border-zinc-700 bg-black">
                              <SafeImage
                                src={variant.imageUrl}
                                alt={variant.colorName}
                                className="w-full h-full object-cover"
                                containerClassName="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-500"
                                iconSize={14}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setEditVariants((prev) => {
                                    const next = [...prev];
                                    next[index].imageUrl = "";
                                    return next;
                                  });
                                }}
                                className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/80 text-zinc-300 hover:text-white"
                              >
                                <X size={10} />
                              </button>
                            </div>
                          ) : (
                            <label className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] flex items-center gap-1.5 cursor-pointer transition">
                              {uploadingVariantIndex === index ? (
                                <Loader2 size={12} className="animate-spin text-amber-400" />
                              ) : (
                                <Upload size={12} />
                              )}
                              <span>Foto desta cor</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleVariantFileUpload(file, index, true);
                                }}
                              />
                            </label>
                          )}

                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(index, true)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                            title="Remover cor"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Toggle Arara Virtual */}
              <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/40 transition">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editShowOnVirtualRack}
                    onChange={(e) => setEditShowOnVirtualRack(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-zinc-950 border-zinc-700 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                      <Sparkles size={13} className="text-amber-400" />
                      Exibir na Arara Virtual 3D
                    </span>
                    <span className="text-[11px] text-zinc-400 block mt-0.5">
                      Destaca esta peça no showroom interativo no topo da vitrine com rotação 360° e flip frente/costas.
                    </span>
                  </div>
                </label>
              </div>

              {editShowOnVirtualRack && (
                <PrintPositioningBlock
                  isFront={editPreviewSide === "FRONT"}
                  setIsFront={(f) => setEditPreviewSide(f ? "FRONT" : "BACK")}
                  previewColor={editPreviewColor}
                  setPreviewColor={setEditPreviewColor}
                  baseShirtUrl={editBaseShirtUrl}
                  setBaseShirtUrl={setEditBaseShirtUrl}
                  baseShirtBackUrl={editBaseShirtBackUrl}
                  setBaseShirtBackUrl={setEditBaseShirtBackUrl}
                  printImageUrl={editPrintImageUrl}
                  setPrintImageUrl={setEditPrintImageUrl}
                  printBackImageUrl={editPrintBackImageUrl}
                  setPrintBackImageUrl={setEditPrintBackImageUrl}
                  printWidth={editPrintWidth}
                  setPrintWidth={setEditPrintWidth}
                  printTop={editPrintTop}
                  setPrintTop={setEditPrintTop}
                  printLeft={editPrintLeft}
                  setPrintLeft={setEditPrintLeft}
                  printWidthBack={editPrintWidthBack}
                  setPrintWidthBack={setEditPrintWidthBack}
                  printTopBack={editPrintTopBack}
                  setPrintTopBack={setEditPrintTopBack}
                  printLeftBack={editPrintLeftBack}
                  setPrintLeftBack={setEditPrintLeftBack}
                  isUploading={isUploadingEditPrint}
                  onUploadLayer={(file, target) => handleUploadLayerFile(file, target, true)}
                  templates={templatesList}
                  selectedTemplateId={editSelectedTemplateId}
                  onSelectTemplate={(tplId) => {
                    setEditSelectedTemplateId(tplId);
                    const found = templatesList.find((t) => t.id === tplId);
                    if (found) {
                      setEditBaseShirtUrl(found.baseImageFront);
                      setEditBaseShirtBackUrl(found.baseImageBack);
                    }
                  }}
                />
              )}

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-medium transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending || isUploading || uploadingVariantIndex !== null}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isPending ? "Salvando..." : "Salvar Alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Exclusão de Produto */}
      {itemToDelete && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => !isPending && setItemToDelete(null)}
        >
          <div
            className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 text-zinc-100 space-y-4"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                  <Trash2 size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">
                    Remover Peça da Vitrine
                  </h3>
                  <p className="text-xs text-zinc-400">{itemToDelete.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Tem certeza que deseja excluir esta peça da vitrine? Todas as fotos e variações de cores vinculadas também serão removidas.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isPending ? "Excluindo..." : "Confirmar Exclusão"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
