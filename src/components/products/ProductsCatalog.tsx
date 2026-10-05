"use client";

import { Shirt, Layers, DollarSign, Percent, Sparkles, Tag, ChevronDown, ChevronUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

interface ProductCatalogProps {
  products: any[];
}

export function ProductsCatalog({ products }: ProductCatalogProps) {
  const [expandedProductId, setExpandedProductId] = useState<string | null>(
    products[0]?.id || null
  );

  if (products.length === 0) {
    return (
      <div className="p-12 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 text-center space-y-3">
        <div className="w-10 h-10 rounded-xl bg-zinc-800/60 border border-zinc-700/60 flex items-center justify-center text-zinc-400 mx-auto">
          <Shirt size={20} />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-zinc-200">
            Modelo de Produção Sob Demanda Ativo
          </h4>
          <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1">
            Você não precisa de um catálogo prévio de produtos cadastrados. Crie encomendas diretamente na aba Pedidos definindo a camiseta lisa, a estampa DTF e os insumos na hora!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {products.map((product) => {
        const isExpanded = expandedProductId === product.id;

        return (
          <div
            key={product.id}
            className="rounded-2xl bg-zinc-900/80 border border-zinc-800/80 overflow-hidden transition-all shadow-sm"
          >
            {/* Main Product Card Header */}
            <div
              onClick={() =>
                setExpandedProductId(isExpanded ? null : product.id)
              }
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-zinc-800/30 transition"
            >
              <div className="flex items-center gap-4">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-14 h-14 rounded-xl object-cover border border-zinc-700 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 shrink-0">
                    <Shirt size={22} />
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-zinc-100">
                      {product.name}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {product.skuBase}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <span>{product.collection || "Linha Principal"}</span>
                    <span>•</span>
                    <span>{product.variants?.length || 0} variantes ativas</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-semibold text-zinc-500 block">
                    Margem Alvo
                  </span>
                  <span className="text-sm font-bold font-mono text-amber-400">
                    {product.targetMargin}%
                  </span>
                </div>

                <div className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400">
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>
            </div>

            {/* Expanded Variants & BOM Table */}
            {isExpanded && (
              <div className="p-5 border-t border-zinc-800 bg-zinc-950/50 space-y-4 animate-in fade-in duration-200">
                <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers size={13} className="text-amber-400" />
                  Grade de Variantes & Ficha Técnica (Bill of Materials)
                </div>

                <div className="space-y-3">
                  {product.variants?.map((v: any) => {
                    const totalBomCost = v.bom?.reduce(
                      (acc: number, b: any) => acc + b.rawItem.costPrice * b.quantity,
                      0
                    ) || 0;
                    const estimatedProfit = v.basePrice - totalBomCost;

                    return (
                      <div
                        key={v.id}
                        className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-zinc-100">
                              {v.title}
                            </span>
                            <span className="font-mono text-[11px] text-zinc-400">
                              ({v.sku})
                            </span>
                          </div>

                          {/* BOM items list */}
                          <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-zinc-400">
                            {v.bom?.map((b: any) => (
                              <span
                                key={b.id}
                                className="px-2 py-0.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-300"
                              >
                                {b.quantity}x {b.rawItem?.name} ({formatCurrency(b.rawItem?.costPrice)})
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-right shrink-0">
                          <div>
                            <span className="text-[10px] text-zinc-500 block">
                              Custo Insumos
                            </span>
                            <span className="font-mono text-zinc-400">
                              {formatCurrency(totalBomCost)}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] text-zinc-500 block">
                              Preço Base
                            </span>
                            <span className="font-mono font-bold text-zinc-100">
                              {formatCurrency(v.basePrice)}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] text-emerald-500 block">
                              Margem Bruta
                            </span>
                            <span className="font-mono font-bold text-emerald-400">
                              {formatCurrency(estimatedProfit)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
