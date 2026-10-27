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
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useState, useTransition } from "react";
import {
  createProduct,
  updateProduct,
  toggleProductVirtualRack,
  deleteProduct,
} from "@/actions/products";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ProductCatalogProps {
  products: any[];
}

export function ProductsCatalog({ products }: ProductCatalogProps) {
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
    setShowOnVirtualRack(false);
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
        if (editingProduct) {
          const res = await updateProduct(editingProduct.id, {
            skuBase,
            name,
            category,
            collection,
            targetMargin: Number(targetMargin) || 50,
            imageUrl: imageUrl.trim() || undefined,
            backImageUrl: backImageUrl.trim() || undefined,
            description,
            showOnVirtualRack,
          });

          if (res && !res.success) {
            toast.error(res.error || "Erro ao atualizar produto.");
            return;
          }

          toast.success(`Produto "${name}" atualizado com sucesso!`);
        } else {
          const res = await createProduct({
            skuBase,
            name,
            category,
            collection,
            targetMargin: Number(targetMargin) || 50,
            imageUrl: imageUrl.trim() || undefined,
            backImageUrl: backImageUrl.trim() || undefined,
            description,
            showOnVirtualRack,
            variants: [
              {
                sku: `${skuBase}-BLK-G`,
                title: "Preto G",
                size: "G",
                color: "Preto",
                colorHex: "#111111",
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

      {/* MODAL: CRIAR / EDITAR PRODUTO NO ERP */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 text-zinc-100 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Shirt size={16} />
                </div>
                <h3 className="text-sm font-bold text-zinc-100">
                  {editingProduct ? "Editar Produto ERP" : "Novo Produto no ERP"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Coleção / Linha
                  </label>
                  <input
                    type="text"
                    value={collection}
                    onChange={(e) => setCollection(e.target.value)}
                    placeholder="ex: Drop 01 - Cyber"
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
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    URL Foto Frontal (Frente)
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
                    URL Foto Traseira (Costas)
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
                      Destaca esta peça no showroom interativo no topo da vitrine da loja com rotação 360° e flip frente/costas.
                    </span>
                  </div>
                </label>
              </div>

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

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  {isPending && <Loader2 size={13} className="animate-spin" />}
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
