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
    <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <TrendingUp size={15} className="text-amber-400" />
              Produtos Mais Vendidos (Drops Cordeiro)
            </h3>
            <p className="text-[11px] text-zinc-400">
              Ranking de volume e faturamento por modelo de estampa.
            </p>
          </div>
          <Link
            href="/produtos"
            className="text-xs text-amber-400 hover:text-amber-300 font-medium transition"
          >
            Ver Catálogo
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">
                <th className="pb-2.5 font-medium">Produto / Drop</th>
                <th className="pb-2.5 font-medium text-center">Unidades</th>
                <th className="pb-2.5 font-medium text-right">Faturamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {products.map((p, index) => (
                <tr
                  key={p.sku}
                  className="hover:bg-zinc-800/40 transition group"
                >
                  <td className="py-2.5">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] text-zinc-500 w-3">
                        #{index + 1}
                      </span>
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-8 h-8 rounded-md object-cover border border-zinc-700/80"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400">
                          <Shirt size={14} />
                        </div>
                      )}
                      <div>
                        <span className="font-semibold text-zinc-200 group-hover:text-amber-300 transition block truncate max-w-[200px]">
                          {p.name}
                        </span>
                        <span className="font-mono text-[10px] text-zinc-400">
                          {p.sku}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 text-center font-mono font-medium text-zinc-300">
                    {p.unitsSold} un
                  </td>
                  <td className="py-2.5 text-right font-mono font-semibold text-emerald-400">
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
