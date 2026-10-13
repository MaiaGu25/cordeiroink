"use client";

import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Truck,
  RotateCcw,
  Search,
  Filter,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  ShoppingBag,
  User,
  Clock,
  Layers,
} from "lucide-react";
import { formatCurrency, formatDateShort, formatDate, CHANNEL_CONFIG, STATUS_CONFIG } from "@/lib/utils";
import { OrderSheet } from "@/components/orders/OrderSheet";
import { useRouter } from "next/navigation";

interface ProductionHistoryViewProps {
  orders: any[];
}

export function ProductionHistoryView({ orders }: ProductionHistoryViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"ALL" | "READY" | "SHIPPED" | "CANCELLED" | "REWORK">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const completedCount = orders.filter(
    (o) => o.status === "READY" || o.status === "SHIPPED" || o.status === "DELIVERED"
  ).length;
  const cancelledCount = orders.filter((o) => o.status === "CANCELLED").length;
  const reworkCount = orders.filter((o) => (o.productionJob?.reworkCount || 0) > 0).length;
  const totalFinishedOrCancelled = completedCount + cancelledCount;
  const successRate = totalFinishedOrCancelled > 0
    ? Math.round((completedCount / totalFinishedOrCancelled) * 100)
    : 100;

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "READY" && order.status !== "READY") return false;
    if (activeTab === "SHIPPED" && order.status !== "SHIPPED" && order.status !== "DELIVERED") return false;
    if (activeTab === "CANCELLED" && order.status !== "CANCELLED") return false;
    if (activeTab === "REWORK" && (order.productionJob?.reworkCount || 0) === 0) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchNum = order.orderNumber.toLowerCase().includes(q);
      const matchCust = order.customerName.toLowerCase().includes(q);
      const firstItem = order.items?.[0];
      const matchArt = (firstItem?.artTitle || firstItem?.title || "").toLowerCase().includes(q);
      if (!matchNum && !matchCust && !matchArt) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/70 backdrop-blur-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Concluídos com Sucesso</span>
            <CheckCircle2 size={15} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-100">
            {completedCount}
          </div>
          <span className="text-[10px] text-emerald-400 font-medium">
            Prontos ou despachados
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/70 backdrop-blur-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Cancelados & Estornados</span>
            <XCircle size={15} className="text-red-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-100">
            {cancelledCount}
          </div>
          <span className="text-[10px] text-zinc-500 font-medium">
            Estoque devolvido
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/70 backdrop-blur-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Perdas na Prensa</span>
            <AlertTriangle size={15} className="text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-100">
            {reworkCount}
          </div>
          <span className="text-[10px] text-amber-400 font-medium">
            Registros de retrabalho
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/70 backdrop-blur-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Aproveitamento</span>
            <span className="text-xs font-mono text-emerald-400 font-bold">{successRate}%</span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {successRate}%
          </div>
          <span className="text-[10px] text-zinc-400 font-medium">
            Eficiência operacional
          </span>
        </div>
      </div>

      {/* Top Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900/60 border border-zinc-800/80 overflow-x-auto">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === "ALL"
                ? "bg-zinc-800 text-zinc-100 shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Layers size={13} />
            <span>Todos ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("READY")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === "READY"
                ? "bg-zinc-800 text-zinc-100 shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <CheckCircle2 size={13} className="text-emerald-400" />
            <span>Prontos</span>
          </button>

          <button
            onClick={() => setActiveTab("SHIPPED")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === "SHIPPED"
                ? "bg-zinc-800 text-zinc-100 shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Truck size={13} className="text-sky-400" />
            <span>Despachados / Entregues</span>
          </button>

          <button
            onClick={() => setActiveTab("CANCELLED")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === "CANCELLED"
                ? "bg-zinc-800 text-zinc-100 shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <XCircle size={13} className="text-red-400" />
            <span>Cancelados ({cancelledCount})</span>
          </button>

          <button
            onClick={() => setActiveTab("REWORK")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === "REWORK"
                ? "bg-zinc-800 text-zinc-100 shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <AlertTriangle size={13} className="text-amber-400" />
            <span>Com Perda ({reworkCount})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar no histórico..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600 transition"
          />
        </div>
      </div>

      {/* Responsive Table */}
      {filteredOrders.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-zinc-900/30 border border-zinc-800/60 text-zinc-500 text-xs space-y-1">
          <p>Nenhum pedido finalizado ou cancelado encontrado com este filtro.</p>
          <p className="text-[11px] text-zinc-600">
            Conforme as ordens de produção forem prensadas ou canceladas, elas serão arquivadas aqui.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-800/60 bg-zinc-900/30 backdrop-blur-sm shadow-sm">
          <table className="w-full text-left text-xs whitespace-nowrap min-w-[700px]">
            <thead>
              <tr className="border-b border-zinc-800/60 bg-zinc-950/40 text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                <th className="px-4 py-3 sm:px-6 sm:py-4">Pedido & Canal</th>
                <th className="px-4 py-3 sm:px-6 sm:py-4">Cliente</th>
                <th className="px-4 py-3 sm:px-6 sm:py-4">Peça / Estampa</th>
                <th className="px-4 py-3 sm:px-6 sm:py-4 text-center">Retrabalho</th>
                <th className="px-4 py-3 sm:px-6 sm:py-4 text-center">Status Final</th>
                <th className="px-4 py-3 sm:px-6 sm:py-4 text-right">Líquido / Lucro</th>
                <th className="px-4 py-3 sm:px-6 sm:py-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {filteredOrders.map((order) => {
                const channel = CHANNEL_CONFIG[order.channel] || {
                  label: order.channel,
                  dot: "bg-zinc-500",
                };
                const status = STATUS_CONFIG[order.status] || {
                  label: order.status,
                  bg: "bg-zinc-900 border-zinc-800 text-zinc-400",
                };
                const firstItem = order.items?.[0];
                const reworks = order.productionJob?.reworkCount || 0;

                return (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="hover:bg-zinc-800/20 transition-all duration-150 cursor-pointer group"
                  >
                    {/* 1. Pedido */}
                    <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-zinc-200 group-hover:text-amber-400 transition-colors">
                            {order.orderNumber}
                          </span>
                          <span className={`w-1.5 h-1.5 rounded-full ${channel.dot}`} />
                          <span className="text-[10px] text-zinc-400 font-medium">
                            {channel.label}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono mt-0.5">
                          {formatDate(order.cancelledAt || order.updatedAt || order.createdAt)}
                        </span>
                      </div>
                    </td>

                    {/* 2. Cliente */}
                    <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                      <span className="font-medium text-zinc-200 block">
                        {order.customerName}
                      </span>
                      {order.customerPhone && (
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {order.customerPhone}
                        </span>
                      )}
                    </td>

                    {/* 3. Peça / Estampa */}
                    <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-zinc-200 font-medium">
                          {firstItem?.artTitle || firstItem?.title || "Camiseta Personalizada"}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {firstItem?.shirtSize || "M"} • {firstItem?.shirtColor || "Preto"} (
                          {firstItem?.printSize || "A3"})
                        </span>
                      </div>
                    </td>

                    {/* 4. Retrabalho */}
                    <td className="px-4 py-3 sm:px-6 sm:py-4 text-center whitespace-nowrap">
                      {reworks > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          <AlertTriangle size={10} />
                          {reworks} perda(s)
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-600 font-mono">
                          0
                        </span>
                      )}
                    </td>

                    {/* 5. Status Final */}
                    <td className="px-4 py-3 sm:px-6 sm:py-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center text-[10px] px-2.5 py-0.5 rounded-full font-medium border ${status.bg}`}
                      >
                        {status.label}
                      </span>
                      {order.status === "CANCELLED" && order.cancelledBy && (
                        <span className="block text-[9px] text-zinc-500 mt-0.5">
                          por {order.cancelledBy}
                        </span>
                      )}
                    </td>

                    {/* 6. Financeiro */}
                    <td className="px-4 py-3 sm:px-6 sm:py-4 text-right whitespace-nowrap font-mono">
                      <div className="font-semibold text-zinc-200">
                        {formatCurrency(order.netAmount)}
                      </div>
                      <div
                        className={`text-[10px] font-medium ${
                          order.status === "CANCELLED"
                            ? "text-red-400/90"
                            : "text-emerald-400/90"
                        }`}
                      >
                        {order.status === "CANCELLED"
                          ? "Estornado"
                          : `+${formatCurrency(order.netProfit)} lucro`}
                      </div>
                    </td>

                    {/* 7. Ação */}
                    <td className="px-4 py-3 sm:px-6 sm:py-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(order);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-[11px] font-medium transition"
                      >
                        Ver Detalhes
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Slide-over Drawer for Order Details and Timeline */}
      <OrderSheet
        order={selectedOrder}
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        onOrderUpdated={() => router.refresh()}
      />
    </div>
  );
}
