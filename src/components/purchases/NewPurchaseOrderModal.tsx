"use client";

import { useState, useTransition, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  Truck,
  Loader2,
  DollarSign,
  Package,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { createPurchaseOrder } from "@/actions/purchases";
import { formatCurrency } from "@/lib/utils";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { PurchaseStatus } from "@prisma/client";
import { toast } from "sonner";

interface RawItemOption {
  id: string;
  name: string;
  sku: string;
  type: string;
  unit: string;
  costPrice: number;
  stockQuantity: number;
  shirtModel?: string | null;
  shirtColor?: string | null;
  shirtSize?: string | null;
}

interface SupplierOption {
  id: string;
  name: string;
  category: string;
  whatsapp?: string | null;
}

interface NewPurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  suppliers: SupplierOption[];
  rawItems: RawItemOption[];
  onCreated?: () => void;
}

interface PurchaseItemRow {
  id: string;
  rawItemId: string;
  quantity: number;
  unitCost: number;
}

export function NewPurchaseOrderModal({
  isOpen,
  onClose,
  suppliers = [],
  rawItems = [],
  onCreated,
}: NewPurchaseOrderModalProps) {
  const [isPending, startTransition] = useTransition();

  const [supplierId, setSupplierId] = useState<string>(suppliers[0]?.id || "");
  const [status, setStatus] = useState<PurchaseStatus>(PurchaseStatus.ORDERED);
  const [notes, setNotes] = useState("");

  const createInitialItem = (): PurchaseItemRow => {
    const firstItem = rawItems[0];
    return {
      id: Math.random().toString(36).substring(2, 9),
      rawItemId: firstItem?.id || "",
      quantity: 10,
      unitCost: firstItem?.costPrice || 0,
    };
  };

  const [items, setItems] = useState<PurchaseItemRow[]>([createInitialItem()]);

  useEffect(() => {
    if (isOpen) {
      if (suppliers.length > 0 && !supplierId) {
        setSupplierId(suppliers[0].id);
      }
      if (items.length === 0 || !items[0].rawItemId) {
        setItems([createInitialItem()]);
      }
    } else {
      setNotes("");
      setStatus(PurchaseStatus.ORDERED);
      setItems([createInitialItem()]);
    }
  }, [isOpen, suppliers, rawItems]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    const firstItem = rawItems[0];
    setItems((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        rawItemId: firstItem?.id || "",
        quantity: 10,
        unitCost: firstItem?.costPrice || 0,
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleItemChange = (rowId: string, rawItemId: string) => {
    const raw = rawItems.find((r) => r.id === rawItemId);
    setItems((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        return {
          ...row,
          rawItemId,
          unitCost: raw ? raw.costPrice : row.unitCost,
        };
      })
    );
  };

  const totalCost = items.reduce((acc, row) => acc + (row.quantity * (Number(row.unitCost) || 0)), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!supplierId) {
      toast.error("Selecione um fornecedor homologado.");
      return;
    }

    if (items.length === 0) {
      toast.error("Adicione ao menos um insumo à ordem de compra.");
      return;
    }

    for (const it of items) {
      if (!it.rawItemId) {
        toast.error("Selecione o insumo em todos os itens.");
        return;
      }
      if (it.quantity <= 0) {
        toast.error("A quantidade de todos os itens deve ser maior que 0.");
        return;
      }
    }

    startTransition(async () => {
      try {
        await createPurchaseOrder({
          supplierId,
          status,
          notes: notes.trim() || undefined,
          items: items.map((i) => ({
            rawItemId: i.rawItemId,
            quantity: Number(i.quantity) || 1,
            unitCost: typeof i.unitCost === "number" ? i.unitCost : parseFloat(String(i.unitCost).replace(",", ".")) || 0,
          })),
        });

        if (status === PurchaseStatus.RECEIVED) {
          toast.success("Ordem de compra criada e estoque físico atualizado com sucesso!");
        } else {
          toast.success("Ordem de compra registrada com sucesso!");
        }

        if (onCreated) onCreated();
        onClose();
      } catch (err: any) {
        toast.error("Erro ao registrar ordem de compra: " + err.message);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-[98%] sm:w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-zinc-800/80 bg-zinc-900/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Truck size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <span>+ Nova Ordem de Compra</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Reposição
                </span>
              </h3>
              <p className="text-xs text-zinc-500">
                Lançamento de pedido de compras com fornecedores homologados e entrada de estoque.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden text-xs">
          <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
            {/* Fornecedor & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1.5">
                  Fornecedor Homologado *
                </label>
                <select
                  required
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-zinc-700 font-medium"
                >
                  {suppliers.length === 0 ? (
                    <option value="">Nenhum fornecedor cadastrado</option>
                  ) : (
                    suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.category})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1.5">
                  Status Inicial da Ordem
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { key: PurchaseStatus.DRAFT, label: "Rascunho" },
                    { key: PurchaseStatus.ORDERED, label: "Enviada" },
                    { key: PurchaseStatus.RECEIVED, label: "Recebida" },
                  ].map((st) => (
                    <button
                      type="button"
                      key={st.key}
                      onClick={() => setStatus(st.key)}
                      className={`py-1.5 px-2 rounded-xl border text-center text-xs font-semibold transition cursor-pointer ${
                        status === st.key
                          ? st.key === PurchaseStatus.RECEIVED
                            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-bold shadow-sm"
                            : "bg-amber-500/10 border-amber-500/40 text-amber-300 font-bold shadow-sm"
                          : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
                {status === PurchaseStatus.RECEIVED && (
                  <span className="text-[10px] text-emerald-400 font-medium mt-1 block">
                    ✓ Os saldos dos itens selecionados serão somados ao estoque físico imediatamente.
                  </span>
                )}
              </div>
            </div>

            {/* Insumos a Repor */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-zinc-300 font-semibold flex items-center gap-1.5">
                  <Package size={14} className="text-amber-400" />
                  <span>Insumos a Repor ({items.length})</span>
                </label>

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-2.5 py-1 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-amber-400 border border-zinc-700/80 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus size={12} />
                  <span>+ Adicionar Insumo</span>
                </button>
              </div>

              {items.map((row, index) => {
                const selectedRaw = rawItems.find((r) => r.id === row.rawItemId);

                return (
                  <div
                    key={row.id}
                    className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2">
                      <span className="font-semibold text-zinc-300 text-xs">
                        Item #{index + 1}
                      </span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(row.id)}
                          className="p-1 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-zinc-400 mb-1 text-[11px]">
                        Insumo / Matéria-Prima *
                      </label>
                      <select
                        value={row.rawItemId}
                        onChange={(e) => handleItemChange(row.id, e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-zinc-700 font-medium"
                      >
                        {rawItems.length === 0 ? (
                          <option value="">Nenhum insumo cadastrado</option>
                        ) : (
                          rawItems.map((r) => (
                            <option key={r.id} value={r.id}>
                              [{r.type}] {r.name} (Atual: {r.stockQuantity} {r.unit || "un"})
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-zinc-400 mb-1 text-[11px]">
                          Quantidade a Pedir *
                        </label>
                        <input
                          type="number"
                          min={1}
                          step={1}
                          required
                          value={row.quantity}
                          onChange={(e) => {
                            const val = Math.max(1, parseInt(e.target.value) || 1);
                            setItems((prev) =>
                              prev.map((r) => (r.id === row.id ? { ...r, quantity: val } : r))
                            );
                          }}
                          className="w-full px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono text-xs focus:outline-none focus:border-zinc-700"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 mb-1 text-[11px]">
                          Custo Unitário (R$) *
                        </label>
                        <CurrencyInput
                          value={row.unitCost}
                          onChange={(val) => {
                            setItems((prev) =>
                              prev.map((r) => (r.id === row.id ? { ...r, unitCost: val === "" ? 0 : val } : r))
                            );
                          }}
                          placeholder="0,00"
                          className="w-full px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono text-xs focus:outline-none focus:border-zinc-700"
                        />
                      </div>
                    </div>

                    <div className="text-right text-[11px] font-mono text-zinc-400">
                      Subtotal deste item:{" "}
                      <strong className="text-zinc-200">
                        {formatCurrency(row.quantity * (Number(row.unitCost) || 0))}
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Observações */}
            <div>
              <label className="block text-zinc-400 mb-1 text-[11px]">
                Observações / Condições de Pagamento
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Pagamento 50% antecipado via Pix e 50% na entrega. Prazo prometido de 4 dias."
                className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
              />
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="p-3 sm:p-4 border-t border-zinc-800 bg-zinc-950 shrink-0 flex items-center justify-between gap-2.5">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block font-medium">
                Custo Total Previsto
              </span>
              <span className="text-base font-bold font-mono text-zinc-100">
                {formatCurrency(totalCost)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition cursor-pointer text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold transition shadow-sm flex items-center gap-2 cursor-pointer text-xs"
              >
                {isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Gerando Ordem...
                  </>
                ) : (
                  <>
                    <Truck size={15} />
                    <span>Gerar Ordem de Compra</span>
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
