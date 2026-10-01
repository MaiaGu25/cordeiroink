"use client";

import { formatCurrency, CHANNEL_CONFIG } from "@/lib/utils";

interface ChannelData {
  channel: string;
  totalSales: number;
  orderCount: number;
}

interface SalesChannelChartProps {
  data: ChannelData[];
}

export function SalesChannelChart({ data }: SalesChannelChartProps) {
  const totalPeriod = data.reduce((acc, curr) => acc + curr.totalSales, 0);

  return (
    <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 backdrop-blur-sm shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-200">
              Vendas por Canal
            </h3>
            <p className="text-xs text-zinc-500">
              Distribuição de receita líquida por marketplace.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-zinc-300">
            {formatCurrency(totalPeriod)}
          </span>
        </div>

        {/* Minimal Progress Bar Track */}
        <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden flex gap-1 mb-6 border border-zinc-800/50">
          {data.map((item) => {
            const pct = totalPeriod > 0 ? (item.totalSales / totalPeriod) * 100 : 0;
            if (pct <= 0) return null;
            return (
              <div
                key={item.channel}
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${pct}%`,
                  backgroundColor:
                    item.channel === "SHOPEE"
                      ? "#f97316"
                      : item.channel === "SHEIN"
                      ? "#c084fc"
                      : item.channel === "TIKTOK"
                      ? "#06b6d4"
                      : "#10b981",
                }}
                title={`${item.channel}: ${pct.toFixed(1)}%`}
              />
            );
          })}
        </div>

        {/* Clean Monochromatic Channel Rows */}
        <div className="space-y-2">
          {data.map((item) => {
            const config = CHANNEL_CONFIG[item.channel] || {
              label: item.channel,
              dot: "bg-zinc-500",
            };
            const pct = totalPeriod > 0 ? (item.totalSales / totalPeriod) * 100 : 0;

            return (
              <div
                key={item.channel}
                className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/40 hover:border-zinc-700/60 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                  <div>
                    <span className="text-xs font-medium text-zinc-200">
                      {config.label}
                    </span>
                    <span className="text-[10px] text-zinc-500 block font-mono">
                      {item.orderCount} {item.orderCount === 1 ? "pedido" : "pedidos"}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-semibold text-zinc-200 block">
                    {formatCurrency(item.totalSales)}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {pct.toFixed(0)}% do total
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
