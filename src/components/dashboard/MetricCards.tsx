"use client";

import { DollarSign, TrendingUp, ShoppingBag, Layers, Percent } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface MetricCardsProps {
  grossSales: number;
  netProfit: number;
  avgTicket: number;
  activeOrdersCount: number;
  profitMargin: number;
}

export function MetricCards({
  grossSales,
  netProfit,
  avgTicket,
  activeOrdersCount,
  profitMargin,
}: MetricCardsProps) {
  const cards = [
    {
      title: "Faturamento Bruto",
      value: formatCurrency(grossSales),
      subtitle: "Total em vendas do período",
      icon: DollarSign,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Lucro Líquido Real",
      value: formatCurrency(netProfit),
      subtitle: `Margem real de ${profitMargin.toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Ticket Médio",
      value: formatCurrency(avgTicket),
      subtitle: "Média por pedido aprovado",
      icon: Percent,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Pedidos Ativos no Ciclo",
      value: `${formatNumber(activeOrdersCount)} pedidos`,
      subtitle: "Em produção ou aguardando",
      icon: ShoppingBag,
      color: "text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.title}
            className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700/80 transition shadow-sm relative overflow-hidden group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-zinc-400">
                {c.title}
              </span>
              <div className={`p-2 rounded-lg border ${c.bg} ${c.color}`}>
                <Icon size={16} />
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight text-zinc-100 font-mono">
              {c.value}
            </div>
            <p className="mt-1 text-[11px] text-zinc-400">
              {c.subtitle}
            </p>
          </div>
        );
      })}
    </div>
  );
}
