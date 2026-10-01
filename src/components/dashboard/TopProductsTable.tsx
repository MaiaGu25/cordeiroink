"use client";

import { formatCurrency } from "@/lib/utils";
import { Shirt, TrendingUp } from "lucide-react";
import Link from "next/link";

interface TopProduct {
  name: string;
  sku: string;
  category: string;
  unitsSold: number;
  totalRevenue: number;
  imageUrl?: string | null;
}

interface TopProductsTableProps {
  products: TopProduct[];
}

export function TopProductsTable({ products }: TopProductsTableProps) {
  return (
    <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 backdrop-blur-sm shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-200">
              Modelos Mais Vendidos
            </h3>
            <p className="text-xs text-zinc-500">
              Ranking de volume por estampa e drop.
            </p>
          </div>
          <Link
            href="/produtos"
            className="text-xs text-zinc-400 hover:text-amber-400 font-medium transition-colors"
          >
            Ver Catálogo
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800/60 text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                <th className="pb-3 font-medium">Modelo / SKU</th>
                <th className="pb-3 font-medium text-center">Unidades</th>
                <th className="pb-3 font-medium text-right">Faturamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {products.map((p, index) => (
                <tr
                  key={p.sku}
                  className="hover:bg-zinc-800/20 transition-colors group"
                >
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] text-zinc-600 w-3">
                        {index + 1}
                      </span>
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-9 h-9 rounded-lg object-cover border border-zinc-800"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
                          <Shirt size={14} />
                        </div>
                      )}
                      <div>
                        <span className="font-medium text-zinc-200 group-hover:text-zinc-100 transition-colors block truncate max-w-[210px]">
                          {p.name}
                        </span>
                        <span className="font-mono text-[10px] text-zinc-500">
                          {p.sku}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-center font-mono font-medium text-zinc-300">
                    {p.unitsSold} un
                  </td>
                  <td className="py-3 text-right font-mono font-semibold text-emerald-400/90">
                    {formatCurrency(p.totalRevenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
