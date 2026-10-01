"use client";

import { useState } from "react";
import { Shirt, Image as ImageIcon, Package, AlertTriangle, Search, PlusCircle } from "lucide-react";
import { BlankShirtsGrid } from "./BlankShirtsGrid";
import { DtfCatalogGrid } from "./DtfCatalogGrid";
import { PackagingList } from "./PackagingList";
import { QuickStockModal } from "./QuickStockModal";
import { useRouter } from "next/navigation";

interface InventoryViewProps {
  blankShirts: any[];
  dtfPrints: any[];
  supplies: any[];
  criticalItems: any[];
}

export function InventoryView({
  blankShirts,
  dtfPrints,
  supplies,
  criticalItems,
}: InventoryViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"SHIRTS" | "DTF" | "PACKAGING">("SHIRTS");
  const [selectedItemToAdjust, setSelectedItemToAdjust] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const refreshData = () => {
    router.refresh();
  };

  const filterList = (list: any[]) => {
    if (!searchTerm.trim()) return list;
    const q = searchTerm.toLowerCase();
    return list.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.dtfCode?.toLowerCase().includes(q)
    );
  };

  return (
    <div className="space-y-6">
      {/* Critical Stock Notification Banner */}
      {criticalItems.length > 0 && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1 rounded bg-red-500/20 text-red-400">
              <AlertTriangle size={15} />
            </div>
            <div>
              <span className="font-semibold text-red-300">
                Atenção: {criticalItems.length} insumos estão no limite ou abaixo do estoque mínimo de segurança!
              </span>
              <span className="text-[11px] text-zinc-400 block mt-0.5">
                Verifique reposição para não paralisar as ordens de prensagem na estamparia.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
          <button
            onClick={() => setActiveTab("SHIRTS")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
              activeTab === "SHIRTS"
                ? "bg-amber-500 text-zinc-950 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Shirt size={14} />
            <span>Camisetas Lisas ({blankShirts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("DTF")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
              activeTab === "DTF"
                ? "bg-amber-500 text-zinc-950 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <ImageIcon size={14} />
            <span>Banco de Estampas DTF ({dtfPrints.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("PACKAGING")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
              activeTab === "PACKAGING"
                ? "bg-amber-500 text-zinc-950 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Package size={14} />
            <span>Insumos & Embalagens ({supplies.length})</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar insumo ou código..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === "SHIRTS" && (
        <BlankShirtsGrid
          items={filterList(blankShirts)}
          onAdjust={(item) => setSelectedItemToAdjust(item)}
        />
      )}

      {activeTab === "DTF" && (
        <DtfCatalogGrid
          items={filterList(dtfPrints)}
          onAdjust={(item) => setSelectedItemToAdjust(item)}
        />
      )}

      {activeTab === "PACKAGING" && (
        <PackagingList
          items={filterList(supplies)}
          onAdjust={(item) => setSelectedItemToAdjust(item)}
        />
      )}

      {/* Quick Stock Modal */}
      <QuickStockModal
        item={selectedItemToAdjust}
        onClose={() => setSelectedItemToAdjust(null)}
        onStockUpdated={refreshData}
      />
    </div>
  );
}
