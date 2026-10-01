"use client";

import { useState } from "react";
import { LayoutGrid, Table, Search, Plus } from "lucide-react";
import { OrdersTable } from "./OrdersTable";
import { OrdersKanban } from "./OrdersKanban";
import { OrderSheet } from "./OrderSheet";
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
    <div className="space-y-6">
      {/* Top Controls Bar with clean spacing */}
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
              placeholder="Buscar pedido ou cliente..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
            />
          </div>

          {/* Channel selector */}
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-xs text-zinc-300 focus:outline-none focus:border-zinc-600 transition-colors cursor-pointer"
          >
            <option value="ALL">Todos os Canais</option>
            <option value="SHOPEE">Shopee</option>
            <option value="SHEIN">Shein</option>
            <option value="TIKTOK">TikTok Shop</option>
            <option value="MANUAL">Whats Direct</option>
          </select>

          {/* Status selector (useful for table view) */}
          {viewMode === "table" && (
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-xs text-zinc-300 focus:outline-none focus:border-zinc-600 transition-colors cursor-pointer"
            >
              <option value="ALL">Todos os Status</option>
              <option value="NEW">Novos</option>
              <option value="PAID">Pagos</option>
              <option value="IN_PRODUCTION">Em Produção</option>
              <option value="READY">Prontos</option>
              <option value="SHIPPED">Despachados</option>
              <option value="DELIVERED">Entregues</option>
            </select>
          )}
        </div>

        {/* View Mode Toggle and New Order Action */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center p-1 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1.5 transition ${
                viewMode === "table"
                  ? "bg-zinc-800 text-zinc-100 font-semibold"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
              title="Visualização em Tabela"
            >
              <Table size={14} />
              <span className="hidden sm:inline">Tabela</span>
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1.5 transition ${
                viewMode === "kanban"
                  ? "bg-zinc-800 text-zinc-100 font-semibold"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
              title="Visualização em Kanban"
            >
              <LayoutGrid size={14} />
              <span className="hidden sm:inline">Kanban</span>
            </button>
          </div>

          <button
            onClick={() => setIsNewOrderOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <Plus size={14} />
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

      {/* Slide-over Drawer for Order Details */}
      <OrderSheet
        order={selectedOrder}
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        onOrderUpdated={refreshData}
      />

      {/* New Manual Order Modal */}
      <NewOrderModal
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
        variants={variants}
        onOrderCreated={refreshData}
      />
    </div>
  );
}
