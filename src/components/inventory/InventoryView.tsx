"use client";

import { useState } from "react";
import { Shirt, Image as ImageIcon, Package, AlertTriangle, Search, Plus } from "lucide-react";
import { BlankShirtsGrid } from "./BlankShirtsGrid";
import { DtfCatalogGrid } from "./DtfCatalogGrid";
import { PackagingList } from "./PackagingList";
import { QuickStockModal } from "./QuickStockModal";
import { NewDtfModal } from "./NewDtfModal";
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
  const [isNewDtfOpen, setIsNewDtfOpen] = useState(false);
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
      {/* Quiet Critical Stock Notification (only if critical items exist) */}
      {criticalItems.length > 0 && (
        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-red-500/20 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
            <span className="text-zinc-300">
              {criticalItems.length} insumos requerem reposição programada antes de afetar a fila de prensagem.
            </span>
          </div>
          <span className="text-[10px] font-mono text-red-400 font-semibold uppercase">
            Atenção Estoque
          </span>
        </div>
      )}

      {/* Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Navigation Tabs with refined monochromatic states */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
          <button
            onClick={() => setActiveTab("SHIRTS")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
              activeTab === "SHIRTS"
                ? "bg-zinc-800 text-zinc-100 shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Shirt size={14} />
            <span>Camisetas Lisas ({blankShirts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("DTF")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
              activeTab === "DTF"
                ? "bg-zinc-800 text-zinc-100 shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <ImageIcon size={14} />
            <span>Banco de Estampas ({dtfPrints.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("PACKAGING")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
              activeTab === "PACKAGING"
                ? "bg-zinc-800 text-zinc-100 shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Package size={14} />
            <span>Insumos & Embalagens ({supplies.length})</span>
          </button>
        </div>

        {/* Search Bar & Action */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-60">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar insumo ou arte..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
            />
          </div>

          {activeTab === "DTF" && (
            <button
              onClick={() => setIsNewDtfOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition-colors shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Plus size={13} />
              <span>Nova Arte DTF</span>
            </button>
          )}
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

      {/* New DTF Art Modal */}
      <NewDtfModal
        isOpen={isNewDtfOpen}
        onClose={() => setIsNewDtfOpen(false)}
        onCreated={refreshData}
      />
    </div>
  );
}
