"use client";

import { AlertTriangle, ArrowRight } from "lucide-react";
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
      <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/40 flex items-center justify-between text-xs text-zinc-500">
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Estoque em níveis saudáveis. Nenhum insumo em estado crítico.
        </span>
        <Link
          href="/estoque"
          className="text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors"
        >
          Ver inventário <ArrowRight size={12} />
        </Link>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 backdrop-blur-sm shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertTriangle size={15} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              Alertas de Reposição
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-medium">
                {items.length} itens no limite
              </span>
            </h3>
            <p className="text-xs text-zinc-500">
              Insumos com saldo abaixo da margem de segurança de confecção.
            </p>
          </div>
        </div>

        <Link
          href="/compras"
          className="text-xs font-medium text-zinc-300 hover:text-amber-400 flex items-center gap-1 transition-colors"
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
              className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60 hover:border-zinc-700/80 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-zinc-200 truncate pr-2" title={item.name}>
                    {item.name}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                    {item.sku}
                  </span>
                </div>
                <div className="flex items-baseline justify-between text-xs mt-2.5 font-mono">
                  <span className="text-red-400 font-bold">
                    {item.stockQuantity} un disponíveis
                  </span>
                  <span className="text-zinc-500 text-[11px]">
                    mín: {item.minStock} un
                  </span>
                </div>
              </div>

              {/* Minimal Red Bar */}
              <div className="w-full bg-zinc-800/80 rounded-full h-1 mt-3 overflow-hidden">
                <div
                  className="bg-red-400/80 h-1 rounded-full transition-all duration-500"
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
