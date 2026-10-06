"use client";

import { DollarSign, TrendingUp, Flame, Shirt, Info, AlertTriangle, CheckCircle2 } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/HoverCard";

interface MetricCardsProps {
  directSales: number;
  netProfit: number;
  shirtsToPrintToday: number;
  lowStockShirtsCount: number;
  profitMargin: number;
  shirtCostTotal?: number;
  dtfCostTotal?: number;
}

export function MetricCards({
  directSales,
  netProfit,
  shirtsToPrintToday,
  lowStockShirtsCount,
  profitMargin,
  shirtCostTotal = 0,
  dtfCostTotal = 0,
}: MetricCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Faturamento Pix / Vendas Diretas */}
      <HoverCard openDelay={150} closeDelay={150}>
        <HoverCardTrigger asChild>
          <div className="p-5 rounded-2xl bg-zinc-900/40 hover:bg-zinc-900/60 border border-zinc-800/60 hover:border-zinc-700/80 transition-all duration-200 ease-out shadow-sm hover:shadow-lg hover:shadow-black/40 cursor-default group relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-zinc-400">
                Faturamento Pix / Direto
              </span>
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs">
                <DollarSign size={13} />
              </div>
            </div>

            <div className="text-2xl lg:text-3xl font-bold font-mono tracking-tight text-zinc-100">
              {formatCurrency(directSales)}
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500">
              <span>WhatsApp & Instagram Direct</span>
              <span className="text-[10px] text-zinc-400 group-hover:text-emerald-400 transition">
                detalhes
              </span>
            </div>
          </div>
        </HoverCardTrigger>

        <HoverCardContent align="start" className="w-72">
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
              <span className="text-xs font-semibold text-zinc-200">
                Vendas Diretas Confirmadas
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">100% no Caixa</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Receita bruta total gerada em vendas sob demanda pagas via Pix, Cartão ou Dinheiro.
            </p>
          </div>
        </HoverCardContent>
      </HoverCard>

      {/* 2. Lucro Líquido Real */}
      <HoverCard openDelay={150} closeDelay={150}>
        <HoverCardTrigger asChild>
          <div className="p-5 rounded-2xl bg-zinc-900/40 hover:bg-zinc-900/60 border border-zinc-800/60 hover:border-zinc-700/80 transition-all duration-200 ease-out shadow-sm hover:shadow-lg hover:shadow-black/40 cursor-default group relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-zinc-400">
                Lucro Líquido Real
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                {profitMargin.toFixed(0)}% margem
              </span>
            </div>

            <div className="text-2xl lg:text-3xl font-bold font-mono tracking-tight text-emerald-400">
              {formatCurrency(netProfit)}
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500">
              <span>(Valor Cobrado - Camiseta - DTF)</span>
              <span className="text-[10px] text-zinc-400 group-hover:text-emerald-400 transition">
                ver breakdown
              </span>
            </div>
          </div>
        </HoverCardTrigger>

        <HoverCardContent align="start" className="w-80">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-xs font-bold text-zinc-200">
                Cálculo do Lucro Real
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                Margem Líquida
              </span>
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-zinc-300">
                <span className="text-zinc-400">(+) Valor Total Cobrado:</span>
                <span>{formatCurrency(directSales)}</span>
              </div>
              <div className="flex justify-between text-amber-400">
                <span>(-) Custo Camisetas Lisas:</span>
                <span>-{formatCurrency(shirtCostTotal)}</span>
              </div>
              <div className="flex justify-between text-orange-400">
                <span>(-) Custo Impressões DTF:</span>
                <span>-{formatCurrency(dtfCostTotal)}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold border-t border-zinc-800 pt-1.5 text-[13px]">
                <span>(=) Lucro Livre no Bolso:</span>
                <span>{formatCurrency(netProfit)}</span>
              </div>
            </div>
            <p className="text-[10px] text-zinc-500 pt-1 border-t border-zinc-800/80">
              Dinheiro que sobra líquido no caixa da Cordeiro Ink após pagar malha e birô.
            </p>
          </div>
        </HoverCardContent>
      </HoverCard>

      {/* 3. Total de Camisetas a Estampar Hoje */}
      <div className="p-5 rounded-2xl bg-zinc-900/40 hover:bg-zinc-900/60 border border-zinc-800/60 hover:border-zinc-700/80 transition-all duration-200 ease-out shadow-sm hover:shadow-lg hover:shadow-black/40">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-zinc-400">
            A Estampar Hoje
          </span>
          <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Flame size={14} />
          </div>
        </div>

        <div className="text-2xl lg:text-3xl font-bold font-mono tracking-tight text-amber-400">
          {formatNumber(shirtsToPrintToday)}
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Peças na fila de produção</span>
          {shirtsToPrintToday > 0 ? (
            <span className="text-[10px] text-amber-400 font-semibold font-mono">
              Fila ativa
            </span>
          ) : (
            <span className="text-[10px] text-zinc-500 font-mono">Tudo prensado</span>
          )}
        </div>
      </div>

      {/* 4. Camisetas Lisas Acabando no Estoque */}
      <div
        className={`p-5 rounded-2xl transition-all duration-200 ease-out shadow-sm hover:shadow-lg ${
          lowStockShirtsCount > 0
            ? "bg-red-500/5 border border-red-500/30 hover:border-red-500/50"
            : "bg-zinc-900/40 border border-zinc-800/60 hover:border-zinc-700/80"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-zinc-400">
            Lisas Acabando
          </span>
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center ${
              lowStockShirtsCount > 0
                ? "bg-red-500/10 text-red-400"
                : "bg-emerald-500/10 text-emerald-400"
            }`}
          >
            {lowStockShirtsCount > 0 ? (
              <AlertTriangle size={14} />
            ) : (
              <CheckCircle2 size={14} />
            )}
          </div>
        </div>

        <div
          className={`text-2xl lg:text-3xl font-bold font-mono tracking-tight ${
            lowStockShirtsCount > 0 ? "text-red-400" : "text-zinc-100"
          }`}
        >
          {formatNumber(lowStockShirtsCount)}
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500">
          <span>
            {lowStockShirtsCount > 0
              ? "Itens abaixo do estoque mínimo"
              : "Grade de camisetas abastecida"}
          </span>
          {lowStockShirtsCount > 0 ? (
            <span className="text-[10px] text-red-400 font-bold uppercase font-mono">
              Repor Malha
            </span>
          ) : (
            <span className="text-[10px] text-emerald-400 font-mono">OK</span>
          )}
        </div>
      </div>
    </div>
  );
}
