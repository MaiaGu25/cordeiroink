"use client";

import { useState, useTransition, useRef } from "react";
import { X, Plus, Image as ImageIcon, Loader2, Upload, Check, AlertCircle, Trash2 } from "lucide-react";
import { createDtfArtItem } from "@/actions/inventory";
import { toast } from "sonner";

interface NewDtfModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
  suppliers?: { id: string; name: string }[];
}

export function NewDtfModal({ isOpen, onClose, onCreated, suppliers = [] }: NewDtfModalProps) {
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [dtfCode, setDtfCode] = useState("");
  const [dtfPrintSize, setDtfPrintSize] = useState("A3 (30x42cm)");
  const [dtfPreviewUrl, setDtfPreviewUrl] = useState("");
  const [dtfSupplier, setDtfSupplier] = useState("");
  const [stockQuantity, setStockQuantity] = useState(0);
  const [minStock, setMinStock] = useState(5);
  const [costPrice, setCostPrice] = useState(13.90);

  if (!isOpen) return null;

  const handleSizeChange = (size: string) => {
    setDtfPrintSize(size);
    if (size.includes("A3")) setCostPrice(13.90);
    else if (size.includes("A4")) setCostPrice(9.50);
    else if (size.includes("Bolso")) setCostPrice(4.50);
    else if (size.includes("Faixa")) setCostPrice(8.50);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione um arquivo de imagem (PNG, JPG, WEBP, SVG).");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro no upload");
      }

      setDtfPreviewUrl(data.url);
      if (!name) {
        // Sugere o nome do arquivo limpo como nome da arte
        const cleanName = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[-_]/g, " ")
          .trim();
        setName(cleanName);
      }
      toast.success("Imagem da estampa carregada com sucesso!");
    } catch (err: any) {
      toast.error("Falha no upload da imagem: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearImage = () => {
    setDtfPreviewUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Informe o nome da arte ou estampa.");
      return;
    }

    startTransition(async () => {
      try {
        await createDtfArtItem({
          name: name.trim(),
          dtfCode: dtfCode.trim() || undefined,
          dtfPrintSize,
          dtfPreviewUrl: dtfPreviewUrl.trim() || undefined,
          dtfSupplier: dtfSupplier.trim() || undefined,
          stockQuantity: Number(stockQuantity) || 0,
          minStock: Number(minStock) || 5,
          costPrice: Number(costPrice) || 0,
        });

        toast.success("Estampa adicionada ao acervo do Banco de Estampas!");
        if (onCreated) onCreated();
        onClose();
      } catch (err: any) {
        toast.error("Erro ao cadastrar arte: " + err.message);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ImageIcon size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">
                + Nova Estampa / DTF
              </h3>
              <p className="text-xs text-zinc-500">
                Upload de artes para o acervo e controle de folhas DTF prontas.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Upload de Imagem Real */}
          <div>
            <label className="block text-zinc-400 mb-1.5 font-medium">
              Imagem / Mockup da Arte
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
            />

            {dtfPreviewUrl ? (
              <div className="relative group rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/60 p-2 flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-zinc-950 shrink-0 border border-zinc-800">
                  <img
                    src={dtfPreviewUrl}
                    alt="Preview da estampa"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 mb-1">
                    <Check size={12} />
                    Imagem carregada com sucesso
                  </span>
                  <span className="text-[11px] text-zinc-400 font-mono truncate block">
                    {dtfPreviewUrl}
                  </span>
                  <button
                    type="button"
                    onClick={handleClearImage}
                    className="mt-2 text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer transition"
                  >
                    <Trash2 size={11} />
                    Remover e trocar imagem
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 rounded-2xl border-2 border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 hover:bg-zinc-900/70 transition flex flex-col items-center justify-center gap-2 cursor-pointer text-center ${
                  isUploading ? "opacity-60 pointer-events-none" : ""
                }`}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2 py-2">
                    <Loader2 size={24} className="animate-spin text-amber-400" />
                    <span className="text-xs text-zinc-300">Enviando imagem para public/uploads/estampas...</span>
                  </div>
                ) : (
                  <>
                    <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 group-hover:text-amber-400">
                      <Upload size={20} />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-zinc-200 block">
                        Clique para enviar o arquivo da estampa
                      </span>
                      <span className="text-[11px] text-zinc-500 mt-0.5 block">
                        PNG, JPG, WEBP ou SVG (salvo em alta resolução)
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Nome da Arte / Código */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Nome da Arte / Estampa *</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex: Dragão Oriental Cyberpunk"
                className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Código da Arte (Opcional)</label>
              <input
                type="text"
                value={dtfCode}
                onChange={(e) => setDtfCode(e.target.value)}
                placeholder="ex: ART-DRAGON-01"
                className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 font-mono text-[11px]"
              />
            </div>
          </div>

          {/* Tamanho da Impressão & Fornecedor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Tamanho da Impressão</label>
              <select
                value={dtfPrintSize}
                onChange={(e) => handleSizeChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-zinc-700"
              >
                <option value="A3 (30x42cm)">A3 (30x42cm) — Estampa Grande</option>
                <option value="A4 (21x30cm)">A4 (21x30cm) — Estampa Média</option>
                <option value="Bolso (10x10cm)">Bolso (10x10cm) — Logo Peito</option>
                <option value="Faixa (15x42cm)">Faixa (15x42cm) — Estampa Alongada</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Fornecedor / Birô</label>
              <input
                type="text"
                value={dtfSupplier}
                onChange={(e) => setDtfSupplier(e.target.value)}
                placeholder="ex: Birô DTF Express ou próprio"
                list="suppliers-dtf-list"
                className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
              />
              <datalist id="suppliers-dtf-list">
                {suppliers.map((s) => (
                  <option key={s.id} value={s.name} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Custos e Saldo */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Custo por Folha (R$)</label>
              <input
                type="number"
                step="0.10"
                min={0}
                value={costPrice}
                onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 font-mono text-center focus:outline-none focus:border-zinc-700"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Folhas em Estoque</label>
              <input
                type="number"
                min={0}
                value={stockQuantity}
                onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 font-mono text-center focus:outline-none focus:border-zinc-700"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Estoque Mínimo</label>
              <input
                type="number"
                min={1}
                value={minStock}
                onChange={(e) => setMinStock(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 font-mono text-center focus:outline-none focus:border-zinc-700"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending || isUploading}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold transition shadow-sm flex items-center gap-2 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Salvando Arte...
                </>
              ) : (
                <>
                  <Plus size={14} />
                  Salvar Estampa
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
