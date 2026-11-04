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
  Check,
  Eye,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useState, useTransition, useRef } from "react";
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/actions/products";
import { uploadFileViaApi } from "@/lib/api-upload";
import { SafeImage } from "@/components/ui/SafeImage";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  // Preview & Upload State
  const [previewSide, setPreviewSide] = useState<"FRONT" | "BACK">("FRONT");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const frontPhotoInputRef = useRef<HTMLInputElement>(null);
  const backPhotoInputRef = useRef<HTMLInputElement>(null);

  // Upload handler para fotos reais do produto
  const handleUploadPhoto = async (
    e: React.ChangeEvent<HTMLInputElement>,
    side: "FRONT" | "BACK"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "catalog");

    const res = await uploadFileViaApi(formData);

    if (res.success && res.url) {
      if (side === "FRONT") {
        setImageUrl(res.url);
        toast.success("Foto principal (frente) enviada com sucesso!");
      } else {
        setBackImageUrl(res.url);
        toast.success("Foto secundária (costas) enviada com sucesso!");
      }
    } else {
      toast.error(res.error || "Erro no upload da imagem");
    }
    setIsUploadingPhoto(false);
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
    setSelectedTemplateId("");
    setPreviewSide("FRONT");
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
    setSelectedTemplateId(prod.templateId || "");
    setPreviewSide("FRONT");
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
          images: [imageUrl.trim(), backImageUrl.trim()].filter(Boolean),
          description,
          templateId: selectedTemplateId || undefined,
          variants: editingProduct?.variants || [],
        };

        if (editingProduct) {
          const res = await updateProduct(editingProduct.id, payloadData);

          if (res && !res.success) {
            toast.error(res.error || "Erro ao atualizar produto.");
            return;
          }
          toast.success("Produto atualizado com sucesso!");
        } else {
          const res = await createProduct({
            ...payloadData,
            variants: [
              {
                sku: `${skuBase}-BLK-P`,
                title: `${name} (Preto P)`,
                size: "P",
                color: "Preto",
                colorHex: "#18181b",
                basePrice: 99.9,
              },
              {
                sku: `${skuBase}-BLK-M`,
                title: `${name} (Preto M)`,
                size: "M",
                color: "Preto",
                colorHex: "#18181b",
                basePrice: 99.9,
              },
              {
                sku: `${skuBase}-BLK-G`,
                title: `${name} (Preto G)`,
                size: "G",
                color: "Preto",
                colorHex: "#18181b",
                basePrice: 99.9,
              },
              {
                sku: `${skuBase}-BLK-GG`,
                title: `${name} (Preto GG)`,
                size: "GG",
                color: "Preto",
                colorHex: "#18181b",
                basePrice: 99.9,
              },
            ],
          });

          if (res && !res.success) {
            toast.error(res.error || "Erro ao criar produto.");
            return;
          }
          toast.success("Produto e variantes criados com sucesso!");
        }

        setIsModalOpen(false);
        router.refresh();
      } catch (err: any) {
        toast.error("Erro inesperado: " + err.message);
      }
    });
  };

  // Excluir Produto
  const handleDeleteProduct = (id: string, prodName: string) => {
    if (confirm(`Tem certeza que deseja excluir o produto "${prodName}" e suas variantes?`)) {
      startTransition(async () => {
        const res = await deleteProduct(id);
        if (res.success) {
          toast.success("Produto excluído com sucesso.");
          router.refresh();
        } else {
          toast.error(res.error || "Erro ao excluir produto.");
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra de Ações Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
        <div>
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <Shirt size={18} className="text-amber-500" />
            <span>Engenharia de Produtos & Vitrine</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Gerencie as fotos reais dos produtos, cálculo de margem e fichas técnicas (BOM).
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-2 transition shadow-lg cursor-pointer shrink-0"
        >
          <Plus size={16} />
          <span>Novo Produto</span>
        </button>
      </div>

      {/* Lista de Produtos Cadastrados */}
      {products.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-zinc-900/50 border border-dashed border-zinc-800 flex flex-col items-center justify-center gap-3">
          <Shirt size={32} className="text-zinc-600" />
          <p className="text-xs text-zinc-400">
            Nenhum produto cadastrado no ateliê. Clique no botão acima para adicionar.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => {
            const isExpanded = expandedProductId === product.id;

            return (
              <div
                key={product.id}
                className="rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700/80 transition-all overflow-hidden"
              >
                {/* Cabeçalho do Card */}
                <div
                  onClick={() => setExpandedProductId(isExpanded ? null : product.id)}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-16 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center">
                      <SafeImage
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        containerClassName="w-full h-full bg-zinc-950 flex items-center justify-center text-zinc-600"
                        iconSize={20}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-zinc-100 truncate">
                          {product.name}
                        </h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 shrink-0">
                          {product.skuBase}
                        </span>
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

                  <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-4 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(product);
                      }}
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer"
                      title="Editar dados do produto"
                    >
                      <Edit2 size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProduct(product.id, product.name);
                      }}
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition cursor-pointer"
                      title="Excluir produto"
                    >
                      <Trash2 size={14} />
                    </button>

                    <div className="p-2 text-zinc-500">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </div>

                {/* Área Expansível: Variantes e Ficha Técnica */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-zinc-800/80 bg-zinc-950/40 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                        Variantes & Fichas Técnicas (BOM)
                      </span>
                      <span className="text-[11px] font-mono text-zinc-500">
                        Total: {product.variants?.length || 0} itens
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {product.variants?.map((variant: any) => (
                        <div
                          key={variant.id}
                          className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-zinc-200">
                              {variant.sku}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-zinc-800 font-mono text-[10px] text-amber-400">
                              Tam {variant.size}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-zinc-400">
                            <span>Cor: {variant.color}</span>
                            <span className="font-mono text-zinc-200 font-bold">
                              {formatCurrency(variant.basePrice)}
                            </span>
                          </div>
                          <div className="text-[10px] text-zinc-500 font-mono pt-1 border-t border-zinc-800">
                            BOM: {variant.bom?.length || 0} insumos vinculados
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE CADASTRO / EDIÇÃO SIMPLIFICADO (SEM ARARA / SEM BLEND MOCKS)     */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Shirt size={20} className="text-amber-500" />
                <h3 className="font-serif text-lg font-bold text-zinc-100">
                  {editingProduct ? `Editar "${editingProduct.name}"` : "Novo Produto do Ateliê"}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Inputs Ocultos para Upload Direto */}
            <input
              type="file"
              ref={frontPhotoInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => handleUploadPhoto(e, "FRONT")}
            />
            <input
              type="file"
              ref={backPhotoInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => handleUploadPhoto(e, "BACK")}
            />

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* LADO ESQUERDO: PREVIEW DA FOTO REAL */}
                <div className="md:col-span-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-300">
                      Foto do Produto
                    </span>

                    {/* Switch Frente / Costas */}
                    <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-[11px] font-semibold">
                      <button
                        type="button"
                        onClick={() => setPreviewSide("FRONT")}
                        className={`px-3 py-1 rounded-lg transition cursor-pointer ${
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
                        className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                          previewSide === "BACK"
                            ? "bg-amber-500 text-zinc-950 font-bold shadow"
                            : "text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        Costas
                      </button>
                    </div>
                  </div>

                  {/* Card de Visualização da Foto */}
                  <div className="relative aspect-[3/4] w-full rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden flex items-center justify-center shadow-inner">
                    <SafeImage
                      src={previewSide === "FRONT" ? imageUrl : backImageUrl}
                      alt="Preview do Produto"
                      className="w-full h-full object-cover"
                      containerClassName="w-full h-full bg-zinc-950 flex flex-col items-center justify-center text-zinc-600 gap-2 p-4 text-center"
                      fallbackText={
                        previewSide === "FRONT"
                          ? "Nenhuma foto de frente cadastrada"
                          : "Nenhuma foto de costas cadastrada"
                      }
                      iconSize={36}
                    />

                    {/* Overlay de Upload Rápido */}
                    <div className="absolute bottom-3 inset-x-3 flex gap-2">
                      <button
                        type="button"
                        disabled={isUploadingPhoto}
                        onClick={() => {
                          if (previewSide === "FRONT") frontPhotoInputRef.current?.click();
                          else backPhotoInputRef.current?.click();
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-black/80 hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition backdrop-blur-sm border border-zinc-700 cursor-pointer"
                      >
                        {isUploadingPhoto ? (
                          <Loader2 size={13} className="animate-spin text-amber-400" />
                        ) : (
                          <Upload size={13} />
                        )}
                        <span>
                          {previewSide === "FRONT" ? "Subir Foto Frente" : "Subir Foto Costas"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* LADO DIREITO: DADOS GERAIS DO PRODUTO */}
                <div className="md:col-span-7 space-y-4">
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
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Categoria
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 cursor-pointer"
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
                      placeholder="ex: Camiseta Oversized Blessed 260g"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
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
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
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
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* URLs Diretas das Fotos (Frente e Costas) */}
                  <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                    <span className="text-xs font-bold text-zinc-200 block">
                      Fotos do Produto (Upload ou Link Direto)
                    </span>

                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                        Foto Frente (URL)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="url"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="https://.../foto-frente.jpg"
                          className="flex-1 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => frontPhotoInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition shrink-0"
                        >
                          <Upload size={12} />
                          <span>Subir Arquivo</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                        Foto Costas (URL)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="url"
                          value={backImageUrl}
                          onChange={(e) => setBackImageUrl(e.target.value)}
                          placeholder="https://.../foto-costas.jpg"
                          className="flex-1 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => backPhotoInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition shrink-0"
                        >
                          <Upload size={12} />
                          <span>Subir Arquivo</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Molde / Modelagem Vinculada (Opcional) */}
                  {templates.length > 0 && (
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Molde de Modelagem Vinculado (Opcional)
                      </label>
                      <select
                        value={selectedTemplateId}
                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="">Nenhum molde selecionado...</option>
                        {templates.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.category || "Camisetas"})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

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
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Botões de Ação do Modal */}
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
                  disabled={isPending || isUploadingPhoto}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg"
                >
                  {(isPending || isUploadingPhoto) && <Loader2 size={13} className="animate-spin" />}
                  <span>{editingProduct ? "Salvar Alterações" : "Criar Produto"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
