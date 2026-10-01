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
}

export function PackagingList({ items, onAdjust }: PackagingListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => {
        const isCritical = item.stockQuantity <= item.minStock;

        const Icon =
          item.type === "GIFT" ? Gift : item.type === "LABEL" ? Tag : Package;

        return (
          <div
            key={item.id}
            className={`p-4 rounded-xl bg-zinc-900/80 border transition-all flex flex-col justify-between ${
              isCritical
                ? "border-red-500/40 bg-zinc-900/90 shadow-sm"
                : "border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-zinc-800 text-amber-400 border border-zinc-700">
                    <Icon size={14} />
                  </div>
                  <span className="text-xs font-bold text-zinc-100">
                    {item.name}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-zinc-500">
                  {item.sku}
                </span>
              </div>

              <div className="flex items-baseline justify-between p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80 my-3">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block font-medium">
                    Saldo em Estoque
                  </span>
                  <span
                    className={`text-xl font-bold font-mono ${
                      isCritical ? "text-red-400" : "text-zinc-100"
                    }`}
                  >
                    {item.stockQuantity} un
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 uppercase block font-medium">
                    Custo Unit.
                  </span>
                  <span className="text-xs font-mono font-semibold text-zinc-300">
                    {formatCurrency(item.costPrice)}
                  </span>
                </div>
              </div>

              {isCritical && (
                <div className="flex items-center gap-1.5 text-[11px] text-red-400 mb-2 font-medium">
                  <AlertTriangle size={13} />
                  <span>Abaixo do mínimo ({item.minStock} un)</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
              <span className="text-[10px] text-zinc-500 font-mono">
                Mínimo: {item.minStock} un
              </span>
              <button
                onClick={() => onAdjust(item)}
                className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-amber-400 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
              >
                <Edit3 size={12} />
                <span>Ajustar Saldo</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
