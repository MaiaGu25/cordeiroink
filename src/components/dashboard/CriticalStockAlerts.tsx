"use client";

import { AlertTriangle, ArrowRight, Package } from "lucide-react";
import Link from "next/link";

interface CriticalItem {
  id: string;
  name: string;
  sku: string;
  stockQuantity: number;
  minStock: number;
  type: string;
}

interface CriticalStockAlertsProps {
  items: CriticalItem[];
}

export function CriticalStockAlerts({ items }: CriticalStockAlertsProps) {
  if (items.length === 0) {
    return (
      <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
        <span className="flex items-center gap-2 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Estoque em níveis saudáveis. Nenhum insumo em nível crítico.
        </span>
        <Link href="/estoque" className="text-zinc-400 hover:text-zinc-200 flex items-center gap-1">
          Ver inventário <ArrowRight size={12} />
        </Link>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertTriangle size={15} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              Alertas de Estoque Crítico
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                {items.length} itens requerem reposição
              </span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              Insumos e matérias-primas abaixo da margem de segurança de produção.
            </p>
          </div>
        </div>

        <Link
          href="/compras"
          className="text-xs font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1 transition"
        >
          Repor Estoque <ArrowRight size={12} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {items.map((item) => {
          const ratio = Math.min((item.stockQuantity / item.minStock) * 100, 100);
          return (
            <div
              key={item.id}
              className="p-3 rounded-lg bg-zinc-950/60 border border-red-500/20 hover:border-red-500/40 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-zinc-200 truncate pr-2" title={item.name}>
                    {item.name}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                    {item.sku}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs mt-2 font-mono">
                  <span className="text-red-400 font-bold">
                    {item.stockQuantity} un disponíveis
                  </span>
                  <span className="text-zinc-500 text-[11px]">
                    mín: {item.minStock} un
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2.5 overflow-hidden">
                <div
                  className="bg-red-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${ratio}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
