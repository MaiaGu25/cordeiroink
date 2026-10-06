"use client";

import { Package, Gift, Tag, Edit3, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface SupplyItem {
  id: string;
  sku: string;
  name: string;
  type: string;
  stockQuantity: number;
  minStock: number;
  costPrice: number;
}

interface PackagingListProps {
  items: SupplyItem[];
  onAdjust: (item: SupplyItem) => void;
  onAddNew?: () => void;
}

export function PackagingList({ items, onAdjust, onAddNew }: PackagingListProps) {
  if (items.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl bg-zinc-900/40 border border-dashed border-zinc-800/80 flex flex-col items-center justify-center gap-3">
        <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400">
          <Package size={26} />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-zinc-200">
            Nenhum item cadastrado ainda. Clique no botão acima para adicionar.
          </h4>
          <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
            Cadastre os insumos de embalagem (sacos zip lock, tags kraft, adesivos e brindes) para compor o custo de expedição dos pedidos.
          </p>
        </div>
        {onAddNew && (
          <button
            onClick={onAddNew}
            className="mt-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition shadow-sm cursor-pointer"
          >
            + Cadastrar Embalagem / Insumo
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => {
        const isCritical = item.stockQuantity <= item.minStock;

        return (
          <div
            key={item.id}
            onClick={() => onAdjust(item)}
            className={`p-5 rounded-2xl bg-zinc-900/40 border transition-all duration-200 ease-out flex flex-col justify-between cursor-pointer hover:border-zinc-700/80 hover:shadow-lg hover:shadow-black/30 group ${
              isCritical
                ? "border-red-500/30"
                : "border-zinc-800/60"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-zinc-200 group-hover:text-amber-400 transition-colors">
                  {item.name}
                </span>
                <span className="font-mono text-[10px] text-zinc-500">
                  {item.sku}
                </span>
              </div>

              <div className="flex items-baseline justify-between p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60 my-3">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">
                    Saldo
                  </span>
                  <span
                    className={`text-2xl font-bold font-mono ${
                      isCritical ? "text-red-400" : "text-zinc-100"
                    }`}
                  >
                    {item.stockQuantity} un
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">
                    Custo Unit.
                  </span>
                  <span className="text-xs font-mono font-medium text-zinc-300">
                    {formatCurrency(item.costPrice)}
                  </span>
                </div>
              </div>

              {isCritical && (
                <div className="flex items-center gap-1.5 text-[11px] text-red-400 font-medium mb-1">
                  <AlertTriangle size={12} />
                  <span>Abaixo da margem de segurança ({item.minStock} un)</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500">
              <span className="text-[10px] font-mono">Mínimo: {item.minStock} un</span>
              <span className="text-[11px] text-zinc-400 group-hover:text-zinc-200 flex items-center gap-1">
                <Edit3 size={12} />
                <span>Ajustar</span>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
