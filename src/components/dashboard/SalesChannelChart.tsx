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
    <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">
              Vendas por Canal de Marketplace
            </h3>
            <p className="text-[11px] text-zinc-400">
              Composição de receita líquida e canais de atração.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-zinc-200">
            {formatCurrency(totalPeriod)} total
          </span>
        </div>

        {/* Visual Progress Stack */}
        <div className="h-4 w-full bg-zinc-950 rounded-lg overflow-hidden flex p-0.5 gap-0.5 border border-zinc-800 mb-5">
          {data.map((item) => {
            const pct = totalPeriod > 0 ? (item.totalSales / totalPeriod) * 100 : 0;
            if (pct <= 0) return null;
            const config = CHANNEL_CONFIG[item.channel] || { bg: "bg-zinc-700" };
            return (
              <div
                key={item.channel}
                className="h-full rounded-sm transition-all"
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

        {/* Channel Details Grid */}
        <div className="space-y-3">
          {data.map((item) => {
            const config = CHANNEL_CONFIG[item.channel] || {
              label: item.channel,
              text: "text-zinc-300",
              bg: "bg-zinc-800",
            };
            const pct = totalPeriod > 0 ? (item.totalSales / totalPeriod) * 100 : 0;

            return (
              <div
                key={item.channel}
                className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950/40 border border-zinc-800/60"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor:
                        item.channel === "SHOPEE"
                          ? "#f97316"
                          : item.channel === "SHEIN"
                          ? "#c084fc"
                          : item.channel === "TIKTOK"
                          ? "#06b6d4"
                          : "#10b981",
                    }}
                  />
                  <div>
                    <span className="text-xs font-semibold text-zinc-200">
                      {config.label}
                    </span>
                    <span className="text-[10px] text-zinc-500 block">
                      {item.orderCount} pedidos concluídos
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-zinc-100 block">
                    {formatCurrency(item.totalSales)}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {pct.toFixed(1)}% do faturamento
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
