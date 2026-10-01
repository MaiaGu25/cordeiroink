"use client";

import { useState } from "react";
import { ProductionJobCard } from "./ProductionJobCard";
import { Flame, CheckCircle, Clock, Search, Layers, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProductionQueueViewProps {
  initialJobs: any[];
}

export function ProductionQueueView({ initialJobs }: ProductionQueueViewProps) {
  const router = useRouter();
  const [filterTab, setFilterTab] = useState<"ACTIVE" | "PENDING" | "COMPLETED">("ACTIVE");
  const [searchTerm, setSearchTerm] = useState("");

  const refreshData = () => {
    router.refresh();
  };

  const filteredJobs = initialJobs.filter((job) => {
    if (filterTab === "ACTIVE" && job.stepCompleted) return false;
    if (filterTab === "PENDING" && (job.stepCompleted || job.stepPressed || job.stepBlankPicked)) return false;
    if (filterTab === "COMPLETED" && !job.stepCompleted) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchOrder = job.order.orderNumber.toLowerCase().includes(q);
      const matchCustomer = job.order.customerName.toLowerCase().includes(q);
      if (!matchOrder && !matchCustomer) return false;
    }
    return true;
  });

  const activeCount = initialJobs.filter((j) => !j.stepCompleted).length;
  const completedCount = initialJobs.filter((j) => j.stepCompleted).length;

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
          <button
            onClick={() => setFilterTab("ACTIVE")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              filterTab === "ACTIVE"
                ? "bg-amber-500 text-zinc-950 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Flame size={14} />
            <span>Fila Ativa ({activeCount})</span>
          </button>

          <button
            onClick={() => setFilterTab("COMPLETED")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              filterTab === "COMPLETED"
                ? "bg-amber-500 text-zinc-950 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <CheckCircle size={14} />
            <span>Concluídos ({completedCount})</span>
          </button>
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar pedido na fila..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            onClick={refreshData}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
            title="Atualizar fila"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Grid of Production Jobs */}
      {filteredJobs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800 text-zinc-400 text-xs space-y-2">
          <p>Nenhuma ordem de produção encontrada nesta visualização.</p>
          <p className="text-[11px] text-zinc-500">
            Novos pedidos pagos na Shopee, Shein, TikTok ou WhatsApp entram automaticamente aqui.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map((job) => (
            <ProductionJobCard
              key={job.id}
              job={job}
              onRefresh={refreshData}
            />
          ))}
        </div>
      )}
    </div>
  );
}
