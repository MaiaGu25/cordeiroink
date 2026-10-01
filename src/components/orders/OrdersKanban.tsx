"use client";

import { useTransition } from "react";
import { formatCurrency, CHANNEL_CONFIG, STATUS_CONFIG } from "@/lib/utils";
import { OrderStatus } from "@prisma/client";
import { updateOrderStatus } from "@/actions/orders";
import { toast } from "sonner";
import { ArrowRight, Flame, CheckCircle, Truck, ShoppingBag, Clock } from "lucide-react";

interface OrdersKanbanProps {
  orders: any[];
  onSelectOrder: (order: any) => void;
  onRefresh?: () => void;
}

const KANBAN_COLUMNS: {
  key: string;
  label: string;
  statusList: OrderStatus[];
  headerColor: string;
  nextStatus?: OrderStatus;
  nextActionLabel?: string;
}[] = [
  {
    key: "new",
    label: "Novos",
    statusList: [OrderStatus.NEW],
    headerColor: "text-zinc-300 border-zinc-700",
    nextStatus: OrderStatus.PAID,
    nextActionLabel: "Marcar Pago",
  },
  {
    key: "paid",
    label: "Pagos / Fila",
    statusList: [OrderStatus.PAID, OrderStatus.WAITING_PRODUCTION],
    headerColor: "text-blue-400 border-blue-500/30",
    nextStatus: OrderStatus.IN_PRODUCTION,
    nextActionLabel: "Pôr na Prensa",
  },
  {
    key: "production",
    label: "Em Produção / Prensagem",
    statusList: [OrderStatus.IN_PRODUCTION],
    headerColor: "text-amber-400 border-amber-500/30",
    nextStatus: OrderStatus.READY,
    nextActionLabel: "Finalizar & Embalar",
  },
  {
    key: "ready",
    label: "Pronto / Expedição",
    statusList: [OrderStatus.READY],
    headerColor: "text-emerald-400 border-emerald-500/30",
    nextStatus: OrderStatus.SHIPPED,
    nextActionLabel: "Despachar",
  },
  {
    key: "shipped",
    label: "Despachado / A Caminho",
    statusList: [OrderStatus.SHIPPED],
    headerColor: "text-sky-400 border-sky-500/30",
    nextStatus: OrderStatus.DELIVERED,
    nextActionLabel: "Confirmar Entrega",
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
            className="flex flex-col rounded-xl bg-zinc-900/60 border border-zinc-800/80 p-3 min-w-[260px] h-[75vh]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
              <span className={`text-xs font-bold tracking-wider uppercase ${col.headerColor}`}>
                {col.label}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-semibold">
                {columnOrders.length}
              </span>
            </div>

            {/* Orders Cards Stack */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {columnOrders.length === 0 && (
                <div className="p-6 text-center text-[11px] text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
                  Sem pedidos nesta etapa
                </div>
              )}

              {columnOrders.map((order) => {
                const channel = CHANNEL_CONFIG[order.channel] || { label: order.channel };

                return (
                  <div
                    key={order.id}
                    onClick={() => onSelectOrder(order)}
                    className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-950 transition cursor-pointer group shadow-sm flex flex-col justify-between gap-2.5"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-xs font-bold text-amber-400 group-hover:underline">
                          {order.orderNumber}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-semibold border ${channel.bg} ${channel.text} ${channel.border}`}
                        >
                          {channel.label}
                        </span>
                      </div>

                      <div className="text-xs font-medium text-zinc-200 truncate">
                        {order.customerName}
                      </div>

                      {/* Items */}
                      <div className="mt-2 space-y-1">
                        {order.items?.map((item: any) => (
                          <div
                            key={item.id}
                            className="text-[11px] text-zinc-400 flex items-center justify-between truncate"
                          >
                            <span className="truncate">
                              {item.quantity}x {item.variant?.product?.name}
                            </span>
                            <span className="text-[10px] text-zinc-500 shrink-0 font-mono ml-1">
                              {item.variant?.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Pricing & Advance Button */}
                    <div className="pt-2 border-t border-zinc-900 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-zinc-500">Líquido / Lucro</div>
                        <div className="text-xs font-mono font-bold text-zinc-200">
                          {formatCurrency(order.netAmount)}
                        </div>
                      </div>

                      {col.nextStatus && (
                        <button
                          disabled={isPending}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAdvance(order.id, order.orderNumber, col.nextStatus!);
                          }}
                          className="px-2 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-amber-400 hover:text-amber-300 text-[10px] font-semibold flex items-center gap-1 transition"
                          title={col.nextActionLabel}
                        >
                          <span>{col.nextActionLabel}</span>
                          <ArrowRight size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
