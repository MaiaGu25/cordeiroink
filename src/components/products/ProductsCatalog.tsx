"use client";

import {
  Shirt,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Plus,
  Edit2,
  Trash2,
  X,
  Upload,
  Loader2,
  Sliders,
  RotateCw,
  Eye,
  Move,
  Maximize2,
  RefreshCw,
  Check,
  Sun,
  Moon,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useState, useTransition, useRef } from "react";
import {
  createProduct,
  updateProduct,
  toggleProductVirtualRack,
  deleteProduct,
} from "@/actions/products";
import { uploadStorefrontFile } from "@/actions/storefront";
import { uploadFileViaApi } from "@/lib/api-upload";
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

interface ProductCatalogProps {
  products: any[];
  templates?: any[];
}

export function ProductsCatalog({ products, templates = [] }: ProductCatalogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [expandedProductId, setExpandedProductId] = useState<string | null>(
    products[0]?.id || null
  );

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Form Fields
  const [skuBase, setSkuBase] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Camisetas");
  const [collection, setCollection] = useState("");
  const [targetMargin, setTargetMargin] = useState("50");
  const [imageUrl, setImageUrl] = useState("");
  const [backImageUrl, setBackImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [showOnVirtualRack, setShowOnVirtualRack] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  // Blend Mode & Print Positioning Fields
  const [baseShirtUrl, setBaseShirtUrl] = useState("/mockups/blank-front.svg");
  const [baseShirtBackUrl, setBaseShirtBackUrl] = useState("/mockups/blank-back.svg");
  const [baseShirtSideUrl, setBaseShirtSideUrl] = useState("/mockups/blank-side.svg");
  const [printImageUrl, setPrintImageUrl] = useState("");
  const [printBackImageUrl, setPrintBackImageUrl] = useState("");
  const [printLightFront, setPrintLightFront] = useState("");
  const [printDarkFront, setPrintDarkFront] = useState("");
  const [printLightBack, setPrintLightBack] = useState("");
  const [printDarkBack, setPrintDarkBack] = useState("");
  const [printWidth, setPrintWidth] = useState(45);
  const [printTop, setPrintTop] = useState(28);
  const [printLeft, setPrintLeft] = useState(50);
  const [printWidthBack, setPrintWidthBack] = useState(50);
  const [printTopBack, setPrintTopBack] = useState(25);
  const [printLeftBack, setPrintLeftBack] = useState(50);

  // Live Preview Settings
  const [previewSide, setPreviewSide] = useState<"FRONT" | "BACK">("FRONT");
  const [previewColor, setPreviewColor] = useState("#18181b");
  const [previewPrintTheme, setPreviewPrintTheme] = useState<"LIGHT" | "DARK">("LIGHT");
  const [isUploadingPrint, setIsUploadingPrint] = useState(false);

  const frontPrintLightInputRef = useRef<HTMLInputElement>(null);
  const frontPrintDarkInputRef = useRef<HTMLInputElement>(null);
  const backPrintLightInputRef = useRef<HTMLInputElement>(null);
  const backPrintDarkInputRef = useRef<HTMLInputElement>(null);
  const frontBaseInputRef = useRef<HTMLInputElement>(null);
  const backBaseInputRef = useRef<HTMLInputElement>(null);
  const sideBaseInputRef = useRef<HTMLInputElement>(null);

  // Upload handler para as camadas e versões de estampa
  const handleUploadLayer = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target:
      | "PRINT_LIGHT_FRONT"
      | "PRINT_DARK_FRONT"
      | "PRINT_LIGHT_BACK"
      | "PRINT_DARK_BACK"
      | "BASE_FRONT"
      | "BASE_BACK"
      | "BASE_SIDE"
      | "PRINT_FRONT"
      | "PRINT_BACK"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPrint(true);
    const folder = target.startsWith("BASE") ? "mockups" : "prints";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const res = await uploadFileViaApi(formData);

    if (res.success && res.url) {
      if (target === "PRINT_LIGHT_FRONT") {
        setPrintLightFront(res.url);
        setPrintImageUrl(res.url);
      } else if (target === "PRINT_DARK_FRONT") {
        setPrintDarkFront(res.url);
      } else if (target === "PRINT_LIGHT_BACK") {
        setPrintLightBack(res.url);
        setPrintBackImageUrl(res.url);
      } else if (target === "PRINT_DARK_BACK") {
        setPrintDarkBack(res.url);
      } else if (target === "PRINT_FRONT") {
        setPrintLightFront(res.url);
        setPrintImageUrl(res.url);
      } else if (target === "PRINT_BACK") {
        setPrintLightBack(res.url);
        setPrintBackImageUrl(res.url);
      } else if (target === "BASE_FRONT") {
        setBaseShirtUrl(res.url);
      } else if (target === "BASE_BACK") {
        setBaseShirtBackUrl(res.url);
      } else if (target === "BASE_SIDE") {
        setBaseShirtSideUrl(res.url);
      }

      const msg =
        target === "BASE_FRONT"
          ? "Mockup Base Frente enviado!"
          : target === "BASE_BACK"
          ? "Mockup Base Costas enviado!"
          : target === "BASE_SIDE"
          ? "Mockup Base Lateral enviado!"
          : target === "PRINT_LIGHT_FRONT"
          ? "Estampa Clara (Frente) enviada!"
          : target === "PRINT_DARK_FRONT"
          ? "Estampa Escura (Frente) enviada!"
          : target === "PRINT_LIGHT_BACK"
          ? "Estampa Clara (Costas) enviada!"
          : target === "PRINT_DARK_BACK"
          ? "Estampa Escura (Costas) enviada!"
          : "Estampa enviada com sucesso!";
      toast.success(msg);
    } else {
      toast.error(res.error || "Erro no upload da imagem");
    }
    setIsUploadingPrint(false);
    if (e.target) e.target.value = "";
  };

  // Abrir Modal para Novo Produto
  const handleOpenNew = () => {
    setEditingProduct(null);
    setSkuBase(`PRD-${Date.now().toString().slice(-4)}`);
    setName("");
    setCategory("Camisetas");
    setCollection("Drop Principal");
    setTargetMargin("50");
    setImageUrl("");
    setBackImageUrl("");
    setDescription("");
    setShowOnVirtualRack(true);
    setSelectedTemplateId("");
    setBaseShirtUrl("/mockups/blank-front.svg");
    setBaseShirtBackUrl("/mockups/blank-back.svg");
    setBaseShirtSideUrl("/mockups/blank-side.svg");
    setPrintImageUrl("");
    setPrintBackImageUrl("");
    setPrintLightFront("");
    setPrintDarkFront("");
    setPrintLightBack("");
    setPrintDarkBack("");
    setPrintWidth(45);
    setPrintTop(28);
    setPrintLeft(50);
    setPrintWidthBack(50);
    setPrintTopBack(25);
    setPrintLeftBack(50);
    setPreviewSide("FRONT");
    setPreviewColor("#18181b");
    setPreviewPrintTheme("LIGHT");
    setIsModalOpen(true);
  };

  // Abrir Modal para Edição
  const handleOpenEdit = (prod: any) => {
    setEditingProduct(prod);
    setSkuBase(prod.skuBase || "");
    setName(prod.name || "");
    setCategory(prod.category || "Camisetas");
    setCollection(prod.collection || "");
    setTargetMargin(String(prod.targetMargin || 50));
    setImageUrl(prod.imageUrl || "");
    setBackImageUrl(prod.backImageUrl || "");
    setDescription(prod.description || "");
    setShowOnVirtualRack(Boolean(prod.showOnVirtualRack));
    setSelectedTemplateId(prod.templateId || "");
    setBaseShirtUrl(
      prod.baseShirtUrl || prod.template?.baseImageFront || "/mockups/blank-front.svg"
    );
    setBaseShirtBackUrl(
      prod.baseShirtBackUrl || prod.template?.baseImageBack || "/mockups/blank-back.svg"
    );
    setBaseShirtSideUrl(
      prod.baseShirtSideUrl || prod.template?.baseImageSide || "/mockups/blank-side.svg"
    );
    setPrintImageUrl(prod.printImageUrl || "");
    setPrintBackImageUrl(prod.printBackImageUrl || "");
    setPrintLightFront(prod.printLightFront || prod.printImageUrl || "");
    setPrintDarkFront(prod.printDarkFront || "");
    setPrintLightBack(prod.printLightBack || prod.printBackImageUrl || "");
    setPrintDarkBack(prod.printDarkBack || "");
    setPrintWidth(prod.printWidth ?? 45);
    setPrintTop(prod.printTop ?? 28);
    setPrintLeft(prod.printLeft ?? 50);
    setPrintWidthBack(prod.printWidthBack ?? 50);
    setPrintTopBack(prod.printTopBack ?? 25);
    setPrintLeftBack(prod.printLeftBack ?? 50);
    setPreviewSide("FRONT");
    setPreviewColor(prod.variants?.[0]?.colorHex || "#18181b");
    setPreviewPrintTheme("LIGHT");
    setIsModalOpen(true);
  };

  // Submissão do Formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !skuBase.trim()) {
      toast.error("Preencha o Nome e o SKU Base do produto.");
      return;
    }

    startTransition(async () => {
      try {
        const payloadData = {
          skuBase,
          name,
          category,
          collection,
          targetMargin: Number(targetMargin) || 50,
          imageUrl: imageUrl.trim() || undefined,
          backImageUrl: backImageUrl.trim() || undefined,
          description,
          showOnVirtualRack,
          templateId: selectedTemplateId || undefined,
          baseShirtUrl: baseShirtUrl.trim() || undefined,
          baseShirtBackUrl: baseShirtBackUrl.trim() || undefined,
          baseShirtSideUrl: baseShirtSideUrl.trim() || undefined,
          printImageUrl: printLightFront.trim() || printImageUrl.trim() || undefined,
          printBackImageUrl: printLightBack.trim() || printBackImageUrl.trim() || undefined,
          printLightFront: printLightFront.trim() || undefined,
          printDarkFront: printDarkFront.trim() || undefined,
          printLightBack: printLightBack.trim() || undefined,
          printDarkBack: printDarkBack.trim() || undefined,
          printWidth: Number(printWidth),
          printTop: Number(printTop),
          printLeft: Number(printLeft),
          printWidthBack: Number(printWidthBack),
          printTopBack: Number(printTopBack),
          printLeftBack: Number(printLeftBack),
        };

        if (editingProduct) {
          const res = await updateProduct(editingProduct.id, payloadData);

          if (res && !res.success) {
            toast.error(res.error || "Erro ao atualizar produto.");
            return;
          }

          toast.success(`Produto "${name}" atualizado com sucesso!`);
        } else {
          const res = await createProduct({
            ...payloadData,
            variants: [
              {
                sku: `${skuBase}-BLK-G`,
                title: "Preto G",
                size: "G",
                color: "Preto",
                colorHex: "#111111",
                printTheme: "LIGHT",
                basePrice: 89.9,
              },
            ],
          });

          if (res && !res.success) {
            toast.error(res.error || "Erro ao criar produto.");
            return;
          }

          toast.success(`Produto "${name}" criado com sucesso!`);
        }

        setIsModalOpen(false);
        router.refresh();
      } catch (err: any) {
        toast.error("Erro: " + (err?.message || String(err)));
      }
    });
  };

  // Toggle Rápido de Arara Virtual
  const handleToggleVirtualRack = (prod: any, e: React.MouseEvent) => {
    e.stopPropagation();
    startTransition(async () => {
      try {
        const nextState = !prod.showOnVirtualRack;
        const res = await toggleProductVirtualRack(prod.id, nextState);
        if (res && !res.success) {
          toast.error(res.error || "Erro ao alterar visibilidade na arara.");
          return;
        }

        toast.success(
          nextState
            ? `"${prod.name}" agora é exibido na Arara Virtual da loja!`
            : `"${prod.name}" removido da Arara Virtual.`
        );
        router.refresh();
      } catch (err: any) {
        toast.error("Erro ao alterar arara: " + (err?.message || String(err)));
      }
    });
  };

  // Exclusão de Produto
  const handleDelete = (prod: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Deseja excluir permanentemente o produto "${prod.name}"?`)) return;

    startTransition(async () => {
      try {
        const res = await deleteProduct(prod.id);
        if (res && !res.success) {
          toast.error(res.error || "Erro ao excluir produto.");
          return;
        }

        toast.success(`Produto "${prod.name}" removido.`);
        router.refresh();
      } catch (err: any) {
        toast.error("Erro ao excluir: " + (err?.message || String(err)));
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
        <div>
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <Shirt size={16} className="text-amber-400" />
            Catálogo de Peças Fixas & Engenharia
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Configure fichas técnicas, margens alvo e selecione quais peças vão para a Arara Virtual da vitrine.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-md"
        >
          <Plus size={15} />
          <span>Novo Produto no ERP</span>
        </button>
      </div>

      {products.length === 0 ? (
        <div className="p-12 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-800/60 border border-zinc-700/60 flex items-center justify-center text-zinc-400 mx-auto">
            <Shirt size={20} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-200">
              Nenhum produto cadastrado no ERP ainda
            </h4>
            <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1">
              Cadastre peças fixas ou coleções para simular margens de lucro e exibir na Arara Virtual 3D da vitrine!
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenNew}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold inline-flex items-center gap-2 transition cursor-pointer mt-2"
          >
            <Plus size={14} />
            <span>Cadastrar Primeiro Produto</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => {
            const isExpanded = expandedProductId === product.id;

            return (
              <div
                key={product.id}
                className={`rounded-2xl bg-zinc-900/80 border overflow-hidden transition-all shadow-sm ${
                  product.showOnVirtualRack
                    ? "border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.08)]"
                    : "border-zinc-800/80"
                }`}
              >
                {/* Main Product Card Header */}
                <div
                  onClick={() =>
                    setExpandedProductId(isExpanded ? null : product.id)
                  }
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-zinc-800/30 transition"
                >
                  <div className="flex items-center gap-4">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-14 h-14 rounded-xl object-cover border border-zinc-700 shrink-0 bg-zinc-950"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 shrink-0">
                        <Shirt size={22} />
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-zinc-100">
                          {product.name}
                        </h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {product.skuBase}
                        </span>

                        {/* Badge Arara Virtual */}
                        {product.showOnVirtualRack && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                            <Sparkles size={10} />
                            Arara Virtual Ativa
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-zinc-400">
                        <span>{product.collection || "Linha Principal"}</span>
                        <span>•</span>
                        <span>{product.category || "Camisetas"}</span>
                        <span>•</span>
                        <span>{product.variants?.length || 0} variantes</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-6">
                    {/* Botão Rápido Toggle Arara */}
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={(e) => handleToggleVirtualRack(product, e)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                        product.showOnVirtualRack
                          ? "bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25"
                          : "bg-zinc-800/80 text-zinc-400 border-zinc-700 hover:text-zinc-200"
                      }`}
                      title="Ativar/Desativar na Arara Virtual"
                    >
                      <Sparkles size={12} />
                      <span>{product.showOnVirtualRack ? "Na Arara" : "+ Arara"}</span>
                    </button>

                    {/* Botão Editar */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(product);
                      }}
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition cursor-pointer"
                      title="Editar Produto"
                    >
                      <Edit2 size={14} />
                    </button>

                    {/* Botão Excluir */}
                    <button
                      type="button"
                      onClick={(e) => handleDelete(product, e)}
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-red-950/60 text-zinc-400 hover:text-red-400 transition cursor-pointer"
                      title="Excluir Produto"
                    >
                      <Trash2 size={14} />
                    </button>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-semibold text-zinc-500 block">
                        Margem
                      </span>
                      <span className="text-sm font-bold font-mono text-amber-400">
                        {product.targetMargin}%
                      </span>
                    </div>

                    <div className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Variants & BOM Table */}
                {isExpanded && (
                  <div className="p-5 border-t border-zinc-800 bg-zinc-950/50 space-y-4 animate-in fade-in duration-200">
                    <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers size={13} className="text-amber-400" />
                      Grade de Variantes & Ficha Técnica (Bill of Materials)
                    </div>

                    <div className="space-y-3">
                      {product.variants?.map((v: any) => {
                        const totalBomCost =
                          v.bom?.reduce(
                            (acc: number, b: any) =>
                              acc + (b.rawItem?.costPrice || 0) * b.quantity,
                            0
                          ) || 0;
                        const estimatedProfit = v.basePrice - totalBomCost;

                        return (
                          <div
                            key={v.id}
                            className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-zinc-100">
                                  {v.title}
                                </span>
                                <span className="font-mono text-[11px] text-zinc-400">
                                  ({v.sku})
                                </span>
                                {v.color && (
                                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                                    <span
                                      className="w-2 h-2 rounded-full border border-zinc-600"
                                      style={{ backgroundColor: v.colorHex || "#111" }}
                                    />
                                    {v.color} • {v.size}
                                  </span>
                                )}
                              </div>

                              {/* BOM items list */}
                              <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-zinc-400">
                                {v.bom?.length ? (
                                  v.bom.map((b: any) => (
                                    <span
                                      key={b.id}
                                      className="px-2 py-0.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-300"
                                    >
                                      {b.quantity}x {b.rawItem?.name} (
                                      {formatCurrency(b.rawItem?.costPrice || 0)})
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-zinc-500 italic text-[10px]">
                                    Sem ficha técnica (BOM) vinculada
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-right shrink-0">
                              <div>
                                <span className="text-[10px] text-zinc-500 block">
                                  Custo Insumos
                                </span>
                                <span className="font-mono text-zinc-400">
                                  {formatCurrency(totalBomCost)}
                                </span>
                              </div>

                              <div>
                                <span className="text-[10px] text-zinc-500 block">
                                  Preço Base
                                </span>
                                <span className="font-mono font-bold text-zinc-100">
                                  {formatCurrency(v.basePrice)}
                                </span>
                              </div>

                              <div>
                                <span className="text-[10px] text-emerald-500 block">
                                  Margem Bruta
                                </span>
                                <span className="font-mono font-bold text-emerald-400">
                                  {formatCurrency(estimatedProfit)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: CRIAR / EDITAR PRODUTO NO ERP (COM PREVIEW EM TEMPO REAL) */}
      {isModalOpen && (() => {
        const isFront = previewSide === "FRONT";
        const currentBase = isFront
          ? baseShirtUrl || "/mockups/blank-front.svg"
          : baseShirtBackUrl || "/mockups/blank-back.svg";
        const currentPrint = isFront
          ? previewPrintTheme === "LIGHT"
            ? (printLightFront || printImageUrl)
            : (printDarkFront || printImageUrl)
          : previewPrintTheme === "LIGHT"
            ? (printLightBack || printBackImageUrl)
            : (printDarkBack || printBackImageUrl);
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

        const handleResetCoordinates = () => {
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
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="w-full max-w-5xl bg-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-7 text-zinc-100 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Shirt size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                      <span>{editingProduct ? "Editar Produto ERP" : "Novo Produto no ERP"}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 text-amber-400 border border-amber-500/30">
                        CSS Blend Mode 3D
                      </span>
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Configure a ficha técnica, posicione a estampa dinamicamente e visualize em tempo real.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form & 2-Column Grid */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* COLUNA ESQUERDA: PREVIEW EM TEMPO REAL & CONTROLES DE POSIÇÃO */}
                  <div className="lg:col-span-5 space-y-4 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-200">
                        <Eye size={14} className="text-amber-400" />
                        <span>Preview</span>
                      </div>

                      {/* Switch Tema de Estampa Clara vs Escura */}
                      <div className="inline-flex items-center p-0.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[10px] font-mono font-bold">
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewPrintTheme("LIGHT");
                            setPreviewColor("#18181b");
                          }}
                          className={`px-1.5 py-0.5 rounded transition cursor-pointer flex items-center gap-1 ${
                            previewPrintTheme === "LIGHT"
                              ? "bg-amber-500 text-zinc-950 font-bold"
                              : "text-zinc-400 hover:text-zinc-200"
                          }`}
                          title="Estampa clara para tecidos escuros"
                        >
                          <Sun size={10} />
                          <span>Clara</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewPrintTheme("DARK");
                            setPreviewColor("#f4f4f5");
                          }}
                          className={`px-1.5 py-0.5 rounded transition cursor-pointer flex items-center gap-1 ${
                            previewPrintTheme === "DARK"
                              ? "bg-amber-500 text-zinc-950 font-bold"
                              : "text-zinc-400 hover:text-zinc-200"
                          }`}
                          title="Estampa escura para tecidos claros/brancos"
                        >
                          <Moon size={10} />
                          <span>Escura</span>
                        </button>
                      </div>

                      {/* Switch Frente / Costas */}
                      <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-[11px] font-semibold">
                        <button
                          type="button"
                          onClick={() => setPreviewSide("FRONT")}
                          className={`px-2.5 py-0.5 rounded-lg transition cursor-pointer ${
                            previewSide === "FRONT"
                              ? "bg-amber-500 text-zinc-950 font-bold shadow"
                              : "text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          Frente
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewSide("BACK")}
                          className={`px-2.5 py-0.5 rounded-lg transition cursor-pointer ${
                            previewSide === "BACK"
                              ? "bg-amber-500 text-zinc-950 font-bold shadow"
                              : "text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          Costas
                        </button>
                      </div>
                    </div>

                    {/* Paleta de Cores para Teste de Blend */}
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase font-semibold tracking-wider block mb-1.5">
                        Testar Cor do Tecido (Fundo):
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        {PREVIEW_PALETTE.map((c) => (
                          <button
                            key={c.hex}
                            type="button"
                            onClick={() => setPreviewColor(c.hex)}
                            title={c.name}
                            className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                              previewColor === c.hex
                                ? "border-amber-400 scale-110 shadow-md ring-2 ring-amber-400/30"
                                : "border-zinc-700 hover:scale-105"
                            }`}
                            style={{ backgroundColor: c.hex }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* MOCKUP INTERATIVO (SANDUÍCHE DE 3 CAMADAS) */}
                    <div className="relative w-full aspect-[3/4] max-h-[360px] rounded-2xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-center overflow-hidden shadow-inner select-none">
                      {/* Camada 1: Fundo com Cor Selecionada (Mascarada pelo contorno da camiseta) */}
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

                      {/* Camada 2: Mockup Cinza com Textura & Sombras (mix-blend-multiply) */}
                      <img
                        src={currentBase}
                        alt="Mockup Camiseta Base"
                        className="relative z-10 w-full h-full object-contain mix-blend-multiply pointer-events-none select-none transition-all duration-300"
                      />

                      {/* Camada 3: Arte PNG Isolada (Posicionamento Dinâmico em tempo real) */}
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
                            alt="Estampa Isolada"
                            className="w-full h-auto object-contain drop-shadow-md select-none"
                          />
                        </div>
                      ) : (
                        <div
                          className="absolute z-20 pointer-events-none border-2 border-dashed border-amber-400/60 rounded-xl p-2.5 text-center flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all"
                          style={{
                            top: `${currentTop}%`,
                            left: `${currentLeft}%`,
                            width: `${currentWidth}%`,
                            transform: "translateX(-50%)",
                            minHeight: "70px",
                          }}
                        >
                          <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                            Área da Estampa ({previewSide === "FRONT" ? "Frente" : "Costas"})
                          </span>
                          <span className="text-[9px] text-zinc-300 mt-0.5">
                            Adicione o PNG da estampa ao lado
                          </span>
                        </div>
                      )}

                      {/* Watermark Indicativa */}
                      <div className="absolute bottom-2 right-2 z-30 px-2 py-0.5 rounded-md bg-zinc-900/80 border border-zinc-800 text-[9px] font-mono text-zinc-400">
                        {previewSide === "FRONT" ? "Frente" : "Costas"} • W:{currentWidth}% Y:{currentTop}% X:{currentLeft}%
                      </div>
                    </div>

                    {/* SLIDERS DE COORDENADAS EM TEMPO REAL */}
                    <div className="space-y-3 pt-2 border-t border-zinc-800/80">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                          <Sliders size={13} className="text-amber-400" />
                          <span>Ajuste Fino ({previewSide === "FRONT" ? "Frente" : "Costas"})</span>
                        </span>
                        <button
                          type="button"
                          onClick={handleResetCoordinates}
                          className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition"
                          title="Restaurar valores padrão"
                        >
                          <RefreshCw size={10} />
                          <span>Padrão</span>
                        </button>
                      </div>

                      {/* Slider: Escala / Largura */}
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-zinc-400 flex items-center gap-1">
                            <Maximize2 size={11} /> Escala da Estampa:
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
                            className="w-14 px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono text-center text-zinc-100"
                          />
                        </div>
                      </div>

                      {/* Slider: Posição Vertical (Y / Top) */}
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-zinc-400 flex items-center gap-1">
                            <Move size={11} /> Posição Vertical (Y):
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
                            className="w-14 px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono text-center text-zinc-100"
                          />
                        </div>
                      </div>

                      {/* Slider: Posição Horizontal (X / Left) */}
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-zinc-400 flex items-center gap-1">
                            <Move size={11} className="rotate-90" /> Posição Horizontal (X):
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
                            className="w-14 px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono text-center text-zinc-100"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* COLUNA DIREITA: DADOS DO PRODUTO & ARQUITETURA DE ARQUIVOS */}
                  <div className="lg:col-span-7 space-y-4">
                    {/* 6 Inputs de Upload Ocultos para cada camada e versão */}
                    <input
                      type="file"
                      ref={frontBaseInputRef}
                      accept="image/png,image/webp,image/svg+xml,image/jpeg"
                      className="hidden"
                      onChange={(e) => handleUploadLayer(e, "BASE_FRONT")}
                    />
                    <input
                      type="file"
                      ref={backBaseInputRef}
                      accept="image/png,image/webp,image/svg+xml,image/jpeg"
                      className="hidden"
                      onChange={(e) => handleUploadLayer(e, "BASE_BACK")}
                    />
                    <input
                      type="file"
                      ref={sideBaseInputRef}
                      accept="image/png,image/webp,image/svg+xml,image/jpeg"
                      className="hidden"
                      onChange={(e) => handleUploadLayer(e, "BASE_SIDE")}
                    />
                    <input
                      type="file"
                      ref={frontPrintLightInputRef}
                      accept="image/png,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={(e) => handleUploadLayer(e, "PRINT_LIGHT_FRONT")}
                    />
                    <input
                      type="file"
                      ref={frontPrintDarkInputRef}
                      accept="image/png,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={(e) => handleUploadLayer(e, "PRINT_DARK_FRONT")}
                    />
                    <input
                      type="file"
                      ref={backPrintLightInputRef}
                      accept="image/png,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={(e) => handleUploadLayer(e, "PRINT_LIGHT_BACK")}
                    />
                    <input
                      type="file"
                      ref={backPrintDarkInputRef}
                      accept="image/png,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={(e) => handleUploadLayer(e, "PRINT_DARK_BACK")}
                    />

                    {/* Linha 1: SKU e Categoria */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">
                          SKU Base *
                        </label>
                        <input
                          type="text"
                          required
                          value={skuBase}
                          onChange={(e) => setSkuBase(e.target.value.toUpperCase())}
                          placeholder="ex: OVR-STREET-01"
                          className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">
                          Categoria
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 cursor-pointer"
                        >
                          <option value="Camisetas">Camisetas</option>
                          <option value="Oversized">Oversized</option>
                          <option value="Moletom">Moletom</option>
                          <option value="Infantil">Infantil</option>
                        </select>
                      </div>
                    </div>

                    {/* Nome do Produto */}
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Nome do Produto *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="ex: Camiseta Oversized Cyberpunk 260g"
                        className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Linha 2: Coleção e Margem Alvo */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">
                          Coleção / Drop
                        </label>
                        <input
                          type="text"
                          value={collection}
                          onChange={(e) => setCollection(e.target.value)}
                          placeholder="ex: Drop 01 - Streetwear"
                          className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">
                          Margem Alvo (%)
                        </label>
                        <input
                          type="number"
                          value={targetMargin}
                          onChange={(e) => setTargetMargin(e.target.value)}
                          placeholder="50"
                          className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 font-mono"
                        />
                      </div>
                    </div>

                    {/* SEÇÃO: ARQUITETURA BLEND MODE & CONTRASTE DINÂMICO DE ESTAMPAS */}
                    <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                          <Layers size={14} />
                          <span>Contraste Dinâmico de Estampas (Blend Mode)</span>
                        </span>
                        <span className="text-[10px] text-zinc-400">PNG transparente isolado</span>
                      </div>

                      {/* Versão Clara (para tecidos escuros) */}
                      <div className="p-3 rounded-xl bg-zinc-950/70 border border-amber-500/20 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                            <Sun size={12} />
                            <span>Estampa Clara (para tecidos escuros: Preto, Marinho, Grafite...)</span>
                          </span>
                          <span className="text-[9px] font-mono text-zinc-400">Tema: LIGHT</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-semibold text-zinc-300 mb-1">
                              Frente (Clara)
                            </label>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={printLightFront}
                                onChange={(e) => {
                                  setPrintLightFront(e.target.value);
                                  setPrintImageUrl(e.target.value);
                                }}
                                placeholder="https://.../estampa-clara-frente.png"
                                className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                              />
                              <button
                                type="button"
                                disabled={isUploadingPrint}
                                onClick={() => frontPrintLightInputRef.current?.click()}
                                className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center gap-1 shrink-0 transition cursor-pointer shadow"
                                title="Upload Estampa Clara Frente"
                              >
                                {isUploadingPrint ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                                <span>Upload</span>
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-semibold text-zinc-300 mb-1">
                              Costas (Clara)
                            </label>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={printLightBack}
                                onChange={(e) => {
                                  setPrintLightBack(e.target.value);
                                  setPrintBackImageUrl(e.target.value);
                                }}
                                placeholder="https://.../estampa-clara-costas.png"
                                className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                              />
                              <button
                                type="button"
                                disabled={isUploadingPrint}
                                onClick={() => backPrintLightInputRef.current?.click()}
                                className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center gap-1 shrink-0 transition cursor-pointer shadow"
                                title="Upload Estampa Clara Costas"
                              >
                                {isUploadingPrint ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                                <span>Upload</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Versão Escura (para tecidos claros) */}
                      <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-zinc-200 flex items-center gap-1.5">
                            <Moon size={12} className="text-zinc-400" />
                            <span>Estampa Escura (para tecidos claros: Branco, Off-White, Bege...)</span>
                          </span>
                          <span className="text-[9px] font-mono text-zinc-400">Tema: DARK</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-semibold text-zinc-300 mb-1">
                              Frente (Escura)
                            </label>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={printDarkFront}
                                onChange={(e) => setPrintDarkFront(e.target.value)}
                                placeholder="https://.../estampa-escura-frente.png"
                                className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                              />
                              <button
                                type="button"
                                disabled={isUploadingPrint}
                                onClick={() => frontPrintDarkInputRef.current?.click()}
                                className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1 shrink-0 transition cursor-pointer"
                                title="Upload Estampa Escura Frente"
                              >
                                {isUploadingPrint ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                                <span>Upload</span>
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-semibold text-zinc-300 mb-1">
                              Costas (Escura)
                            </label>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={printDarkBack}
                                onChange={(e) => setPrintDarkBack(e.target.value)}
                                placeholder="https://.../estampa-escura-costas.png"
                                className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                              />
                              <button
                                type="button"
                                disabled={isUploadingPrint}
                                onClick={() => backPrintDarkInputRef.current?.click()}
                                className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1 shrink-0 transition cursor-pointer"
                                title="Upload Estampa Escura Costas"
                              >
                                {isUploadingPrint ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                                <span>Upload</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Seleção de Molde / Modelagem Padrão */}
                      <div className="pt-2 border-t border-zinc-800">
                        <label className="block text-[11px] font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                          <Shirt size={12} />
                          <span>Molde / Modelagem Padrão (Mockup Base Cinza)</span>
                        </label>
                        <select
                          value={selectedTemplateId}
                          onChange={(e) => {
                            const tId = e.target.value;
                            setSelectedTemplateId(tId);
                            const tpl = (templates || []).find((t) => t.id === tId);
                            if (tpl) {
                              setBaseShirtUrl(tpl.baseImageFront);
                              setBaseShirtBackUrl(tpl.baseImageBack);
                              setBaseShirtSideUrl(tpl.baseImageSide || "/mockups/blank-side.svg");
                            }
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 cursor-pointer"
                        >
                          <option value="">Selecione um molde de modelagem...</option>
                          {(templates || []).map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name} ({t.category || "Camisetas"})
                            </option>
                          ))}
                        </select>
                        <span className="text-[10px] text-zinc-400 block mt-1">
                          As bases cinzas da frente, costas e lateral são herdadas automaticamente do molde selecionado.
                        </span>

                        {/* Detalhes expansíveis para customização manual opcional */}
                        <details className="text-[10px] text-zinc-400 pt-1.5">
                          <summary className="cursor-pointer hover:text-zinc-200 font-medium transition select-none">
                            ⚙️ Personalizar mockups base manualmente (opcional)
                          </summary>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 pt-2 border-t border-zinc-800">
                            <div>
                              <label className="block text-[9px] text-zinc-400 mb-0.5">
                                Base Frente
                              </label>
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  value={baseShirtUrl}
                                  onChange={(e) => setBaseShirtUrl(e.target.value)}
                                  placeholder="/mockups/blank-front.svg"
                                  className="w-full px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-300 font-mono"
                                />
                                <button
                                  type="button"
                                  disabled={isUploadingPrint}
                                  onClick={() => frontBaseInputRef.current?.click()}
                                  className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                                >
                                  <Upload size={10} />
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[9px] text-zinc-400 mb-0.5">
                                Base Costas
                              </label>
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  value={baseShirtBackUrl}
                                  onChange={(e) => setBaseShirtBackUrl(e.target.value)}
                                  placeholder="/mockups/blank-back.svg"
                                  className="w-full px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-300 font-mono"
                                />
                                <button
                                  type="button"
                                  disabled={isUploadingPrint}
                                  onClick={() => backBaseInputRef.current?.click()}
                                  className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                                >
                                  <Upload size={10} />
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[9px] text-zinc-400 mb-0.5">
                                Base Lateral (Arara)
                              </label>
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  value={baseShirtSideUrl}
                                  onChange={(e) => setBaseShirtSideUrl(e.target.value)}
                                  placeholder="/mockups/blank-side.svg"
                                  className="w-full px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-300 font-mono"
                                />
                                <button
                                  type="button"
                                  disabled={isUploadingPrint}
                                  onClick={() => sideBaseInputRef.current?.click()}
                                  className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                                >
                                  <Upload size={10} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </details>
                      </div>
                    </div>

                    {/* Foto Vitrine Convencional (Opcional) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">
                          Foto Vitrine Frente (Tradicional)
                        </label>
                        <input
                          type="url"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="https://.../frente.png"
                          className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">
                          Foto Vitrine Costas (Tradicional)
                        </label>
                        <input
                          type="url"
                          value={backImageUrl}
                          onChange={(e) => setBackImageUrl(e.target.value)}
                          placeholder="https://.../costas.png"
                          className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* TOGGLE: EXIBIR NA ARARA VIRTUAL */}
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
                            Exibe esta peça no showroom interativo no topo da vitrine com giro 3D e blend mode.
                          </span>
                        </div>
                      </label>
                    </div>

                    {/* Descrição Técnica */}
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Descrição Técnica
                      </label>
                      <textarea
                        rows={2}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Detalhes de confecção, gramatura e acabamento..."
                        className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isPending || isUploadingPrint}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg"
                  >
                    {(isPending || isUploadingPrint) && <Loader2 size={13} className="animate-spin" />}
                    <span>{editingProduct ? "Salvar Alterações" : "Criar Produto"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
