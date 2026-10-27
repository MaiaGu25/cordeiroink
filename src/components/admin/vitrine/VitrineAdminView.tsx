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
} from "lucide-react";
import {
  createCatalogItem,
  updateCatalogItem,
  deleteCatalogItem,
  uploadStorefrontFile,
} from "@/actions/storefront";
import { CATALOG_CATEGORIES, type VariantInput } from "@/lib/storefront-constants";
import { formatCurrency } from "@/lib/utils";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { SafeImage } from "@/components/ui/SafeImage";
import { BannerManagerSection, type BannerItem } from "./BannerManagerSection";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
}

export function VitrineAdminView({
  initialItems,
  initialLeads,
  initialBanners = [],
}: VitrineAdminViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"CATALOG" | "LEADS" | "BANNERS">("CATALOG");

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

    try {
      const res = await uploadStorefrontFile(formData);
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
    } catch (err: any) {
      toast.error("Erro ao enviar arquivo: " + (err?.message || String(err)));
    } finally {
      setIsUploading(false);
      if (e.target) {
        e.target.value = "";
      }
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

    try {
      const res = await uploadStorefrontFile(formData);
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
    } catch (err: any) {
      toast.error("Erro ao enviar arquivo: " + err.message);
    } finally {
      setUploadingVariantIndex(null);
    }
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

      {/* Modal: Adicionar Novo Produto */}
      {isNewModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => !isPending && setIsNewModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 text-zinc-100 space-y-5 max-h-[92vh] overflow-y-auto"
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
            className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 text-zinc-100 space-y-5 max-h-[92vh] overflow-y-auto"
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
