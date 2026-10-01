"use client";

import { useState, useTransition } from "react";
import { X, Package, Loader2 } from "lucide-react";
import { adjustStock } from "@/actions/inventory";
import { toast } from "sonner";

interface QuickStockModalProps {
  item: any | null;
  onClose: () => void;
  onStockUpdated?: () => void;
}

export function QuickStockModal({
  item,
  onClose,
  onStockUpdated,
}: QuickStockModalProps) {
  const [isPending, startTransition] = useTransition();
  const [newQuantity, setNewQuantity] = useState<number>(
    item ? item.stockQuantity : 0
  );
  const [reason, setReason] = useState<string>("Contagem física de inventário");

  if (!item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        await adjustStock(item.id, Number(newQuantity), reason);
        toast.success(`Estoque de "${item.name}" atualizado para ${newQuantity} unidades!`);
        if (onStockUpdated) onStockUpdated();
        onClose();
      } catch (err: any) {
        toast.error("Erro ao ajustar estoque: " + err.message);
      }
    });
  };

  const diff = Number(newQuantity) - item.stockQuantity;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Package size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">
                Ajuste de Estoque de Insumo
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">
                {item.sku}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <span className="text-xs text-zinc-400 block mb-1">Insumo:</span>
            <span className="text-sm font-semibold text-zinc-100 block">
              {item.name}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 flex justify-between items-center text-xs">
            <span className="text-zinc-400">Estoque Atual em Sistema:</span>
            <span className="font-mono font-bold text-zinc-200">
              {item.stockQuantity} un
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Nova Quantidade Real Contada *
            </label>
            <div className="flex items-center gap-3">
              <input
                required
                type="number"
                min={0}
                value={newQuantity}
                onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-sm font-mono text-zinc-100 focus:outline-none focus:border-amber-500"
              />
              <span
                className={`text-xs font-mono font-semibold shrink-0 px-2 py-1 rounded ${
                  diff > 0
                    ? "text-emerald-400 bg-emerald-500/10"
                    : diff < 0
                    ? "text-red-400 bg-red-500/10"
                    : "text-zinc-500"
                }`}
              >
                {diff > 0 ? `+${diff}` : diff} un
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Motivo do Ajuste / Auditoria *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
            >
              <option value="Contagem física de inventário">
                Contagem física de inventário (Balanço)
              </option>
              <option value="Entrada de mercadoria não faturada">
                Entrada manual de insumos
              </option>
              <option value="Perda por teste térmico ou defeito">
                Perda em prensa térmica / defeito de tecido
              </option>
              <option value="Ajuste de margem de segurança">
                Ajuste de margem de segurança
              </option>
            </select>
          </div>

          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Salvando Ajuste...
                </>
              ) : (
                <>Confirmar Ajuste</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
