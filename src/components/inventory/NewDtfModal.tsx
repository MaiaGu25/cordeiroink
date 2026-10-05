"use client";

import { useState, useTransition } from "react";
import { X, Plus, Image as ImageIcon, Loader2 } from "lucide-react";
import { createDtfArtItem } from "@/actions/inventory";
import { toast } from "sonner";

interface NewDtfModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export function NewDtfModal({ isOpen, onClose, onCreated }: NewDtfModalProps) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [dtfCode, setDtfCode] = useState("");
  const [dtfPrintSize, setDtfPrintSize] = useState("A3 (30x42cm)");
  const [dtfPreviewUrl, setDtfPreviewUrl] = useState("");
  const [dtfSupplier, setDtfSupplier] = useState("Birô DTF Express");
  const [stockQuantity, setStockQuantity] = useState(0);
  const [minStock, setMinStock] = useState(5);
  const [costPrice, setCostPrice] = useState(13.90);

  if (!isOpen) return null;

  const handleSizeChange = (size: string) => {
    setDtfPrintSize(size);
    if (size === "A3 (30x42cm)") setCostPrice(13.90);
    else if (size === "A4 (21x30cm)") setCostPrice(9.50);
    else if (size === "Bolso (10x10cm)") setCostPrice(4.50);
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
          name,
          dtfCode: dtfCode || undefined,
          dtfPrintSize,
          dtfPreviewUrl: dtfPreviewUrl || undefined,
          dtfSupplier,
          stockQuantity: Number(stockQuantity),
          minStock: Number(minStock),
          costPrice: Number(costPrice),
        });

        toast.success("Arte adicionada ao acervo do Banco de Estampas!");
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
        className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ImageIcon size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">
                Nova Arte / Folha no Banco de Estampas
              </h3>
              <p className="text-xs text-zinc-500">
                Acervo de estampas DTF para reuso ou controle de folhas prontas.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-zinc-400 mb-1">Nome / Descrição da Arte *</label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Caveira Samurai Cyberpunk"
              className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-400 mb-1">Código da Arte</label>
              <input
                type="text"
                value={dtfCode}
                onChange={(e) => setDtfCode(e.target.value)}
                placeholder="ex: ART-SAMURAI-01"
                className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Tamanho da Impressão</label>
              <select
                value={dtfPrintSize}
                onChange={(e) => handleSizeChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-zinc-700"
              >
                <option value="A3 (30x42cm)">A3 (30x42cm)</option>
                <option value="A4 (21x30cm)">A4 (21x30cm)</option>
                <option value="Bolso (10x10cm)">Bolso (10x10cm)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Link do Mockup / Preview da Imagem</label>
            <input
              type="url"
              value={dtfPreviewUrl}
              onChange={(e) => setDtfPreviewUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 font-mono text-[11px]"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-zinc-400 mb-1">Custo Folha (R$)</label>
              <input
                type="number"
                step="0.10"
                value={costPrice}
                onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 font-mono text-center focus:outline-none focus:border-zinc-700"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Folhas em Estoque</label>
              <input
                type="number"
                min={0}
                value={stockQuantity}
                onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 font-mono text-center focus:outline-none focus:border-zinc-700"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Estoque Mínimo</label>
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
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold transition shadow-sm flex items-center gap-2 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Salvando...
                </>
              ) : (
                <>Adicionar ao Acervo</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
