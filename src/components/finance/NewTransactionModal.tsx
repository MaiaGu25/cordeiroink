"use client";

import { useState, useTransition } from "react";
import { X, Plus, DollarSign, Loader2 } from "lucide-react";
import { addTransaction } from "@/actions/finance";
import { TransactionCategory, TransactionType } from "@prisma/client";
import { toast } from "sonner";

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

const CATEGORIES = [
  { value: TransactionCategory.RAW_MATERIALS, label: "Matéria-Prima (Camisetas/DTF)" },
  { value: TransactionCategory.PACKAGING_SUPPLIES, label: "Embalagens e Tags" },
  { value: TransactionCategory.PLATFORM_FEES, label: "Taxas e Comissões de Marketplace" },
  { value: TransactionCategory.SHIPPING, label: "Frete / Envios" },
  { value: TransactionCategory.EQUIPMENT, label: "Equipamentos / Manutenção de Prensa" },
  { value: TransactionCategory.MARKETING, label: "Marketing / Ads" },
  { value: TransactionCategory.OPERATIONAL, label: "Operacional (Energia, Aluguel, Software)" },
  { value: TransactionCategory.SALES_ORDER, label: "Venda de Produtos (Receita)" },
];

export function NewTransactionModal({
  isOpen,
  onClose,
  onCreated,
}: NewTransactionModalProps) {
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [category, setCategory] = useState<TransactionCategory>(
    TransactionCategory.RAW_MATERIALS
  );
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error("Preencha a descrição do lançamento.");
      return;
    }
    if (amount <= 0) {
      toast.error("Informe um valor maior que zero.");
      return;
    }

    startTransition(async () => {
      try {
        await addTransaction({
          type,
          category,
          amount: Number(amount),
          description,
        });
        toast.success("Lançamento financeiro registrado com sucesso!");
        if (onCreated) onCreated();
        onClose();
      } catch (err: any) {
        toast.error("Erro ao registrar lançamento: " + err.message);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-[96%] sm:w-full max-w-md bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Plus size={16} />
            </div>
            <h3 className="text-sm font-bold text-zinc-100">
              Novo Lançamento Financeiro
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType(TransactionType.EXPENSE)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold border transition ${
                type === TransactionType.EXPENSE
                  ? "bg-red-500/10 border-red-500 text-red-400"
                  : "bg-zinc-950 border-zinc-800 text-zinc-400"
              }`}
            >
              Despesa / Saída
            </button>
            <button
              type="button"
              onClick={() => setType(TransactionType.INCOME)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold border transition ${
                type === TransactionType.INCOME
                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                  : "bg-zinc-950 border-zinc-800 text-zinc-400"
              }`}
            >
              Receita / Entrada
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Categoria
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TransactionCategory)}
              className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Valor (R$) *
            </label>
            <input
              required
              type="number"
              step="0.01"
              min="0.01"
              value={amount || ""}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              placeholder="0,00"
              className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-sm font-mono text-zinc-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Descrição / Fornecedor / Motivo *
            </label>
            <input
              required
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ex: Teflon novo para prensa térmica 40x50"
              className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Salvando...
                </>
              ) : (
                <>Salvar Lançamento</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
