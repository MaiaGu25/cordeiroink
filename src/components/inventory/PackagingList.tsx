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
