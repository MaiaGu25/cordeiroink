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
  Check,
} from "lucide-react";
import {
  createCatalogItem,
  updateCatalogItem,
  deleteCatalogItem,
} from "@/actions/storefront";
import { uploadFileViaApi } from "@/lib/api-upload";
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
  backImageUrl?: string | null;
  images?: string[];
}

interface CatalogItem {
  id: string;
  title: string;
  description: string | null;
  price: number;
  imageUrl: string;
  backImageUrl?: string | null;
  images?: string[];
  category: string;
  isActive: boolean;
  showOnVirtualRack?: boolean;
  variants?: CatalogVariant[];
  createdAt: string | Date;
}

interface LeadQuote {
  id: string;
  customerName: string;
  whatsapp: string;
  shirtModel: string;
  size: string;
  customDesignUrl?: string | null;
  notes?: string | null;
  createdAt: string | Date;
}

interface VitrineAdminViewProps {
  initialItems: CatalogItem[];
  initialLeads: LeadQuote[];
  initialBanners?: BannerItem[];
  initialTemplates?: any[];
}

export function VitrineAdminView({
  initialItems,
  initialLeads,
  initialBanners = [],
}: VitrineAdminViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"CATALOG" | "LEADS" | "BANNERS">("CATALOG");

  const [items, setItems] = useState<CatalogItem[]>(initialItems);
  const [isPending, startTransition] = useTransition();

  // Filtros
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Estado do Modal de Criação
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [category, setCategory] = useState("Adulto");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [backImageUrl, setBackImageUrl] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<
    { colorName: string; hexCode: string; imageUrl: string; images?: string[] }[]
  >([]);

  // Estado do Modal de Edição
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState<number | "">("");
  const [editCategory, setEditCategory] = useState("Adulto");
  const [editDescription, setEditDescription] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editBackImageUrl, setEditBackImageUrl] = useState("");
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editVariants, setEditVariants] = useState<
    { colorName: string; hexCode: string; imageUrl: string; images?: string[] }[]
  >([]);

  // Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingVariantIndex, setUploadingVariantIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const backFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const editBackFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const editGalleryFileInputRef = useRef<HTMLInputElement>(null);

  // Estado de Exclusão
  const [itemToDelete, setItemToDelete] = useState<CatalogItem | null>(null);

  // Upload de Foto Principal
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
    if (e.target) e.target.value = "";
  };

  // Upload de Foto Secundária (Costas)
  const handleBackFileUpload = async (
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
        setEditBackImageUrl(res.url);
      } else {
        setBackImageUrl(res.url);
      }
      toast.success("Foto de costas enviada com sucesso!");
    } else {
      toast.error(res.error || "Erro no upload da imagem");
    }

    setIsUploading(false);
    if (e.target) e.target.value = "";
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
          next[index].imageUrl = res.url!;
          return next;
        });
      } else {
        setVariants((prev) => {
          const next = [...prev];
          next[index].imageUrl = res.url!;
          return next;
        });
      }
      toast.success("Foto da variação enviada com sucesso!");
    } else {
      toast.error(res.error || "Erro no upload da imagem da variação");
    }
    setUploadingVariantIndex(null);
  };

  // Upload de Múltiplas Imagens para Galeria Geral
  const handleGalleryUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    isEdit = false
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append("file", files[i]);
      formData.append("folder", "catalog");
      const res = await uploadFileViaApi(formData);
      if (res.success && res.url) {
        uploadedUrls.push(res.url);
      }
    }

    if (uploadedUrls.length > 0) {
      if (isEdit) {
        setEditImages((prev) => [...prev, ...uploadedUrls]);
      } else {
        setImages((prev) => [...prev, ...uploadedUrls]);
      }
      toast.success(`${uploadedUrls.length} foto(s) adicionada(s) à galeria!`);
    } else {
      toast.error("Erro ao enviar imagens da galeria.");
    }

    setIsUploading(false);
    if (e.target) e.target.value = "";
  };

  const handleRemoveGalleryImage = (index: number, isEdit = false) => {
    if (isEdit) {
      setEditImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Upload de Múltiplas Fotos para uma Variação de Cor
  const handleVariantMultiFileUpload = async (
    files: FileList | null,
    variantIndex: number,
    isEdit = false
  ) => {
    if (!files || files.length === 0) return;

    setUploadingVariantIndex(variantIndex);
    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append("file", files[i]);
      formData.append("folder", "catalog");
      const res = await uploadFileViaApi(formData);
      if (res.success && res.url) {
        uploadedUrls.push(res.url);
      }
    }

    if (uploadedUrls.length > 0) {
      const setter = isEdit ? setEditVariants : setVariants;
      setter((prev) => {
        const next = [...prev];
        const currentVariant = next[variantIndex];
        const existingImages = currentVariant.images || (currentVariant.imageUrl ? [currentVariant.imageUrl] : []);
        const mergedImages = [...existingImages, ...uploadedUrls];
        next[variantIndex] = {
          ...currentVariant,
          imageUrl: currentVariant.imageUrl || uploadedUrls[0],
          images: mergedImages,
        };
        return next;
      });
      toast.success(`${uploadedUrls.length} foto(s) da variação enviada(s)!`);
    } else {
      toast.error("Erro ao fazer upload das fotos da variação.");
    }

    setUploadingVariantIndex(null);
  };

  const handleRemoveVariantImage = (
    variantIndex: number,
    imageIndex: number,
    isEdit = false
  ) => {
    const setter = isEdit ? setEditVariants : setVariants;
    setter((prev) => {
      const next = [...prev];
      const current = next[variantIndex];
      const currentList = current.images || (current.imageUrl ? [current.imageUrl] : []);
      const updatedList = currentList.filter((_, i) => i !== imageIndex);
      next[variantIndex] = {
        ...current,
        images: updatedList,
        imageUrl: updatedList[0] || "",
      };
      return next;
    });
  };

  // Gerenciamento de Variantes (Novo Item)
  const handleAddVariant = (isEdit = false) => {
    const defaultColor = {
      colorName: "Nova Cor",
      hexCode: "#18181b",
      imageUrl: "",
      images: [],
    };
    if (isEdit) {
      setEditVariants((prev) => [...prev, defaultColor]);
    } else {
      setVariants((prev) => [...prev, defaultColor]);
    }
  };

  const handleRemoveVariant = (index: number, isEdit = false) => {
    if (isEdit) {
      setEditVariants((prev) => prev.filter((_, i) => i !== index));
    } else {
      setVariants((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Submissão de Criação
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || price === "" || !imageUrl.trim()) {
      toast.error("Preencha o título, preço e envie a foto principal de capa.");
      return;
    }

    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      toast.error("Informe um preço de venda válido.");
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          title: title.trim(),
          price: parsedPrice,
          imageUrl: imageUrl.trim(),
          backImageUrl: backImageUrl.trim() || undefined,
          category,
          description: description.trim() || undefined,
          images: images.filter(Boolean),
          variants: variants.map((v) => ({ ...v, images: v.images && v.images.length > 0 ? v.images : (v.imageUrl ? [v.imageUrl] : []) })),
        };

        const res: any = await createCatalogItem(payload);
        if (res && typeof res === "object" && "success" in res && !res.success) {
          toast.error(String(res.error || "Erro ao cadastrar produto"));
          return;
        }

        toast.success(`Peça "${title}" cadastrada com sucesso!`);
        setIsNewModalOpen(false);
        setTitle("");
        setPrice("");
        setCategory("Adulto");
        setDescription("");
        setImageUrl("");
        setBackImageUrl("");
        setImages([]);
        setVariants([]);
        router.refresh();
      } catch (err: any) {
        toast.error("Erro ao cadastrar: " + (err?.message || String(err)));
      }
    });
  };

  // Abrir Modal de Edição
  const handleOpenEdit = (item: CatalogItem) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditPrice(item.price);
    setEditCategory(item.category || "Adulto");
    setEditDescription(item.description || "");
    setEditImageUrl(item.imageUrl);
    setEditBackImageUrl(item.backImageUrl || "");
    setEditImages(item.images || []);
    setEditVariants(
      item.variants?.map((v) => ({
        colorName: v.colorName,
        hexCode: v.hexCode || "#18181b",
        imageUrl: v.imageUrl,
        images: v.images && v.images.length > 0 ? v.images : (v.imageUrl ? [v.imageUrl] : []),
      })) || []
    );
  };

  // Salvar Edição
  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (!editTitle.trim() || editPrice === "" || !editImageUrl.trim()) {
      toast.error("Título, preço e imagem de capa são obrigatórios.");
      return;
    }

    const parsedPrice = Number(editPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      toast.error("Informe um preço de venda válido.");
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          title: editTitle.trim(),
          price: parsedPrice,
          imageUrl: editImageUrl.trim(),
          backImageUrl: editBackImageUrl.trim() || undefined,
          category: editCategory,
          description: editDescription.trim() || undefined,
          images: editImages.filter(Boolean),
          variants: editVariants.map((v) => ({ ...v, images: v.images && v.images.length > 0 ? v.images : (v.imageUrl ? [v.imageUrl] : []) })),
        };

        const res: any = await updateCatalogItem(editingItem.id, payload);
        if (res && typeof res === "object" && "success" in res && !res.success) {
          toast.error(String(res.error || "Erro ao atualizar produto"));
          return;
        }

        toast.success(`Peça "${editTitle}" atualizada com sucesso!`);
        setEditingItem(null);
        router.refresh();
      } catch (err: any) {
        toast.error("Erro ao atualizar: " + (err?.message || String(err)));
      }
    });
  };

  // Toggle Ativo / Inativo
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

  // Exclusão
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

  // Filtragem de Itens
  const filteredItems = items.filter((item) => {
    const matchesCategory =
      categoryFilter === "ALL" || item.category === categoryFilter;
    const matchesSearch =
      searchTerm === "" ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
            Cadastre fotos reais dos produtos, organize por categoria (Adulto, Infantil, Oversized, Feminina, Regata) e visualize os leads.
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
            <span>Ver Loja ao Vivo</span>
          </a>

          <button
            onClick={() => {
              setIsNewModalOpen(true);
              setTitle("");
              setPrice("");
              setCategory("Adulto");
              setDescription("");
              setImageUrl("");
              setBackImageUrl("");
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

      {/* Content: Peças do Catálogo */}
      {activeTab === "CATALOG" && (
        <div className="space-y-4">
          {/* Barra de Filtros */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setCategoryFilter("ALL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer shrink-0 ${
                  categoryFilter === "ALL"
                    ? "bg-amber-500 text-zinc-950 font-bold"
                    : "bg-zinc-800/80 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Todas ({items.length})
              </button>
              {CATALOG_CATEGORIES.map((cat) => {
                const count = items.filter((i) => i.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer shrink-0 ${
                      categoryFilter === cat
                        ? "bg-amber-500 text-zinc-950 font-bold"
                        : "bg-zinc-800/80 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>

            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="Buscar por nome ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Grid de Cards */}
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-zinc-900/40 border border-dashed border-zinc-800 flex flex-col items-center justify-center gap-3">
              <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500">
                <ImageIcon size={28} />
              </div>
              <h3 className="text-sm font-semibold text-zinc-300">
                Nenhuma peça encontrada
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm">
                Cadastre novas peças ou altere o filtro de categoria acima.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="group rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Imagem de Capa Real */}
                    <div className="relative aspect-[3/4] bg-zinc-950 border-b border-zinc-800/80 overflow-hidden">
                      <SafeImage
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        containerClassName="w-full h-full bg-zinc-950 flex items-center justify-center text-zinc-600"
                        iconSize={32}
                      />

                      {/* Status Badges */}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border backdrop-blur-md font-semibold ${
                            item.isActive
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-zinc-800/80 text-zinc-400 border-zinc-700"
                          }`}
                        >
                          {item.isActive ? "Ativo" : "Inativo"}
                        </span>
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

                      <h4 className="font-serif text-sm font-bold text-zinc-100 truncate">
                        {item.title}
                      </h4>

                      {item.description && (
                        <p className="text-xs text-zinc-400 line-clamp-2 font-light">
                          {item.description}
                        </p>
                      )}

                      {/* Miniaturas de Cores Cadastradas */}
                      {item.variants && item.variants.length > 0 && (
                        <div className="pt-2 flex items-center gap-1 overflow-x-auto">
                          {item.variants.map((v) => (
                            <span
                              key={v.id}
                              title={v.colorName}
                              className="w-3.5 h-3.5 rounded-full border border-black/40 inline-block shrink-0"
                              style={{ backgroundColor: v.hexCode || "#18181b" }}
                            />
                          ))}
                          <span className="text-[10px] text-zinc-500 font-mono ml-1">
                            +{item.variants.length} cores
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/40 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(item)}
                      className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition cursor-pointer ${
                        item.isActive
                          ? "text-zinc-400 hover:text-amber-400"
                          : "text-emerald-400 hover:text-emerald-300"
                      }`}
                      title={item.isActive ? "Desativar da vitrine" : "Ativar na vitrine"}
                    >
                      <Power size={13} />
                      <span className="text-[11px]">{item.isActive ? "Pausar" : "Ativar"}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition cursor-pointer"
                        title="Editar peça"
                      >
                        <Edit2 size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setItemToDelete(item)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                        title="Excluir peça"
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
                Quando os clientes preencherem o formulário na vitrine pública, os contatos e arquivos aparecerão aqui.
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

      {/* ========================================================================= */}
      {/* MODAL DE CADASTRO SIMPLIFICADO (UPLOAD DIRETO DE FOTO REAL)               */}
      {/* ========================================================================= */}
      {isNewModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsNewModalOpen(false)}
        >
          <div
            className="w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 text-zinc-100 space-y-5 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Sparkles size={16} />
                </div>
                <h3 className="text-sm font-bold text-zinc-100">
                  Cadastrar Nova Peça na Vitrine
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
              {/* Fotos Reais: Frente e Costas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Foto Principal de Capa (Frente) */}
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Foto Principal (Frente) *
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleMainFileUpload(e, false)}
                    className="hidden"
                  />

                  {imageUrl ? (
                    <div className="relative aspect-[3/4] w-full max-w-[200px] rounded-xl overflow-hidden border border-zinc-700 mx-auto">
                      <SafeImage
                        src={imageUrl}
                        alt="Preview Frente"
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
                      className="border-2 border-dashed border-zinc-800 hover:border-zinc-600 rounded-xl p-5 text-center cursor-pointer transition bg-zinc-900/40 flex flex-col items-center justify-center gap-2 min-h-[160px]"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 size={22} className="animate-spin text-amber-400" />
                          <span className="text-xs text-zinc-400 font-mono">
                            Fazendo upload da foto...
                          </span>
                        </>
                      ) : (
                        <>
                          <Upload size={22} className="text-zinc-500" />
                          <div>
                            <p className="text-xs font-semibold text-zinc-300">
                              Subir foto da frente
                            </p>
                            <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">
                              PNG, JPG ou WEBP
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Foto Secundária (Costas / Detalhe) */}
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Foto Secundária (Costas / Detalhe)
                  </label>
                  <input
                    ref={backFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleBackFileUpload(e, false)}
                    className="hidden"
                  />

                  {backImageUrl ? (
                    <div className="relative aspect-[3/4] w-full max-w-[200px] rounded-xl overflow-hidden border border-zinc-700 mx-auto">
                      <SafeImage
                        src={backImageUrl}
                        alt="Preview Costas"
                        className="w-full h-full object-cover"
                        containerClassName="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-500"
                      />
                      <button
                        type="button"
                        onClick={() => setBackImageUrl("")}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/80 text-zinc-300 hover:text-white"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => backFileInputRef.current?.click()}
                      className="border-2 border-dashed border-zinc-800 hover:border-zinc-600 rounded-xl p-5 text-center cursor-pointer transition bg-zinc-900/40 flex flex-col items-center justify-center gap-2 min-h-[160px]"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 size={22} className="animate-spin text-amber-400" />
                          <span className="text-xs text-zinc-400 font-mono">
                            Fazendo upload...
                          </span>
                        </>
                      ) : (
                        <>
                          <Upload size={22} className="text-zinc-500" />
                          <div>
                            <p className="text-xs font-semibold text-zinc-300">
                              Subir foto das costas
                            </p>
                            <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">
                              Opcional
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  )}
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
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Blessed Heavyweight Oversized Tee"
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

              {/* Categoria */}
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
                  placeholder="Ex: Malha 100% algodão 260g/m² com ribana canelada de 3cm e costura ombro a ombro."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Variações de Cores */}
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
                    Nenhuma variação adicionada. A peça usará apenas a foto principal de capa. Clique em "Adicionar Cor" para cadastrar fotos por cor (ex: Preto, Off-White, Bege).
                  </p>
                ) : (
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {variants.map((variant, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex-1">
                          <input
                            type="text"
                            required
                            placeholder="Nome da Cor (ex: Preto Street)"
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

                        <div className="flex items-center gap-2 shrink-0">
                          <input
                            type="color"
                            value={variant.hexCode || "#18181b"}
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
                            placeholder="#18181b"
                            className="w-20 px-2 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-[11px] text-zinc-100 focus:outline-none focus:border-amber-500 uppercase"
                          />
                        </div>

                        <div className="flex flex-col gap-2 w-full pt-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-zinc-400 font-mono">
                              Fotos da cor ({variant.images?.length || (variant.imageUrl ? 1 : 0)})
                            </span>
                            <div className="flex items-center gap-2">
                              <label className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] flex items-center gap-1 cursor-pointer transition">
                                {uploadingVariantIndex === index ? (
                                  <Loader2 size={11} className="animate-spin text-amber-400" />
                                ) : (
                                  <Upload size={11} />
                                )}
                                <span>+ Fotos da Cor</span>
                                <input
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleVariantMultiFileUpload(e.target.files, index, false)}
                                />
                              </label>

                              <button
                                type="button"
                                onClick={() => handleRemoveVariant(index, false)}
                                className="p-1 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                                title="Remover cor"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                            {(variant.images && variant.images.length > 0
                              ? variant.images
                              : (variant.imageUrl ? [variant.imageUrl] : [])
                            ).map((vPhotoUrl, vPhotoIdx) => (
                              <div key={vPhotoUrl + vPhotoIdx} className="relative w-10 h-12 rounded-lg overflow-hidden border border-zinc-700 bg-black shrink-0">
                                <SafeImage src={vPhotoUrl} alt="Foto Cor" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveVariantImage(index, vPhotoIdx, false)}
                                  className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/80 text-zinc-300 hover:text-white"
                                >
                                  <X size={9} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Botões do Rodapé */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending || isUploading}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <span>Cadastrar Produto</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE EDIÇÃO SIMPLIFICADO                                              */}
      {/* ========================================================================= */}
      {editingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setEditingItem(null)}
        >
          <div
            className="w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 text-zinc-100 space-y-5 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Edit2 size={16} />
                </div>
                <h3 className="text-sm font-bold text-zinc-100">
                  Editar Peça "{editingItem.title}"
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

            <form onSubmit={handleEditSave} className="space-y-4">
              {/* Fotos Reais: Frente e Costas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Foto Principal de Capa (Frente) */}
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Foto Principal (Frente) *
                  </label>
                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleMainFileUpload(e, true)}
                    className="hidden"
                  />

                  {editImageUrl ? (
                    <div className="relative aspect-[3/4] w-full max-w-[200px] rounded-xl overflow-hidden border border-zinc-700 mx-auto">
                      <SafeImage
                        src={editImageUrl}
                        alt="Preview Frente"
                        className="w-full h-full object-cover"
                        containerClassName="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-500"
                      />
                      <button
                        type="button"
                        onClick={() => setEditImageUrl("")}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/80 text-zinc-300 hover:text-white"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => editFileInputRef.current?.click()}
                      className="border-2 border-dashed border-zinc-800 hover:border-zinc-600 rounded-xl p-5 text-center cursor-pointer transition bg-zinc-900/40 flex flex-col items-center justify-center gap-2 min-h-[160px]"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 size={22} className="animate-spin text-amber-400" />
                          <span className="text-xs text-zinc-400 font-mono">
                            Fazendo upload...
                          </span>
                        </>
                      ) : (
                        <>
                          <Upload size={22} className="text-zinc-500" />
                          <div>
                            <p className="text-xs font-semibold text-zinc-300">
                              Subir nova foto da frente
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Foto Secundária (Costas / Detalhe) */}
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Foto Secundária (Costas / Detalhe)
                  </label>
                  <input
                    ref={editBackFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleBackFileUpload(e, true)}
                    className="hidden"
                  />

                  {editBackImageUrl ? (
                    <div className="relative aspect-[3/4] w-full max-w-[200px] rounded-xl overflow-hidden border border-zinc-700 mx-auto">
                      <SafeImage
                        src={editBackImageUrl}
                        alt="Preview Costas"
                        className="w-full h-full object-cover"
                        containerClassName="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-500"
                      />
                      <button
                        type="button"
                        onClick={() => setEditBackImageUrl("")}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/80 text-zinc-300 hover:text-white"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => editBackFileInputRef.current?.click()}
                      className="border-2 border-dashed border-zinc-800 hover:border-zinc-600 rounded-xl p-5 text-center cursor-pointer transition bg-zinc-900/40 flex flex-col items-center justify-center gap-2 min-h-[160px]"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 size={22} className="animate-spin text-amber-400" />
                          <span className="text-xs text-zinc-400 font-mono">
                            Fazendo upload...
                          </span>
                        </>
                      ) : (
                        <>
                          <Upload size={22} className="text-zinc-500" />
                          <div>
                            <p className="text-xs font-semibold text-zinc-300">
                              Subir foto das costas
                            </p>
                            <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">
                              Opcional
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  )}
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
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Preço de Venda (R$) *
                  </label>
                  <CurrencyInput
                    value={editPrice}
                    onChange={(val) => setEditPrice(val)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Categoria */}
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
                  Descrição / Detalhes do Tecido
                </label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Variações de Cores */}
              <div className="pt-2 border-t border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Palette size={15} className="text-amber-400" />
                    <span className="text-xs font-bold text-zinc-200">
                      Variações de Cores & Fotos Específicas ({editVariants.length})
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
                    Nenhuma variação adicionada.
                  </p>
                ) : (
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {editVariants.map((variant, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex-1">
                          <input
                            type="text"
                            required
                            placeholder="Nome da Cor"
                            value={variant.colorName}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditVariants((prev) => {
                                const next = [...prev];
                                next[index].colorName = val;
                                return next;
                              });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <input
                            type="color"
                            value={variant.hexCode || "#18181b"}
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
                            className="w-20 px-2 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-[11px] text-zinc-100 focus:outline-none focus:border-amber-500 uppercase"
                          />
                        </div>

                        <div className="flex flex-col gap-2 w-full pt-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-zinc-400 font-mono">
                              Fotos da cor ({variant.images?.length || (variant.imageUrl ? 1 : 0)})
                            </span>
                            <div className="flex items-center gap-2">
                              <label className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] flex items-center gap-1 cursor-pointer transition">
                                {uploadingVariantIndex === index ? (
                                  <Loader2 size={11} className="animate-spin text-amber-400" />
                                ) : (
                                  <Upload size={11} />
                                )}
                                <span>+ Fotos da Cor</span>
                                <input
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleVariantMultiFileUpload(e.target.files, index, true)}
                                />
                              </label>

                              <button
                                type="button"
                                onClick={() => handleRemoveVariant(index, true)}
                                className="p-1 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                                title="Remover cor"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                            {(variant.images && variant.images.length > 0
                              ? variant.images
                              : (variant.imageUrl ? [variant.imageUrl] : [])
                            ).map((vPhotoUrl, vPhotoIdx) => (
                              <div key={vPhotoUrl + vPhotoIdx} className="relative w-10 h-12 rounded-lg overflow-hidden border border-zinc-700 bg-black shrink-0">
                                <SafeImage src={vPhotoUrl} alt="Foto Cor" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveVariantImage(index, vPhotoIdx, true)}
                                  className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/80 text-zinc-300 hover:text-white"
                                >
                                  <X size={9} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Botões do Rodapé */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending || isUploading}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <span>Salvar Alterações</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO                                          */}
      {/* ========================================================================= */}
      {itemToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setItemToDelete(null)}
        >
          <div
            className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-zinc-100 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-zinc-100">
                  Excluir Peça da Vitrine
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Esta ação não pode ser desfeita.
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Tem certeza que deseja remover <strong>"{itemToDelete.title}"</strong> e todas as suas variações de cor da vitrine pública?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <span>Confirmar Exclusão</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
