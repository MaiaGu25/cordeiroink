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
  onAddNew?: () => void;
}

export function DtfCatalogGrid({ items, onAdjust, onAddNew }: DtfCatalogGridProps) {
  if (items.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl bg-zinc-900/40 border border-dashed border-zinc-800/80 flex flex-col items-center justify-center gap-3">
        <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400">
          <ImageIcon size={26} />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-zinc-200">
            Nenhum item cadastrado ainda. Clique no botão acima para adicionar.
          </h4>
          <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
            Cadastre as estampas DTF e artes enviadas para controle de saldo de folhas e vinculação às peças sob encomenda.
          </p>
        </div>
        {onAddNew && (
          <button
            onClick={onAddNew}
            className="mt-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition shadow-sm cursor-pointer"
          >
            + Nova Estampa / DTF
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {items.map((item) => {
        const isCritical = item.stockQuantity <= item.minStock;

        return (
          <div
            key={item.id}
            onClick={() => onAdjust(item)}
            className="group relative rounded-2xl bg-zinc-900/40 border border-zinc-800/60 hover:border-zinc-700/80 overflow-hidden cursor-pointer transition-all duration-300 ease-out shadow-sm hover:shadow-xl hover:shadow-black/50 flex flex-col"
          >
            {/* Clean Visual Image Container with Smooth Hover Zoom */}
            <div className="relative h-64 w-full bg-zinc-950 overflow-hidden flex items-center justify-center">
              {item.dtfPreviewUrl ? (
                <img
                  src={item.dtfPreviewUrl}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                  onError={(e) => {
                    // Fallback se a imagem quebrar
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600">
                  <ImageIcon size={32} />
                  <span className="text-[10px] mt-1 font-mono">Sem Imagem</span>
                </div>
              )}

              {/* Minimal Top Header Badge */}
              <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
                <span className="px-2 py-0.5 rounded-lg bg-zinc-950/80 backdrop-blur-md text-[10px] font-mono font-bold text-zinc-200 border border-zinc-800">
                  {item.dtfCode || item.sku}
                </span>
                {isCritical && (
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                )}
              </div>

              {/* Progressive Disclosure: Dark Overlay revealed on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/85 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-out flex flex-col justify-end p-4 z-10">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-zinc-400">Tamanho Estampa:</span>
                    <span className="text-zinc-100 font-semibold px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                      {item.dtfPrintSize || "A3 (30x42cm)"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-400">Fornecedor:</span>
                    <span className="text-zinc-200 font-medium truncate max-w-[130px]">
                      {item.dtfSupplier || "DTF Master Print"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-zinc-400">Custo Impressão:</span>
                    <span className="text-zinc-200">
                      {formatCurrency(item.costPrice)}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-mono text-zinc-500 block">
                        Saldo Disponível
                      </span>
                      <span
                        className={`text-lg font-bold font-mono ${
                          isCritical ? "text-red-400" : "text-zinc-100"
                        }`}
                      >
                        {item.stockQuantity} folhas
                      </span>
                    </div>

                    <span className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition-colors">
                      <Edit3 size={13} />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quiet Footer (Always Visible) */}
            <div className="p-3.5 bg-zinc-950/60 border-t border-zinc-800/60 flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-200 truncate pr-2" title={item.name}>
                {item.name}
              </span>
              <span className="font-mono text-xs font-semibold text-zinc-400 shrink-0">
                {item.stockQuantity} un
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
