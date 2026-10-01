"use client";

import { useState } from "react";
import { Calculator, DollarSign, Percent, TrendingUp, AlertCircle, Sparkles, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const MARKETPLACE_FEES: Record<string, { label: string; feePct: number; fixedFee: number }> = {
  SHOPEE: { label: "Shopee (Padrão)", feePct: 20.0, fixedFee: 4.0 },
  SHEIN: { label: "Shein Marketplace", feePct: 18.0, fixedFee: 0.0 },
  TIKTOK: { label: "TikTok Shop", feePct: 15.0, fixedFee: 0.0 },
  MANUAL: { label: "Venda Direta / Whats (Pix)", feePct: 0.0, fixedFee: 0.0 },
};

export function PricingCalculator() {
  const [shirtCost, setShirtCost] = useState<number>(24.5);
  const [dtfCost, setDtfCost] = useState<number>(13.9);
  const [packagingCost, setPackagingCost] = useState<number>(3.0); // Saco + tag + brinde
  const [channelKey, setChannelKey] = useState<string>("SHOPEE");
  const [targetMargin, setTargetMargin] = useState<number>(55.0); // Margem alvo %
  const [estimatedMonthlyVolume, setEstimatedMonthlyVolume] = useState<number>(100);

  const selectedChannel = MARKETPLACE_FEES[channelKey];

  // Cálculo da Estrutura de Custos
  // Custo Total de Insumos (CMV Direto)
  const totalCMV = shirtCost + dtfCost + packagingCost;

  // Fórmula de Markup com Taxa de Marketplace:
  // Preço de Venda Sugerido (P):
  // P - (P * feePct/100) - fixedFee - totalCMV = Lucro Líquido Desejado
  // Lucro Líquido = P * (targetMargin/100)
  // Logo: P * (1 - feePct/100 - targetMargin/100) = totalCMV + fixedFee
  // P = (totalCMV + fixedFee) / (1 - (feePct + targetMargin)/100)
  const feeRate = selectedChannel.feePct / 100;
  const marginRate = targetMargin / 100;
  const denominator = 1 - feeRate - marginRate;

  const suggestedPrice =
    denominator > 0 ? (totalCMV + selectedChannel.fixedFee) / denominator : 0;

  // Preço Mínimo (Break-even sem lucro, margem zero)
  const minPrice =
    1 - feeRate > 0 ? (totalCMV + selectedChannel.fixedFee) / (1 - feeRate) : 0;

  // Valor da comissão do canal com o preço sugerido
  const channelFeeAmount = suggestedPrice * feeRate + selectedChannel.fixedFee;

  // Lucro Líquido Real por peça vendida
  const netProfitPerUnit = suggestedPrice - channelFeeAmount - totalCMV;

  // Projeção Mensal
  const projectedRevenue = suggestedPrice * estimatedMonthlyVolume;
  const projectedNetProfit = netProfitPerUnit * estimatedMonthlyVolume;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Simulation Inputs (7 cols) */}
      <div className="lg:col-span-7 p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 shadow-sm space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-800">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Calculator size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-100">
              Simulador de Precificação Têxtil On-Demand
            </h3>
            <p className="text-xs text-zinc-400">
              Calcule o preço de venda ideal considerando custos de confecção, estampa DTF e comissão de canal.
            </p>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Custo Camiseta Lisa (R$)
              </label>
              <input
                type="number"
                step="0.10"
                value={shirtCost}
                onChange={(e) => setShirtCost(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-sm font-mono text-zinc-100 focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">
                Ex: Fio 26.1 Oversized
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Custo Estampa DTF (R$)
              </label>
              <input
                type="number"
                step="0.10"
                value={dtfCost}
                onChange={(e) => setDtfCost(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-sm font-mono text-zinc-100 focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">
                Ex: Impressão Têxtil A3
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Embalagem & Tag (R$)
              </label>
              <input
                type="number"
                step="0.10"
                value={packagingCost}
                onChange={(e) => setPackagingCost(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-sm font-mono text-zinc-100 focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">
                Saco zip + tag + brinde
              </span>
            </div>
          </div>

          {/* Channel Selector */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Canal de Venda / Comissão de Marketplace
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {Object.entries(MARKETPLACE_FEES).map(([key, val]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setChannelKey(key)}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    channelKey === key
                      ? "bg-amber-500/10 border-amber-500 text-amber-300 shadow-sm"
                      : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <span className="text-xs font-bold block truncate">
                    {val.label}
                  </span>
                  <span className="text-[11px] font-mono mt-1 text-zinc-400">
                    {val.feePct}% {val.fixedFee > 0 ? `+ R$${val.fixedFee}` : ""}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Target Margin Slider */}
          <div className="pt-3">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-zinc-300">
                Margem Líquida Alvo Desejada:
              </label>
              <span className="text-base font-bold font-mono text-amber-400">
                {targetMargin.toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min={15}
              max={75}
              step={1}
              value={targetMargin}
              onChange={(e) => setTargetMargin(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-2 bg-zinc-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono">
              <span>15% (Baixa)</span>
              <span>45% (Típica)</span>
              <span>60% (Marca Própria)</span>
              <span>75% (Alta)</span>
            </div>
          </div>

          {/* Monthly Volume Simulation */}
          <div className="pt-3 border-t border-zinc-800">
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Simulação de Volume Mensal de Vendas
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={10}
                max={5000}
                step={10}
                value={estimatedMonthlyVolume}
                onChange={(e) => setEstimatedMonthlyVolume(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-32 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-100 focus:outline-none focus:border-amber-500"
              />
              <span className="text-xs text-zinc-400">
                peças / mês neste drop
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Output Cards (5 cols) */}
      <div className="lg:col-span-5 space-y-4">
        {/* Main Recommendation Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-amber-500/30 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles size={80} className="text-amber-400" />
          </div>

          <div className="text-[10px] uppercase font-bold tracking-wider text-amber-400 mb-1">
            Preço de Venda Recomendado
          </div>
          <div className="text-4xl font-extrabold font-mono text-zinc-100 tracking-tight">
            {formatCurrency(suggestedPrice)}
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Garante sua margem líquida de {targetMargin}% após taxa de {selectedChannel.feePct}% da {selectedChannel.label}.
          </p>

          <div className="mt-6 pt-4 border-t border-zinc-800/80 space-y-2 text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>Custo de Fabricação (CMV):</span>
              <span className="font-mono text-zinc-200">{formatCurrency(totalCMV)}</span>
            </div>
            <div className="flex justify-between text-orange-400">
              <span>Comissão {selectedChannel.label}:</span>
              <span className="font-mono">-{formatCurrency(channelFeeAmount)}</span>
            </div>
            <div className="flex justify-between text-zinc-500">
              <span>Preço Mínimo (Break-even):</span>
              <span className="font-mono">{formatCurrency(minPrice)}</span>
            </div>
            <div className="flex justify-between text-emerald-400 font-bold border-t border-zinc-800/80 pt-2 text-sm">
              <span>Lucro Líquido por Peça:</span>
              <span className="font-mono">{formatCurrency(netProfitPerUnit)}</span>
            </div>
          </div>
        </div>

        {/* Monthly Projection Card */}
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
            <TrendingUp size={14} className="text-emerald-400" />
            <span>Projeção Mensal para {estimatedMonthlyVolume} Peças</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase block font-medium">
                Faturamento Bruto
              </span>
              <span className="text-base font-bold font-mono text-zinc-200">
                {formatCurrency(projectedRevenue)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950/60 border border-emerald-500/20">
              <span className="text-[10px] text-emerald-400 uppercase block font-semibold">
                Lucro Líquido Real
              </span>
              <span className="text-base font-bold font-mono text-emerald-400">
                {formatCurrency(projectedNetProfit)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
