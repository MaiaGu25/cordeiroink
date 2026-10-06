"use client";

import { formatCurrency, formatDateShort, CHANNEL_CONFIG, STATUS_CONFIG } from "@/lib/utils";
import { OrderHoverPreview } from "./OrderHoverPreview";
import { ChevronRight } from "lucide-react";

interface OrdersTableProps {
  orders: any[];
  onSelectOrder: (order: any) => void;
}

export function OrdersTable({ orders, onSelectOrder }: OrdersTableProps) {
  if (orders.length === 0) {
    return (
      <div className="p-16 text-center rounded-2xl bg-zinc-900/30 border border-zinc-800/50 text-zinc-500 text-xs">
        Nenhum pedido encontrado para os filtros selecionados.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-800/60 bg-zinc-900/30 backdrop-blur-sm shadow-sm">
      <table className="w-full text-left text-xs whitespace-nowrap min-w-[600px]">
        <thead>
          <tr className="border-b border-zinc-800/60 bg-zinc-950/40 text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
            <th className="px-3.5 py-3 sm:px-6 sm:py-4">Pedido</th>
            <th className="px-3.5 py-3 sm:px-6 sm:py-4">Canal</th>
            <th className="px-3.5 py-3 sm:px-6 sm:py-4">Cliente</th>
            <th className="px-3.5 py-3 sm:px-6 sm:py-4 text-right">Líquido / Lucro Real</th>
            <th className="px-3.5 py-3 sm:px-6 sm:py-4 text-center">Status</th>
            <th className="px-3.5 py-3 sm:px-6 sm:py-4 text-right">
              <span className="sr-only">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/40">
          {orders.map((order) => {
            const channel = CHANNEL_CONFIG[order.channel] || {
              label: order.channel,
              dot: "bg-zinc-500",
            };
            const status = STATUS_CONFIG[order.status] || {
              label: order.status,
              bg: "bg-zinc-900 border-zinc-800 text-zinc-400",
            };

            return (
              <tr
                key={order.id}
                onClick={() => onSelectOrder(order)}
                className="hover:bg-zinc-850/50 hover:bg-zinc-800/20 transition-all duration-150 cursor-pointer group"
              >
                {/* 1. Pedido (com HoverCard flutuante revelando foto, tamanho e status de prensagem) */}
                <td className="px-3.5 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                  <OrderHoverPreview order={order}>
                    <div className="inline-flex items-center gap-2 cursor-pointer">
                      <span className="font-mono font-semibold text-zinc-200 group-hover:text-amber-400 transition-colors">
                        {order.orderNumber}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {formatDateShort(order.createdAt)}
                      </span>
                    </div>
                  </OrderHoverPreview>
                </td>

                {/* 2. Canal */}
                <td className="px-3.5 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${channel.dot}`} />
                    <span className="text-zinc-300 font-medium">
                      {channel.label}
                    </span>
                  </div>
                </td>

                {/* 3. Cliente */}
                <td className="px-3.5 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                  <span className="font-medium text-zinc-200">
                    {order.customerName}
                  </span>
                </td>

                {/* 4. Valor Líquido / Lucro Real */}
                <td className="px-3.5 py-3 sm:px-6 sm:py-4 text-right whitespace-nowrap font-mono">
                  <div className="font-semibold text-zinc-200">
                    {formatCurrency(order.netAmount)}
                  </div>
                  <div className="text-[10px] text-emerald-400/90 font-medium">
                    +{formatCurrency(order.netProfit)} lucro
                  </div>
                </td>

                {/* 5. Status */}
                <td className="px-3.5 py-3 sm:px-6 sm:py-4 text-center whitespace-nowrap">
                  <span
                    className={`inline-flex items-center text-[10px] px-2.5 py-0.5 rounded-full font-medium border ${status.bg}`}
                  >
                    {status.label}
                  </span>
                </td>

                {/* Seta discreta indicando que abre gaveta lateral */}
                <td className="px-3.5 py-3 sm:px-6 sm:py-4 text-right whitespace-nowrap text-zinc-600 group-hover:text-zinc-300 transition-colors">
                  <ChevronRight size={14} className="inline group-hover:translate-x-0.5 transition-transform" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
