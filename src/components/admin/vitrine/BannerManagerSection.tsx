"use client";

import { useState, useTransition, useRef } from "react";
import {
  Plus,
  Image as ImageIcon,
  Trash2,
  Edit2,
  Power,
  Upload,
  Loader2,
  X,
  ExternalLink,
  ArrowUpDown,
  Sparkles,
} from "lucide-react";
import {
  createStorefrontBanner,
  updateStorefrontBanner,
  deleteStorefrontBanner,
  toggleStorefrontBannerActive,
  uploadStorefrontFile,
} from "@/actions/storefront";
import { SafeImage } from "@/components/ui/SafeImage";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export interface BannerItem {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  orderIndex: number;
  isActive: boolean;
}

interface BannerManagerSectionProps {
  initialBanners: BannerItem[];
}

export function BannerManagerSection({ initialBanners = [] }: BannerManagerSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [orderIndex, setOrderIndex] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [bannerToDelete, setBannerToDelete] = useState<BannerItem | null>(null);

  const handleOpenNew = () => {
    setEditingBanner(null);
    setTitle("");
    setSubtitle("");
    setImageUrl("");
    setLinkUrl("#catalogo");
    setOrderIndex(initialBanners.length);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: BannerItem) => {
    setEditingBanner(b);
    setTitle(b.title);
    setSubtitle(b.subtitle || "");
    setImageUrl(b.imageUrl);
    setLinkUrl(b.linkUrl || "");
    setOrderIndex(b.orderIndex);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "banners");

    try {
      const res = await uploadStorefrontFile(formData);
      if (res.success && res.url) {
        setImageUrl(res.url);
        toast.success("Imagem do banner carregada!");
      } else {
        toast.error(res.error || "Erro no upload");
      }
    } catch (err: any) {
      toast.error("Erro no upload: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Informe o título do banner.");
      return;
    }

    if (!imageUrl.trim()) {
      toast.error("Faça o upload ou informe a imagem do banner.");
      return;
    }

    startTransition(async () => {
      try {
        let res: any;
        if (editingBanner) {
          res = await updateStorefrontBanner(editingBanner.id, {
            title: title.trim(),
            subtitle: subtitle.trim() || undefined,
            imageUrl: imageUrl.trim(),
            linkUrl: linkUrl.trim() || undefined,
            orderIndex: Number(orderIndex) || 0,
          });
        } else {
          res = await createStorefrontBanner({
            title: title.trim(),
            subtitle: subtitle.trim() || undefined,
            imageUrl: imageUrl.trim(),
            linkUrl: linkUrl.trim() || undefined,
            orderIndex: Number(orderIndex) || 0,
          });
        }

        if (res && typeof res === "object" && "success" in res && !res.success) {
          toast.error(String(res.error || "Erro ao salvar banner"));
          return;
        }

        toast.success(editingBanner ? "Banner atualizado com sucesso!" : "Banner criado com sucesso!");
        setIsModalOpen(false);
        router.refresh();
      } catch (err: any) {
        toast.error("Erro ao salvar banner: " + (err?.message || String(err)));
      }
    });
  };

  const handleToggleActive = (banner: BannerItem) => {
    startTransition(async () => {
      try {
        const res: any = await toggleStorefrontBannerActive(banner.id, !banner.isActive);
        if (res && typeof res === "object" && "success" in res && !res.success) {
          toast.error(String(res.error || "Erro ao alterar visibilidade"));
          return;
        }
        toast.success(`Banner ${!banner.isActive ? "ativado" : "desativado"} com sucesso!`);
        router.refresh();
      } catch (err: any) {
        toast.error("Erro ao alterar visibilidade: " + (err?.message || String(err)));
      }
    });
  };

  const handleDelete = () => {
    if (!bannerToDelete) return;
    startTransition(async () => {
      try {
        const res: any = await deleteStorefrontBanner(bannerToDelete.id);
        if (res && typeof res === "object" && "success" in res && !res.success) {
          toast.error(String(res.error || "Erro ao excluir"));
          return;
        }
        toast.success("Banner excluído com sucesso!");
        setBannerToDelete(null);
        router.refresh();
      } catch (err: any) {
        toast.error("Erro ao excluir banner: " + (err?.message || String(err)));
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with New Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
        <div>
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <ImageIcon size={16} className="text-amber-400" />
            <span>Carrossel de Banners do Topo da Vitrine</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Cadastre slides rotativos com imagens em alta resolução, textos de evangelização e links de redirecionamento.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>+ Novo Banner</span>
        </button>
      </div>

      {/* Banner Grid List */}
      {initialBanners.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-zinc-900/30 border border-dashed border-zinc-800/80 flex flex-col items-center justify-center gap-3">
          <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400">
            <ImageIcon size={28} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-200">
              Nenhum banner personalizado cadastrado
            </h4>
            <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
              Atualmente a vitrine está a exibir os banners padrão de Christian Streetwear. Cadastre seus próprios banners para anunciar novas coleções ou conferências.
            </p>
          </div>
          <button
            onClick={handleOpenNew}
            className="mt-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition shadow-sm cursor-pointer"
          >
            + Cadastrar Primeiro Banner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {initialBanners.map((banner) => (
            <div
              key={banner.id}
              className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-all duration-200 ${
                banner.isActive
                  ? "bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700"
                  : "bg-zinc-950/40 border-zinc-850 opacity-60"
              }`}
            >
              {/* Image Preview */}
              <div className="relative aspect-[16/9] w-full bg-zinc-950 overflow-hidden border-b border-zinc-800/60">
                <SafeImage
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                  containerClassName="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-600"
                  iconSize={24}
                />
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-black/70 backdrop-blur-md text-zinc-200 border border-white/10">
                    Posição #{banner.orderIndex + 1}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border backdrop-blur-md ${
                      banner.isActive
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : "bg-zinc-800/80 text-zinc-400 border-zinc-700"
                    }`}
                  >
                    {banner.isActive ? "Ativo no Carrossel" : "Inativo"}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <h4 className="font-bold text-zinc-100 text-sm line-clamp-1">
                    {banner.title}
                  </h4>
                  {banner.subtitle && (
                    <p className="text-xs text-zinc-400 line-clamp-2">
                      {banner.subtitle}
                    </p>
                  )}
                  {banner.linkUrl && (
                    <span className="text-[11px] font-mono text-amber-400/90 truncate block pt-1">
                      Link: {banner.linkUrl}
                    </span>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleToggleActive(banner)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                      banner.isActive
                        ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                    }`}
                  >
                    <Power size={11} />
                    <span>{banner.isActive ? "Desativar" : "Ativar"}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(banner)}
                      className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-amber-400 transition cursor-pointer"
                      title="Editar Banner"
                    >
                      <Edit2 size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setBannerToDelete(banner)}
                      className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-red-950/40 text-zinc-400 hover:text-red-400 transition cursor-pointer"
                      title="Excluir Banner"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Criar / Editar Banner */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => {
            if (!isPending && !isUploading) setIsModalOpen(false);
          }}
        >
          <div
            className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 text-zinc-100 space-y-5"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <ImageIcon size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">
                    {editingBanner ? "Editar Banner" : "Cadastrar Novo Banner"}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Configure os dados de exibição na vitrine inicial.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Título Principal do Slide *
                </label>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ex: Vista um propósito."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">
                  Subtítulo / Mensagem (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="ex: Uma marca cristã que acredita no poder de evangelizar e inspirar..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">
                    Link de Redirecionamento
                  </label>
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="#catalogo ou #personalizadas"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">
                    Ordem de Exibição
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={orderIndex}
                    onChange={(e) => setOrderIndex(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>
              </div>

              {/* Upload de Imagem */}
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Foto do Banner (Upload ou Link Direto) *
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {imageUrl ? (
                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <SafeImage
                        src={imageUrl}
                        alt="Preview"
                        className="w-16 h-10 object-cover rounded-lg border border-zinc-700 shrink-0"
                        containerClassName="w-16 h-10 rounded-lg bg-zinc-950 flex items-center justify-center text-zinc-500 shrink-0"
                        iconSize={16}
                      />
                      <span className="text-zinc-300 font-mono text-[11px] truncate">
                        {imageUrl}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="p-1 text-zinc-500 hover:text-red-400 transition"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-4 rounded-xl border border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 transition flex items-center justify-center gap-2.5 cursor-pointer ${
                      isUploading ? "opacity-60 pointer-events-none" : ""
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 size={16} className="animate-spin text-amber-400" />
                        <span className="text-zinc-400">Enviando imagem para o storage...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={16} className="text-zinc-400" />
                        <span className="text-zinc-300">
                          Clique para fazer upload da foto do banner
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition cursor-pointer text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending || isUploading}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  {isPending ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <span>{editingBanner ? "Salvar Alterações" : "Criar Banner"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {bannerToDelete && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setBannerToDelete(null)}
        >
          <div
            className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-5 text-zinc-100 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-bold text-zinc-100">
              Excluir Banner?
            </h3>
            <p className="text-xs text-zinc-400">
              Tem certeza que deseja remover o banner &ldquo;{bannerToDelete.title}&rdquo;? Esta ação removerá o slide da vitrine.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBannerToDelete(null)}
                className="px-3.5 py-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-zinc-200 text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleDelete}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
              >
                {isPending ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
