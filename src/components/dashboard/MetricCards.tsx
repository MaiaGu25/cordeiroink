"use client";

import { DollarSign, TrendingUp, ShoppingBag, Percent, Info, ArrowUpRight } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/HoverCard";

interface MetricCardsProps {
  grossSales: number;
  netProfit: number;
  avgTicket: number;
  activeOrdersCount: number;
  profitMargin: number;
  // Breakdown para HoverCards
  platformFees?: number;
  estimatedCMV?: number;
  inProductionCount?: number;
  waitingCount?: number;
}

export function MetricCards({
  grossSales,
  netProfit,
  avgTicket,
  activeOrdersCount,
  profitMargin,
  platformFees = 0,
  estimatedCMV = 0,
  inProductionCount = 2,
  waitingCount = 2,
}: MetricCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Faturamento Bruto Card */}
      <HoverCard openDelay={150} closeDelay={150}>
        <HoverCardTrigger asChild>
          <div className="p-5 rounded-2xl bg-zinc-900/40 hover:bg-zinc-900/60 border border-zinc-800/60 hover:border-zinc-700/80 transition-all duration-200 ease-out shadow-sm hover:shadow-lg hover:shadow-black/40 cursor-default group relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-zinc-400">
                Faturamento Bruto
              </span>
              <div className="text-zinc-500 group-hover:text-zinc-300 transition-colors">
                <Info size={14} />
              </div>
            </div>

            <div className="text-2xl lg:text-3xl font-bold font-mono tracking-tight text-zinc-100">
              {formatCurrency(grossSales)}
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500">
              <span>Total vendido no ciclo</span>
              <span className="text-[10px] text-zinc-400 group-hover:text-amber-400/80 transition">
                hover para detalhes
              </span>
            </div>
          </div>
        </HoverCardTrigger>

        <HoverCardContent align="start" className="w-80">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-xs font-semibold text-zinc-200">
                Composição do Faturamento
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">Bruto</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Soma do valor nominal de todas as peças vendidas em marketplaces e vendas diretas Pix no período selecionado.
            </p>
            <div className="pt-1.5 space-y-1 text-xs font-mono">
              <div className="flex justify-between text-zinc-300">
                <span className="text-zinc-400">Total Produtos:</span>
                <span>{formatCurrency(grossSales)}</span>
              </div>
              <div className="flex justify-between text-zinc-400 text-[11px]">
                <span>Base de cálculo de comissões</span>
                <span className="text-emerald-400">100%</span>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>

      {/* 2. Lucro Líquido Real Card (com breakdown completo no HoverCard) */}
      <HoverCard openDelay={150} closeDelay={150}>
        <HoverCardTrigger asChild>
          <div className="p-5 rounded-2xl bg-zinc-900/40 hover:bg-zinc-900/60 border border-zinc-800/60 hover:border-zinc-700/80 transition-all duration-200 ease-out shadow-sm hover:shadow-lg hover:shadow-black/40 cursor-default group relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-zinc-400">
                Lucro Líquido Real
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                {profitMargin.toFixed(1)}% margem
              </span>
            </div>

            <div className="text-2xl lg:text-3xl font-bold font-mono tracking-tight text-emerald-400">
              {formatCurrency(netProfit)}
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500">
              <span>Livre de taxas e CMV</span>
              <span className="text-[10px] text-zinc-400 group-hover:text-emerald-400/80 transition">
                hover para breakdown
              </span>
            </div>
          </div>
        </HoverCardTrigger>

        <HoverCardContent align="start" className="w-80">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-xs font-semibold text-zinc-200">
                Breakdown do Lucro Real
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                Margem Líquida
              </span>
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-zinc-300">
                <span className="text-zinc-400">(+) Faturamento Bruto:</span>
                <span>{formatCurrency(grossSales)}</span>
              </div>
              <div className="flex justify-between text-orange-400">
                <span>(-) Taxas de Plataformas:</span>
                <span>-{formatCurrency(platformFees)}</span>
              </div>
              <div className="flex justify-between text-amber-400">
                <span>(-) Custos Insumos (CMV):</span>
                <span>-{formatCurrency(estimatedCMV)}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold border-t border-zinc-800 pt-1.5 text-[13px]">
                <span>(=) Lucro em Caixa:</span>
                <span>{formatCurrency(netProfit)}</span>
              </div>
            </div>
            <p className="text-[10px] text-zinc-500 pt-1 border-t border-zinc-800/80 leading-normal">
              Representa o saldo financeiro real após descontar confecção, estampagem DTF e comissões Shopee/Shein/TikTok.
            </p>
          </div>
        </HoverCardContent>
      </HoverCard>

      {/* 3. Ticket Médio Card */}
      <HoverCard openDelay={150} closeDelay={150}>
        <HoverCardTrigger asChild>
          <div className="p-5 rounded-2xl bg-zinc-900/40 hover:bg-zinc-900/60 border border-zinc-800/60 hover:border-zinc-700/80 transition-all duration-200 ease-out shadow-sm hover:shadow-lg hover:shadow-black/40 cursor-default group relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-zinc-400">
                Ticket Médio
              </span>
              <div className="text-zinc-500 group-hover:text-zinc-300 transition-colors">
                <Info size={14} />
              </div>
            </div>

            <div className="text-2xl lg:text-3xl font-bold font-mono tracking-tight text-zinc-100">
              {formatCurrency(avgTicket)}
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500">
              <span>Média por pedido aprovado</span>
              <span className="text-[10px] text-zinc-400 group-hover:text-amber-400/80 transition">
                hover para detalhes
              </span>
            </div>
          </div>
        </HoverCardTrigger>

        <HoverCardContent align="start" className="w-72">
          <div className="space-y-2">
            <div className="border-b border-zinc-800 pb-2">
              <span className="text-xs font-semibold text-zinc-200 block">
                Eficiência de Pedido
              </span>
              <span className="text-[11px] text-zinc-400">
                Média de receita gerada por carrinho de compra.
              </span>
            </div>
            <div className="space-y-1 text-xs font-mono">
              <div className="flex justify-between text-zinc-400">
                <span>Valor Médio Peça:</span>
                <span className="text-zinc-200">~R$ 97,00</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Peças por Envio:</span>
                <span className="text-zinc-200">1,3 un</span>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>

      {/* 4. Pedidos Ativos Card */}
      <HoverCard openDelay={150} closeDelay={150}>
        <HoverCardTrigger asChild>
          <div className="p-5 rounded-2xl bg-zinc-900/40 hover:bg-zinc-900/60 border border-zinc-800/60 hover:border-zinc-700/80 transition-all duration-200 ease-out shadow-sm hover:shadow-lg hover:shadow-black/40 cursor-default group relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-zinc-400">
                Pedidos em Andamento
              </span>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            </div>

            <div className="text-2xl lg:text-3xl font-bold font-mono tracking-tight text-zinc-100">
              {formatNumber(activeOrdersCount)}
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500">
              <span>Fluxo de produção ativo</span>
              <span className="text-[10px] text-zinc-400 group-hover:text-amber-400/80 transition">
                hover para status
              </span>
            </div>
          </div>
        </HoverCardTrigger>

        <HoverCardContent align="start" className="w-72">
          <div className="space-y-2">
            <div className="border-b border-zinc-800 pb-2">
              <span className="text-xs font-semibold text-zinc-200 block">
                Status dos Pedidos Ativos
              </span>
              <span className="text-[11px] text-zinc-400">
                Distribuição no chão de confecção:
              </span>
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-zinc-300">
                <span className="text-zinc-400">• Em Prensagem Térmica:</span>
                <span className="text-amber-400 font-bold">{inProductionCount}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span className="text-zinc-400">• Aguardando Início:</span>
                <span className="text-zinc-300 font-bold">{waitingCount}</span>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}
