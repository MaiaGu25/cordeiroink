"use client";

import { useState } from "react";
import { LayoutGrid, Table, Search, PlusCircle, Filter } from "lucide-react";
import { OrdersTable } from "./OrdersTable";
import { OrdersKanban } from "./OrdersKanban";
import { OrderDetailModal } from "./OrderDetailModal";
import { NewOrderModal } from "./NewOrderModal";
import { useRouter } from "next/navigation";

interface OrdersViewProps {
  initialOrders: any[];
  variants: any[];
  initialNewOrderModalOpen?: boolean;
}

export function OrdersView({
  initialOrders,
  variants,
  initialNewOrderModalOpen = false,
}: OrdersViewProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [selectedChannel, setSelectedChannel] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(initialNewOrderModalOpen);

  // Filtros locais
  const filteredOrders = initialOrders.filter((order) => {
    if (selectedChannel !== "ALL" && order.channel !== selectedChannel) {
      return false;
    }
    if (selectedStatus !== "ALL" && order.status !== selectedStatus) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchNumber = order.orderNumber.toLowerCase().includes(q);
      const matchCustomer = order.customerName.toLowerCase().includes(q);
      const matchEmail = order.customerEmail?.toLowerCase().includes(q);
      if (!matchNumber && !matchCustomer && !matchEmail) return false;
    }
    return true;
  });

  const refreshData = () => {
    router.refresh();
  };

  return (
    <div className="space-y-5">
      {/* Top Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search & Channel Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar por pedido ou cliente..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Channel selector */}
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Todos os Canais</option>
            <option value="SHOPEE">Shopee</option>
            <option value="SHEIN">Shein</option>
            <option value="TIKTOK">TikTok Shop</option>
            <option value="MANUAL">Venda Direta / Whats</option>
          </select>

          {/* Status selector (useful for table view) */}
          {viewMode === "table" && (
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">Todos os Status</option>
              <option value="NEW">Novos</option>
              <option value="PAID">Pagos</option>
              <option value="WAITING_PRODUCTION">Fila Produção</option>
              <option value="IN_PRODUCTION">Em Produção</option>
              <option value="READY">Pronto / Embalado</option>
              <option value="SHIPPED">Despachados</option>
              <option value="DELIVERED">Entregues</option>
            </select>
          )}
        </div>

        {/* View Mode Toggle and New Order Action */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center p-1 rounded-lg bg-zinc-900 border border-zinc-800">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md text-xs flex items-center gap-1.5 transition ${
                viewMode === "table"
                  ? "bg-zinc-800 text-amber-400 font-bold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
              title="Visualização em Tabela"
            >
              <Table size={14} />
              <span className="hidden sm:inline">Tabela</span>
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-1.5 rounded-md text-xs flex items-center gap-1.5 transition ${
                viewMode === "kanban"
                  ? "bg-zinc-800 text-amber-400 font-bold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
              title="Visualização em Kanban"
            >
              <LayoutGrid size={14} />
              <span className="hidden sm:inline">Kanban</span>
            </button>
          </div>

          <button
            onClick={() => setIsNewOrderOpen(true)}
            className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
          >
            <PlusCircle size={14} />
            <span>Novo Pedido</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === "table" ? (
        <OrdersTable
          orders={filteredOrders}
          onSelectOrder={(order) => setSelectedOrder(order)}
        />
      ) : (
        <OrdersKanban
          orders={filteredOrders}
          onSelectOrder={(order) => setSelectedOrder(order)}
          onRefresh={refreshData}
        />
      )}

      {/* Modals */}
      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onOrderUpdated={refreshData}
      />

      <NewOrderModal
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
        variants={variants}
        onOrderCreated={refreshData}
      />
    </div>
  );
}
