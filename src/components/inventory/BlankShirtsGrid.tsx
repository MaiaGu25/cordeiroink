"use client";

import { Shirt, AlertTriangle, Edit3, ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/HoverCard";

interface BlankShirtItem {
  id: string;
  sku: string;
  name: string;
  shirtModel: string | null;
  shirtColor: string | null;
  shirtSize: string | null;
  stockQuantity: number;
  minStock: number;
  costPrice: number;
}

interface BlankShirtsGridProps {
  items: BlankShirtItem[];
  onAdjust: (item: BlankShirtItem) => void;
  onAddNew?: () => void;
}

export function BlankShirtsGrid({ items, onAdjust, onAddNew }: BlankShirtsGridProps) {
  if (items.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl bg-zinc-900/40 border border-dashed border-zinc-800/80 flex flex-col items-center justify-center gap-3">
        <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400">
          <Shirt size={26} />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-zinc-200">
            Nenhum item cadastrado ainda. Clique no botão acima para adicionar.
          </h4>
          <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
            Cadastre seus modelos de camiseta (ex: Tradicional 30.1, Oversized), cores e tamanhos para controlar seu estoque real.
          </p>
        </div>
        {onAddNew && (
          <button
            onClick={onAddNew}
            className="mt-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition shadow-sm cursor-pointer"
          >
            + Cadastrar Camiseta Lisa
          </button>
        )}
      </div>
    );
  }

  // Agrupar por Modelo + Cor
  const groups: Record<
    string,
    { model: string; color: string; sizes: Record<string, BlankShirtItem> }
  > = {};

  items.forEach((item) => {
    const key = `${item.shirtModel || "Camiseta Oversized 26.1"}__${item.shirtColor || "Preto"}`;
    if (!groups[key]) {
      groups[key] = {
        model: item.shirtModel || "Camiseta Streetwear Oversized 26.1",
        color: item.shirtColor || "Preto",
        sizes: {},
      };
    }
    const size = item.shirtSize || "M";
    groups[key].sizes[size] = item;
  });

  const SIZES_ORDER = ["P", "M", "G", "GG", "XG"];

  return (
    <div className="space-y-4">
      {Object.entries(groups).map(([key, group]) => {
        return (
          <div
            key={key}
            className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 backdrop-blur-sm shadow-sm space-y-4"
          >
            {/* Header: Color & Model */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className="w-3.5 h-3.5 rounded-full border border-zinc-700 shadow-inner"
                  style={{
                    backgroundColor:
                      group.color === "Preto"
                        ? "#18181b"
                        : group.color === "Off-White"
                        ? "#f5f5f4"
                        : group.color === "Marrom Cacau"
                        ? "#78350f"
                        : "#52525b",
                  }}
                />
                <div>
                  <h4 className="text-sm font-semibold text-zinc-100">
                    {group.color}
                  </h4>
                  <span className="text-xs text-zinc-500">
                    {group.model}
                  </span>
                </div>
              </div>

              <span className="text-xs text-zinc-500 font-mono">
                Grade Cor x Tamanho
              </span>
            </div>

            {/* Matrix of Sizes: Minimal Numbers with HoverCards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {SIZES_ORDER.map((sizeKey) => {
                const item = group.sizes[sizeKey];

                if (!item) {
                  return (
                    <div
                      key={sizeKey}
                      className="p-3.5 rounded-xl bg-zinc-950/30 border border-zinc-850 border-dashed text-center opacity-40"
                    >
                      <span className="text-xs font-mono text-zinc-600 block mb-1">
                        {sizeKey}
                      </span>
                      <span className="text-xs font-mono text-zinc-700">—</span>
                    </div>
                  );
                }

                const isCritical = item.stockQuantity <= item.minStock;

                return (
                  <HoverCard key={item.id} openDelay={150} closeDelay={150}>
                    <HoverCardTrigger asChild>
                      <button
                        type="button"
                        onClick={() => onAdjust(item)}
                        className={`p-3.5 rounded-xl border transition-all duration-200 ease-out text-center cursor-pointer group flex flex-col justify-between ${
                          isCritical
                            ? "bg-red-500/5 border-red-500/30 hover:border-red-500/50"
                            : "bg-zinc-950/60 border-zinc-800/60 hover:border-zinc-700/80 hover:bg-zinc-900/60"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5 w-full">
                          <span className="text-xs font-mono font-semibold text-zinc-400 group-hover:text-zinc-200 transition-colors">
                            {sizeKey}
                          </span>
                          {isCritical && (
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                          )}
                        </div>

                        {/* Large Clean Number */}
                        <div
                          className={`text-2xl font-bold font-mono tracking-tight transition-transform group-hover:scale-105 ${
                            isCritical ? "text-red-400" : "text-zinc-100"
                          }`}
                        >
                          {item.stockQuantity}
                        </div>

                        <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                          unidades
                        </span>
                      </button>
                    </HoverCardTrigger>

                    <HoverCardContent align="center" className="w-64 space-y-2.5">
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                        <span className="text-xs font-bold text-zinc-200">
                          {group.color} — Tam. {sizeKey}
                        </span>
                        <span className="font-mono text-[10px] text-zinc-500">
                          {item.sku}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs font-mono">
                        <div className="flex justify-between text-zinc-400">
                          <span>Custo Unitário:</span>
                          <span className="text-zinc-200 font-semibold">
                            {formatCurrency(item.costPrice)}
                          </span>
                        </div>
                        <div className="flex justify-between text-zinc-400">
                          <span>Estoque Mínimo:</span>
                          <span className="text-zinc-300">
                            {item.minStock} un
                          </span>
                        </div>
                        <div className="flex justify-between text-zinc-400 pt-1 border-t border-zinc-800/80">
                          <span>Status:</span>
                          <span
                            className={
                              isCritical
                                ? "text-red-400 font-semibold"
                                : "text-emerald-400"
                            }
                          >
                            {isCritical ? "Reposição Urgente" : "Estoque Seguro"}
                          </span>
                        </div>
                      </div>

                      <div className="pt-1.5 text-[10px] text-zinc-500 border-t border-zinc-800/80 flex items-center justify-between">
                        <span>Clique para ajustar</span>
                        <Edit3 size={11} className="text-amber-400" />
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
