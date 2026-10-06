"use client";

import { useState, useTransition } from "react";
import { Shirt, Image as ImageIcon, Package, AlertTriangle, Search, Plus, Trash2, RotateCcw } from "lucide-react";
import { BlankShirtsGrid } from "./BlankShirtsGrid";
import { DtfCatalogGrid } from "./DtfCatalogGrid";
import { PackagingList } from "./PackagingList";
import { QuickStockModal } from "./QuickStockModal";
import { NewDtfModal } from "./NewDtfModal";
import { NewRawItemModal } from "./NewRawItemModal";
import { resetDatabaseToZero } from "@/actions/inventory";
import { RawItemType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface InventoryViewProps {
  blankShirts: any[];
  dtfPrints: any[];
  supplies: any[];
  criticalItems: any[];
  suppliers?: any[];
}

export function InventoryView({
  blankShirts,
  dtfPrints,
  supplies,
  criticalItems,
  suppliers = [],
}: InventoryViewProps) {
  const router = useRouter();
  const [isResetPending, startResetTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<"SHIRTS" | "DTF" | "PACKAGING">("SHIRTS");
  const [selectedItemToAdjust, setSelectedItemToAdjust] = useState<any | null>(null);
  const [isNewRawItemOpen, setIsNewRawItemOpen] = useState(false);
  const [isNewDtfOpen, setIsNewDtfOpen] = useState(false);
  const [newRawItemDefaultType, setNewRawItemDefaultType] = useState<RawItemType>(RawItemType.BLANK_SHIRT);
  const [searchTerm, setSearchTerm] = useState("");

  const refreshData = () => {
    router.refresh();
  };

  const handleOpenNewRawItem = (defaultType?: RawItemType) => {
    const t = defaultType || (activeTab === "SHIRTS" ? RawItemType.BLANK_SHIRT : activeTab === "DTF" ? RawItemType.DTF_PRINT : RawItemType.PACKAGING);
    setNewRawItemDefaultType(t);
    setIsNewRawItemOpen(true);
  };

  const handleResetDatabase = () => {
    if (confirm("ATENÇÃO: Deseja zerar completamente todos os dados do banco (insumos antigos, pedidos e histórico) para cadastrar seus dados reais de hoje? Esta ação não pode ser desfeita.")) {
      startResetTransition(async () => {
        try {
          await resetDatabaseToZero();
          toast.success("Banco de dados zerado com sucesso! Pronto para inserção real.");
          router.refresh();
        } catch (err: any) {
          toast.error("Erro ao zerar banco: " + err.message);
        }
      });
    }
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Navigation Tabs with refined monochromatic states */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900/60 border border-zinc-800/80 overflow-x-auto">
          <button
            onClick={() => setActiveTab("SHIRTS")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
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
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
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
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === "PACKAGING"
                ? "bg-zinc-800 text-zinc-100 shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Package size={14} />
            <span>Insumos & Embalagens ({supplies.length})</span>
          </button>
        </div>

        {/* Search Bar & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative w-full sm:w-56">
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

          {/* Reset Banco Button (Discreto e Seguro) */}
          <button
            type="button"
            onClick={handleResetDatabase}
            disabled={isResetPending}
            title="Limpar todos os dados e começar do zero"
            className="p-2 rounded-xl bg-zinc-900/60 hover:bg-red-950/40 border border-zinc-800/80 hover:border-red-900/50 text-zinc-500 hover:text-red-400 text-xs transition cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw size={13} className={isResetPending ? "animate-spin" : ""} />
            <span className="hidden xl:inline text-[11px]">Zerar Banco</span>
          </button>

          {/* Primary Action Buttons per Tab */}
          {activeTab === "DTF" ? (
            <button
              onClick={() => setIsNewDtfOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Plus size={14} />
              <span>+ Nova Estampa / DTF</span>
            </button>
          ) : activeTab === "SHIRTS" ? (
            <button
              onClick={() => handleOpenNewRawItem(RawItemType.BLANK_SHIRT)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Plus size={14} />
              <span>+ Cadastrar Camiseta Lisa</span>
            </button>
          ) : (
            <button
              onClick={() => handleOpenNewRawItem(RawItemType.PACKAGING)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Plus size={14} />
              <span>+ Cadastrar Embalagem / Insumo</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Panels with empty handlers */}
      {activeTab === "SHIRTS" && (
        <BlankShirtsGrid
          items={filterList(blankShirts)}
          onAdjust={(item) => setSelectedItemToAdjust(item)}
          onAddNew={() => handleOpenNewRawItem(RawItemType.BLANK_SHIRT)}
        />
      )}

      {activeTab === "DTF" && (
        <DtfCatalogGrid
          items={filterList(dtfPrints)}
          onAdjust={(item) => setSelectedItemToAdjust(item)}
          onAddNew={() => handleOpenNewRawItem(RawItemType.DTF_PRINT)}
        />
      )}

      {activeTab === "PACKAGING" && (
        <PackagingList
          items={filterList(supplies)}
          onAdjust={(item) => setSelectedItemToAdjust(item)}
          onAddNew={() => handleOpenNewRawItem(RawItemType.PACKAGING)}
        />
      )}

      {/* Modal de Cadastro de Insumo / Camiseta Lisa */}
      <NewRawItemModal
        isOpen={isNewRawItemOpen}
        onClose={() => setIsNewRawItemOpen(false)}
        onCreated={refreshData}
        initialType={newRawItemDefaultType}
      />

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
        suppliers={suppliers}
      />
    </div>
  );
}
