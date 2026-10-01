"use client";

import { Edit3, AlertTriangle, Layers, Image as ImageIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface DtfItem {
  id: string;
  sku: string;
  name: string;
  dtfCode: string | null;
  dtfPreviewUrl: string | null;
  dtfPrintSize: string | null;
  dtfSupplier: string | null;
  stockQuantity: number;
  minStock: number;
  costPrice: number;
}

interface DtfCatalogGridProps {
  items: DtfItem[];
  onAdjust: (item: DtfItem) => void;
}

export function DtfCatalogGrid({ items, onAdjust }: DtfCatalogGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {items.map((item) => {
        const isCritical = item.stockQuantity <= item.minStock;

        return (
          <div
            key={item.id}
            className={`rounded-2xl bg-zinc-900/80 border overflow-hidden transition-all flex flex-col justify-between ${
              isCritical
                ? "border-red-500/40 bg-zinc-900/90 shadow-sm"
                : "border-zinc-800 hover:border-zinc-700"
            }`}
          >
            {/* Visual Preview */}
            <div className="relative h-44 w-full bg-zinc-950 overflow-hidden group">
              {item.dtfPreviewUrl ? (
                <img
                  src={item.dtfPreviewUrl}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600">
                  <ImageIcon size={28} />
                  <span className="text-[10px] mt-1 font-mono">Sem Mockup</span>
                </div>
              )}

              {/* Overlay Badges */}
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-zinc-950/80 backdrop-blur-md text-[10px] font-mono font-bold text-amber-400 border border-zinc-700">
                  {item.dtfCode || item.sku}
                </span>
              </div>

              {item.dtfPrintSize && (
                <div className="absolute bottom-2.5 right-2.5">
                  <span className="px-2 py-0.5 rounded-md bg-zinc-950/80 backdrop-blur-md text-[10px] font-mono text-zinc-300 border border-zinc-700">
                    {item.dtfPrintSize}
                  </span>
                </div>
              )}
            </div>

            {/* Content Details */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-zinc-100 truncate mb-1" title={item.name}>
                  {item.name}
                </h4>
                <div className="text-[10px] text-zinc-500 mb-3">
                  Fornecedor: {item.dtfSupplier || "DTF Master Print SP"}
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800 mb-2">
                  <div>
                    <span className="text-[9px] uppercase font-semibold text-zinc-500 block">
                      Saldo Disponível
                    </span>
                    <span
                      className={`text-lg font-bold font-mono ${
                        isCritical ? "text-red-400" : "text-zinc-100"
                      }`}
                    >
                      {item.stockQuantity} un
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] uppercase font-semibold text-zinc-500 block">
                      Custo Impressão
                    </span>
                    <span className="text-xs font-mono font-semibold text-zinc-300">
                      {formatCurrency(item.costPrice)}
                    </span>
                  </div>
                </div>

                {isCritical && (
                  <div className="flex items-center gap-1 text-[11px] text-red-400 font-medium mb-2">
                    <AlertTriangle size={12} />
                    <span>Estoque crítico (mín: {item.minStock} un)</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between mt-2">
                <span className="text-[10px] text-zinc-500 font-mono">
                  Mín: {item.minStock} un
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
          </div>
        );
      })}
    </div>
  );
}
