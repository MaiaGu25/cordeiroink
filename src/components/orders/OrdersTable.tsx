"use client";

import { Eye, Flame, ShoppingBag, ArrowUpDown, ChevronRight } from "lucide-react";
import { formatCurrency, formatDate, CHANNEL_CONFIG, STATUS_CONFIG } from "@/lib/utils";

interface OrdersTableProps {
  orders: any[];
  onSelectOrder: (order: any) => void;
}

export function OrdersTable({ orders, onSelectOrder }: OrdersTableProps) {
  if (orders.length === 0) {
    return (
      <div className="p-12 text-center rounded-xl bg-zinc-900/40 border border-zinc-800 text-zinc-400 text-xs">
        Nenhum pedido encontrado para os filtros selecionados.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800/80 bg-zinc-900/60 shadow-sm">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-950/60 text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">
            <th className="px-4 py-3.5">Pedido / Canal</th>
            <th className="px-4 py-3.5">Data / Hora</th>
            <th className="px-4 py-3.5">Cliente</th>
            <th className="px-4 py-3.5">Itens & Estampas</th>
            <th className="px-4 py-3.5 text-right">Líquido</th>
            <th className="px-4 py-3.5 text-right">Lucro Real</th>
            <th className="px-4 py-3.5 text-center">Status</th>
            <th className="px-4 py-3.5 text-center">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/60">
          {orders.map((order) => {
            const channel = CHANNEL_CONFIG[order.channel] || {
              label: order.channel,
              bg: "bg-zinc-800",
              text: "text-zinc-300",
              border: "border-zinc-700",
            };
            const status = STATUS_CONFIG[order.status] || {
              label: order.status,
              bg: "bg-zinc-800 border-zinc-700",
              text: "text-zinc-300",
              dot: "bg-zinc-400",
            };

            const totalQuantity = order.items?.reduce(
              (acc: number, item: any) => acc + item.quantity,
              0
            ) || 0;

            return (
              <tr
                key={order.id}
                onClick={() => onSelectOrder(order)}
                className="hover:bg-zinc-800/40 transition cursor-pointer group"
              >
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-400 group-hover:underline">
                      {order.orderNumber}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-medium border ${channel.bg} ${channel.text} ${channel.border}`}
                    >
                      {channel.label}
                    </span>
                  </div>
                </td>

                <td className="px-4 py-3.5 whitespace-nowrap text-zinc-400 text-[11px]">
                  {formatDate(order.createdAt)}
                </td>

                <td className="px-4 py-3.5 whitespace-nowrap">
                  <div className="font-medium text-zinc-200">
                    {order.customerName}
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    {order.customerPhone || order.customerEmail || "Venda Direta"}
                  </div>
                </td>

                <td className="px-4 py-3.5">
                  <div className="flex flex-col gap-0.5">
                    {order.items?.map((item: any) => (
                      <span
                        key={item.id}
                        className="text-[11px] text-zinc-300 truncate max-w-[240px]"
                        title={item.variant?.product?.name}
                      >
                        {item.quantity}x {item.variant?.product?.name} ({item.variant?.title})
                      </span>
                    ))}
                    {totalQuantity > 1 && (
                      <span className="text-[10px] text-zinc-500 font-mono">
                        Total: {totalQuantity} peças
                      </span>
                    )}
                  </div>
                </td>

                <td className="px-4 py-3.5 text-right whitespace-nowrap font-mono font-semibold text-zinc-200">
                  {formatCurrency(order.netAmount)}
                </td>

                <td className="px-4 py-3.5 text-right whitespace-nowrap font-mono font-bold text-emerald-400">
                  {formatCurrency(order.netProfit)}
                </td>

                <td className="px-4 py-3.5 text-center whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full font-medium border ${status.bg}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                    {status.label}
                  </span>
                </td>

                <td className="px-4 py-3.5 text-center whitespace-nowrap">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectOrder(order);
                    }}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100 transition"
                    title="Ver detalhes do pedido"
                  >
                    <Eye size={13} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
