"use client";

import { useState, useTransition } from "react";
import { X, AlertTriangle, RotateCcw, Loader2, ArrowLeft } from "lucide-react";
import { cancelOrder } from "@/actions/orders";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface CancelOrderModalProps {
  order: any | null;
  isOpen: boolean;
  onClose: () => void;
  onCancelled?: () => void;
}

export function CancelOrderModal({
  order,
  isOpen,
  onClose,
  onCancelled,
}: CancelOrderModalProps) {
  const [isPending, startTransition] = useTransition();
  const [reasonCategory, setReasonCategory] = useState("Cliente solicitou cancelamento via WhatsApp");
  const [additionalNotes, setAdditionalNotes] = useState("");

  if (!isOpen || !order) return null;

  const hadDeductedStock = order.productionJob?.stockDeducted === true;
  const totalRefund = order.totalProducts + (order.shippingCost || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const fullReason = additionalNotes.trim()
      ? `${reasonCategory} — ${additionalNotes.trim()}`
      : reasonCategory;

    startTransition(async () => {
      try {
        await cancelOrder(order.id, fullReason);
        toast.success(
          `Pedido ${order.orderNumber} cancelado com sucesso.${
            hadDeductedStock ? " Insumos devolvidos ao estoque." : ""
          }`
        );
        if (onCancelled) onCancelled();
        onClose();
      } catch (err: any) {
        toast.error("Erro ao cancelar pedido: " + err.message);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">
                Cancelar Pedido {order.orderNumber}
              </h3>
              <p className="text-[11px] text-zinc-400">
                {order.customerName} • {formatCurrency(totalRefund)}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Rules Banner: Stock return & Financial chargeback */}
          <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/40 text-xs text-red-200 space-y-2">
            <span className="font-bold flex items-center gap-1.5 text-red-300">
              <AlertTriangle size={14} />
              Regras Estritas de Cancelamento Aplicadas:
            </span>

            <ul className="space-y-1.5 text-[11px] text-red-200/90 list-disc list-inside">
              {hadDeductedStock ? (
                <li className="font-semibold text-emerald-300">
                  Devolução Automática de Estoque: As camisetas e insumos baixados serão devolvidos imediatamente ao estoque físico.
                </li>
              ) : (
                <li>
                  Estoque: Como a produção ainda não havia sido concluída, nenhum saldo foi subtraído.
                </li>
              )}
              <li>
                Estorno Financeiro: Será lançado um débito de {formatCurrency(totalRefund)} no financeiro para abater a receita do mês.
              </li>
              <li>
                Auditoria: O pedido não será apagado, ficando arquivado com registro do autor e motivo do cancelamento.
              </li>
            </ul>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Motivo Principal do Cancelamento *
            </label>
            <select
              value={reasonCategory}
              onChange={(e) => setReasonCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-red-500"
            >
              <option value="Cliente solicitou cancelamento via WhatsApp">
                Cliente solicitou cancelamento via WhatsApp
              </option>
              <option value="Cliente solicitou cancelamento no Direct">
                Cliente solicitou cancelamento no Instagram Direct
              </option>
              <option value="Desistência por prazo de entrega">
                Desistência pelo prazo de entrega
              </option>
              <option value="Erro no tamanho, cor ou arte solicitada">
                Erro no tamanho, cor ou arte solicitada
              </option>
              <option value="Falta de insumos / camiseta lisa em estoque">
                Falta de insumos / camiseta lisa em estoque
              </option>
              <option value="Cancelado na plataforma de marketplace">
                Cancelado na plataforma de marketplace (Shopee/Shein/TikTok)
              </option>
              <option value="Outro motivo">
                Outro motivo operacional
              </option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Justificativa detalhada para o log de auditoria (opcional)
            </label>
            <textarea
              rows={3}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Ex: Cliente mudou de ideia e pediu estorno via Pix..."
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition cursor-pointer"
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Processando Cancelamento...
                </>
              ) : (
                <>
                  <RotateCcw size={13} />
                  <span>Confirmar Cancelamento & Estorno</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
