"use client";

import { useState, useTransition } from "react";
import { Shirt, Image as ImageIcon, Package, AlertTriangle, Search, Plus, Trash2, RotateCcw, X, Loader2 } from "lucide-react";
import { BlankShirtsGrid } from "./BlankShirtsGrid";
import { DtfCatalogGrid } from "./DtfCatalogGrid";
import { PackagingList } from "./PackagingList";
import { QuickStockModal } from "./QuickStockModal";
import { NewDtfModal } from "./NewDtfModal";
import { NewRawItemModal } from "./NewRawItemModal";
import { EditRawItemModal } from "./EditRawItemModal";
import { resetDatabaseToZero, deleteRawItem } from "@/actions/inventory";
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
  const [isDeletePending, startDeleteTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<"SHIRTS" | "DTF" | "PACKAGING">("SHIRTS");
  const [selectedItemToAdjust, setSelectedItemToAdjust] = useState<any | null>(null);
  const [selectedItemToEdit, setSelectedItemToEdit] = useState<any | null>(null);
  const [itemToDelete, setItemToDelete] = useState<any | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetConfirmationText, setResetConfirmationText] = useState("");
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

  const handleExecuteReset = () => {
    if (resetConfirmationText.trim() !== "ZERAR TUDO") return;

    startResetTransition(async () => {
      try {
        await resetDatabaseToZero();
        toast.success("Banco de dados zerado com sucesso! Pronto para inserção real.");
        setIsResetModalOpen(false);
        setResetConfirmationText("");
        router.refresh();
      } catch (err: any) {
        toast.error("Erro ao zerar banco: " + err.message);
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;

    startDeleteTransition(async () => {
      try {
        const res = await deleteRawItem(itemToDelete.id);
        if (res.softDeleted) {
          toast.info(res.message, { duration: 6000 });
        } else {
          toast.success(res.message);
        }
        setItemToDelete(null);
        refreshData();
      } catch (err: any) {
        toast.error(err.message, { duration: 6000 });
      }
    });
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

          {/* Reset Banco Button (Discreto e Seguro com Trava) */}
          <button
            type="button"
            onClick={() => {
              setResetConfirmationText("");
              setIsResetModalOpen(true);
            }}
            title="Limpar todos os dados operacionais e começar do zero (Danger Zone)"
            className="p-2 rounded-xl bg-zinc-900/60 hover:bg-red-950/40 border border-zinc-800/80 hover:border-red-900/50 text-zinc-500 hover:text-red-400 text-xs transition cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw size={13} />
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

      {/* Tab Panels with empty handlers and delete hooks */}
      {activeTab === "SHIRTS" && (
        <BlankShirtsGrid
          items={filterList(blankShirts)}
          onAdjust={(item) => setSelectedItemToAdjust(item)}
          onAddNew={() => handleOpenNewRawItem(RawItemType.BLANK_SHIRT)}
          onDelete={(item) => setItemToDelete(item)}
        />
      )}

      {activeTab === "DTF" && (
        <DtfCatalogGrid
          items={filterList(dtfPrints)}
          onAdjust={(item) => setSelectedItemToAdjust(item)}
          onAddNew={() => handleOpenNewRawItem(RawItemType.DTF_PRINT)}
          onDelete={(item) => setItemToDelete(item)}
        />
      )}

      {activeTab === "PACKAGING" && (
        <PackagingList
          items={filterList(supplies)}
          onAdjust={(item) => setSelectedItemToAdjust(item)}
          onAddNew={() => handleOpenNewRawItem(RawItemType.PACKAGING)}
          onDelete={(item) => setItemToDelete(item)}
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
        onOpenEdit={(item) => setSelectedItemToEdit(item)}
        onDelete={(item) => setItemToDelete(item)}
      />

      {/* Edit Raw Item Modal */}
      <EditRawItemModal
        item={selectedItemToEdit}
        isOpen={Boolean(selectedItemToEdit)}
        onClose={() => setSelectedItemToEdit(null)}
        onUpdated={refreshData}
      />

      {/* New DTF Art Modal */}
      <NewDtfModal
        isOpen={isNewDtfOpen}
        onClose={() => setIsNewDtfOpen(false)}
        onCreated={refreshData}
        suppliers={suppliers}
      />

      {/* Danger Zone: Modal de Zerar Banco de Dados */}
      {isResetModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => {
            if (!isResetPending) {
              setIsResetModalOpen(false);
              setResetConfirmationText("");
            }
          }}
        >
          <div
            className="w-full max-w-md bg-zinc-950 border border-red-500/40 rounded-2xl shadow-2xl p-6 text-zinc-100 space-y-5"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-red-400 uppercase tracking-wide">
                    Zona de Perigo Extremo
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Zerar Todo o Banco de Dados
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isResetPending}
                onClick={() => {
                  setIsResetModalOpen(false);
                  setResetConfirmationText("");
                }}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Warning Details */}
            <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-900/50 space-y-2 text-xs text-zinc-300 leading-relaxed">
              <p className="font-semibold text-red-300">
                Esta ação é definitiva, destrutiva e irreversível.
              </p>
              <p className="text-zinc-400">
                Todos os pedidos, movimentações financeiras, histórico de produção, insumos cadastrados e logs de auditoria serão <strong className="text-red-400 font-bold">apagados permanentemente</strong> para inserção de dados do zero.
              </p>
            </div>

            {/* Safety Lock Input */}
            <div className="space-y-2">
              <label className="block text-xs text-zinc-300 font-medium">
                Para desbloquear a confirmação, digite exatamente <span className="font-mono font-bold text-red-400 px-1.5 py-0.5 rounded bg-red-950/60 border border-red-800/60 select-all">ZERAR TUDO</span> abaixo:
              </label>
              <input
                type="text"
                autoFocus
                value={resetConfirmationText}
                onChange={(e) => setResetConfirmationText(e.target.value)}
                placeholder='Digite "ZERAR TUDO"'
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 font-mono text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isResetPending}
                onClick={() => {
                  setIsResetModalOpen(false);
                  setResetConfirmationText("");
                }}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={resetConfirmationText.trim() !== "ZERAR TUDO" || isResetPending}
                onClick={handleExecuteReset}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                  resetConfirmationText.trim() === "ZERAR TUDO" && !isResetPending
                    ? "bg-red-600 hover:bg-red-500 text-white cursor-pointer shadow-lg shadow-red-950/60"
                    : "bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed opacity-50"
                }`}
              >
                {isResetPending ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Zerando banco...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={13} />
                    <span>Zerar Tudo Definitivamente</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Exclusão Individual de Insumo */}
      {itemToDelete && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => {
            if (!isDeletePending) setItemToDelete(null);
          }}
        >
          <div
            className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 text-zinc-100 space-y-4"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                  <Trash2 size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">
                    Excluir Insumo
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    SKU: {itemToDelete.sku}
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isDeletePending}
                onClick={() => setItemToDelete(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
              <p className="text-xs font-semibold text-zinc-200">
                {itemToDelete.name}
              </p>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Deseja remover este insumo do estoque? Caso ele já tenha sido utilizado em pedidos ou histórico de produção, ele será automaticamente <strong className="text-zinc-200 font-medium">arquivado</strong> para não quebrar seus relatórios.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeletePending}
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={isDeletePending}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isDeletePending ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={13} />
                    <span>Confirmar Exclusão</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
