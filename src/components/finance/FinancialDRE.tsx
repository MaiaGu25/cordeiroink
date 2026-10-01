"use client";

import { formatCurrency } from "@/lib/utils";
import { TrendingUp, ArrowDownRight, ArrowUpRight, DollarSign, Percent } from "lucide-react";

interface DREData {
  grossSales: number;
  platformFees: number;
  shippingRevenue: number;
  netRevenue: number;
  totalCMV: number;
  grossProfit: number;
  operationalExpenses: number;
  marketingExpenses: number;
  rawMaterialPurchases: number;
  realNetProfit: number;
  marginPercent: number;
}

interface FinancialDREProps {
  dre: DREData;
}

export function FinancialDRE({ dre }: FinancialDREProps) {
  return (
    <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
        <div>
          <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-400" />
            Demonstrativo de Resultado do Exercício (DRE Operacional)
          </h3>
          <p className="text-xs text-zinc-400">
            Diferenciação clara entre Faturamento Bruto de Marketplace e o Lucro Líquido Real que fica na conta.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <Percent size={14} />
          <span className="text-xs font-mono font-bold">
            Margem Líquida Real: {dre.marginPercent.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* DRE Waterfall Visual Steps */}
      <div className="space-y-2 text-xs">
        {/* 1. Faturamento Bruto */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="font-semibold text-zinc-200">
              (+) Faturamento Bruto de Vendas (Produtos)
            </span>
          </div>
          <span className="font-mono font-bold text-sm text-zinc-100">
            {formatCurrency(dre.grossSales)}
          </span>
        </div>

        {/* 2. Taxas de Plataformas */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/30 border border-zinc-800/50">
          <div className="flex items-center gap-2 text-orange-400">
            <ArrowDownRight size={14} />
            <span>(-) Taxas e Comissões de Marketplace (Shopee, Shein, TikTok)</span>
          </div>
          <span className="font-mono font-semibold text-orange-400">
            -{formatCurrency(dre.platformFees)}
          </span>
        </div>

        {/* 3. Receita Líquida */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-700/60 font-semibold">
          <span className="text-zinc-200">(=) Receita Operacional Líquida</span>
          <span className="font-mono text-zinc-100">
            {formatCurrency(dre.netRevenue)}
          </span>
        </div>

        {/* 4. CMV de Insumos */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/30 border border-zinc-800/50">
          <div className="flex items-center gap-2 text-amber-400">
            <ArrowDownRight size={14} />
            <span>(-) CMV Insumos (Camisetas Lisas + Impressões DTF + Embalagens dos Pedidos)</span>
          </div>
          <span className="font-mono font-semibold text-amber-400">
            -{formatCurrency(dre.totalCMV)}
          </span>
        </div>

        {/* 5. Lucro Bruto */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-700/60 font-semibold">
          <span className="text-zinc-200">(=) Lucro Bruto da Confecção</span>
          <span className="font-mono text-zinc-100">
            {formatCurrency(dre.grossProfit)}
          </span>
        </div>

        {/* 6. Despesas Operacionais e Marketing */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/30 border border-zinc-800/50">
          <div className="flex items-center gap-2 text-zinc-400">
            <ArrowDownRight size={14} />
            <span>(-) Despesas Fixas / Operacionais (Energia ateliê, software, prensas)</span>
          </div>
          <span className="font-mono font-semibold text-zinc-400">
            -{formatCurrency(dre.operationalExpenses)}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/30 border border-zinc-800/50">
          <div className="flex items-center gap-2 text-zinc-400">
            <ArrowDownRight size={14} />
            <span>(-) Investimento em Anúncios & Marketing (TikTok/Meta Ads)</span>
          </div>
          <span className="font-mono font-semibold text-zinc-400">
            -{formatCurrency(dre.marketingExpenses)}
          </span>
        </div>

        {/* 7. Lucro Líquido Real Final */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/20 to-emerald-500/10 border border-emerald-500/30 font-bold text-sm mt-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <DollarSign size={18} />
            <span>(=) LUCRO LÍQUIDO REAL DA CORDEIRO INK</span>
          </div>
          <span className="font-mono text-lg text-emerald-400">
            {formatCurrency(dre.realNetProfit)}
          </span>
        </div>
      </div>
    </div>
  );
}
