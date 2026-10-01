"use client";

import { useTransition } from "react";
import { formatCurrency, CHANNEL_CONFIG, STATUS_CONFIG } from "@/lib/utils";
import { OrderStatus } from "@prisma/client";
import { updateOrderStatus } from "@/actions/orders";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { OrderHoverPreview } from "./OrderHoverPreview";

interface OrdersKanbanProps {
  orders: any[];
  onSelectOrder: (order: any) => void;
  onRefresh?: () => void;
}

const KANBAN_COLUMNS: {
  key: string;
  label: string;
  statusList: OrderStatus[];
  nextStatus?: OrderStatus;
  nextActionLabel?: string;
}[] = [
  {
    key: "new",
    label: "Novos",
    statusList: [OrderStatus.NEW],
    nextStatus: OrderStatus.PAID,
    nextActionLabel: "Pago",
  },
  {
    key: "paid",
    label: "Pagos / Fila",
    statusList: [OrderStatus.PAID, OrderStatus.WAITING_PRODUCTION],
    nextStatus: OrderStatus.IN_PRODUCTION,
    nextActionLabel: "Prensa",
  },
  {
    key: "production",
    label: "Em Prensagem",
    statusList: [OrderStatus.IN_PRODUCTION],
    nextStatus: OrderStatus.READY,
    nextActionLabel: "Pronto",
  },
  {
    key: "ready",
    label: "Pronto / Embalado",
    statusList: [OrderStatus.READY],
    nextStatus: OrderStatus.SHIPPED,
    nextActionLabel: "Despachar",
  },
  {
    key: "shipped",
    label: "Despachados",
    statusList: [OrderStatus.SHIPPED],
    nextStatus: OrderStatus.DELIVERED,
    nextActionLabel: "Entregue",
  },
];

export function OrdersKanban({ orders, onSelectOrder, onRefresh }: OrdersKanbanProps) {
  const [isPending, startTransition] = useTransition();

  const handleAdvance = (orderId: string, orderNumber: string, nextStatus: OrderStatus) => {
    startTransition(async () => {
      try {
        await updateOrderStatus(orderId, nextStatus);
        toast.success(`Pedido ${orderNumber} movido para ${STATUS_CONFIG[nextStatus]?.label || nextStatus}`);
        if (onRefresh) onRefresh();
      } catch (err: any) {
        toast.error("Erro ao mover pedido: " + err.message);
      }
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 overflow-x-auto pb-4">
      {KANBAN_COLUMNS.map((col) => {
        const columnOrders = orders.filter((o) => col.statusList.includes(o.status));

        return (
          <div
            key={col.key}
            className="flex flex-col rounded-2xl bg-zinc-900/30 border border-zinc-800/50 p-3 min-w-[240px] h-[72vh]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800/60">
              <span className="text-xs font-semibold text-zinc-300">
                {col.label}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800/60 text-zinc-400 font-semibold">
                {columnOrders.length}
              </span>
            </div>

            {/* Orders Cards Stack */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {columnOrders.length === 0 && (
                <div className="p-8 text-center text-[11px] text-zinc-600 border border-dashed border-zinc-800/60 rounded-xl">
                  Vazio
                </div>
              )}

              {columnOrders.map((order) => {
                const channel = CHANNEL_CONFIG[order.channel] || { label: order.channel, dot: "bg-zinc-500" };

                return (
                  <OrderHoverPreview key={order.id} order={order}>
                    <div
                      onClick={() => onSelectOrder(order)}
                      className="p-3.5 rounded-xl bg-zinc-950/70 hover:bg-zinc-900/80 border border-zinc-800/60 hover:border-zinc-700/80 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-lg hover:shadow-black/40 group flex flex-col justify-between gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-semibold text-zinc-200 group-hover:text-amber-400 transition-colors">
                          {order.orderNumber}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-medium">
                          <span className={`w-1.5 h-1.5 rounded-full ${channel.dot}`} />
                          <span>{channel.label}</span>
                        </div>
                      </div>

                      <div className="text-xs font-medium text-zinc-300 truncate">
                        {order.customerName}
                      </div>

                      {/* Bottom line: amount & quick action */}
                      <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-xs font-mono">
                        <span className="text-[11px] font-semibold text-zinc-300">
                          {formatCurrency(order.netAmount)}
                        </span>

                        {col.nextStatus && (
                          <button
                            disabled={isPending}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAdvance(order.id, order.orderNumber, col.nextStatus!);
                            }}
                            className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 text-[10px] font-medium flex items-center gap-1 transition-colors border border-zinc-800"
                            title={`Avançar para ${col.nextActionLabel}`}
                          >
                            <span>{col.nextActionLabel}</span>
                            <ArrowRight size={10} />
                          </button>
                        )}
                      </div>
                    </div>
                  </OrderHoverPreview>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
