"use client";

import { useState, useTransition, useEffect } from "react";
import { X, Edit, Trash2, Power, Loader2, Save, AlertTriangle } from "lucide-react";
import { updateRawItem, deleteRawItem, toggleRawItemActive } from "@/actions/inventory";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { RawItemType } from "@prisma/client";

interface EditRawItemModalProps {
  item: any | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

export function EditRawItemModal({
  item,
  isOpen,
  onClose,
  onUpdated,
}: EditRawItemModalProps) {
  const [isPending, startTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();
  const [isTogglePending, startToggleTransition] = useTransition();

  const [name, setName] = useState(item?.name || "");
  const [description, setDescription] = useState(item?.description || "");
  const [sellingPrice, setSellingPrice] = useState<number | "">(item?.sellingPrice ?? 0);
  const [costPrice, setCostPrice] = useState<number | "">(item?.costPrice ?? 0);
  const [minStock, setMinStock] = useState<number | "">(item?.minStock ?? 5);
  const [shirtModel, setShirtModel] = useState(item?.shirtModel || "");
  const [shirtColor, setShirtColor] = useState(item?.shirtColor || "");
  const [shirtSize, setShirtSize] = useState(item?.shirtSize || "M");
  const [dtfCode, setDtfCode] = useState(item?.dtfCode || "");
  const [dtfPrintSize, setDtfPrintSize] = useState(item?.dtfPrintSize || "A3 (30x42cm)");
  const [dtfSupplier, setDtfSupplier] = useState(item?.dtfSupplier || "Birô DTF Express");
  const [isActive, setIsActive] = useState<boolean>(item?.isActive !== false);

  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (item) {
      setName(item.name || "");
      setDescription(item.description || "");
      setSellingPrice(item.sellingPrice ?? 0);
      setCostPrice(item.costPrice || 0);
      setMinStock(item.minStock || 5);
      setShirtModel(item.shirtModel || "");
      setShirtColor(item.shirtColor || "");
      setShirtSize(item.shirtSize || "M");
      setDtfCode(item.dtfCode || "");
      setDtfPrintSize(item.dtfPrintSize || "A3 (30x42cm)");
      setDtfSupplier(item.dtfSupplier || "Birô DTF Express");
      setIsActive(item.isActive !== false);
      setConfirmingDelete(false);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        await updateRawItem(item.id, {
          name,
          description: description.trim() || undefined,
          sellingPrice: typeof sellingPrice === "number" ? sellingPrice : parseFloat(String(sellingPrice).replace(",", ".")) || 0,
          costPrice: typeof costPrice === "number" ? costPrice : parseFloat(String(costPrice).replace(",", ".")) || 0,
          minStock: Number(minStock) || 0,
          shirtModel: item.type === RawItemType.BLANK_SHIRT ? shirtModel : undefined,
          shirtColor: item.type === RawItemType.BLANK_SHIRT ? shirtColor : undefined,
          shirtSize: item.type === RawItemType.BLANK_SHIRT ? shirtSize : undefined,
          dtfCode: item.type === RawItemType.DTF_PRINT ? dtfCode : undefined,
          dtfPrintSize: item.type === RawItemType.DTF_PRINT ? dtfPrintSize : undefined,
          dtfSupplier: item.type === RawItemType.DTF_PRINT ? dtfSupplier : undefined,
          isActive,
        });

        toast.success(`Insumo "${name}" atualizado com sucesso!`);
        if (onUpdated) onUpdated();
        onClose();
      } catch (err: any) {
        toast.error("Erro ao atualizar: " + err.message);
      }
    });
  };

  const handleToggleActive = () => {
    startToggleTransition(async () => {
      try {
        const nextState = !isActive;
        await toggleRawItemActive(item.id, nextState);
        setIsActive(nextState);
        toast.success(`Insumo ${nextState ? "reativado" : "inativado/arquivado"} com sucesso!`);
        if (onUpdated) onUpdated();
      } catch (err: any) {
        toast.error("Erro ao alterar status: " + err.message);
      }
    });
  };

  const handleExecuteDelete = () => {
    startDeleteTransition(async () => {
      try {
        const res = await deleteRawItem(item.id);
        if (res.softDeleted) {
          toast.info(res.message, { duration: 6000 });
        } else {
          toast.success(res.message);
        }
        if (onUpdated) onUpdated();
        onClose();
      } catch (err: any) {
        toast.error(err.message, { duration: 6000 });
      } finally {
        setConfirmingDelete(false);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Edit size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">
                Editar Insumo de Estoque
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">
                SKU: {item.sku}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Nome do Insumo *
            </label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Se for Camiseta Lisa */}
          {item.type === RawItemType.BLANK_SHIRT && (
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Modelo
                </label>
                <input
                  type="text"
                  value={shirtModel}
                  onChange={(e) => setShirtModel(e.target.value)}
                  placeholder="Ex: Oversized 26.1"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Cor
                </label>
                <input
                  type="text"
                  value={shirtColor}
                  onChange={(e) => setShirtColor(e.target.value)}
                  placeholder="Ex: Preto"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Tamanho
                </label>
                <select
                  value={shirtSize}
                  onChange={(e) => setShirtSize(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="PP">PP</option>
                  <option value="P">P</option>
                  <option value="M">M</option>
                  <option value="G">G</option>
                  <option value="GG">GG</option>
                  <option value="XG">XG</option>
                </select>
              </div>
            </div>
          )}

          {/* Se for DTF */}
          {item.type === RawItemType.DTF_PRINT && (
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Código da Arte
                </label>
                <input
                  type="text"
                  value={dtfCode}
                  onChange={(e) => setDtfCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Tamanho de Impressão
                </label>
                <select
                  value={dtfPrintSize}
                  onChange={(e) => setDtfPrintSize(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="A3 (30x42cm)">A3 (30x42cm)</option>
                  <option value="A4 (21x30cm)">A4 (21x30cm)</option>
                  <option value="Bolso">Bolso (10x10cm)</option>
                  <option value="Faixa / Manga">Faixa / Manga</option>
                </select>
              </div>
            </div>
          )}

          {/* Preço de Venda e Custo Base */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Preço de Venda Padrão (R$)
              </label>
              <CurrencyInput
                value={sellingPrice}
                onChange={(val) => setSellingPrice(val)}
                placeholder="99,90"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-zinc-500 mt-0.5 block">
                Autopreenchido no Pedido Express
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Custo Unitário Base (R$) *
              </label>
              <CurrencyInput
                value={costPrice}
                onChange={(val) => setCostPrice(val)}
                placeholder="0,00"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-100 focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-zinc-500 mt-0.5 block">
                Custo de aquisição no fornecedor
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Estoque Mínimo de Alerta *
              </label>
              <input
                required
                type="number"
                step="1"
                min="0"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value === "" ? "" : parseInt(e.target.value) || 0)}
                placeholder="5"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Descrição do Insumo / Observações
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalhes sobre a malha, fornecedor habitual ou especificações..."
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Status Ativo / Inativo */}
          <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-zinc-200 block">
                Disponível para Novos Pedidos
              </span>
              <span className="text-[11px] text-zinc-500">
                {isActive
                  ? "Item ativo e disponível no dropdown de pedidos"
                  : "Item inativo (oculto em novos pedidos, preservando histórico)"}
              </span>
            </div>

            <button
              type="button"
              disabled={isTogglePending}
              onClick={handleToggleActive}
              className={`px-3 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1.5 transition cursor-pointer ${
                isActive
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                  : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700"
              }`}
            >
              <Power size={13} />
              <span>{isActive ? "Ativo" : "Inativo"}</span>
            </button>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {confirmingDelete ? (
              <div className="flex items-center gap-2 p-2 rounded-xl bg-red-950/40 border border-red-900/60 w-full sm:w-auto">
                <span className="text-[11px] text-red-300 font-medium">
                  Confirmar exclusão?
                </span>
                <button
                  type="button"
                  disabled={isDeletePending}
                  onClick={handleExecuteDelete}
                  className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  {isDeletePending ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Trash2 size={12} />
                  )}
                  <span>Sim, Excluir</span>
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-[11px] transition cursor-pointer"
                >
                  Voltar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Excluir Insumo</span>
              </button>
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={13} />
                    <span>Salvar Alterações</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
