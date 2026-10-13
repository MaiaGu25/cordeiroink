"use client";

import { useState, useTransition, useEffect } from "react";
import { X, FileEdit, Loader2, Save } from "lucide-react";
import { editOrder } from "@/actions/orders";
import { toast } from "sonner";

interface EditOrderModalProps {
  order: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export function EditOrderModal({
  order,
  isOpen,
  onClose,
  onSaved,
}: EditOrderModalProps) {
  const [isPending, startTransition] = useTransition();

  const firstItem = order?.items?.[0];

  const [customerName, setCustomerName] = useState(order?.customerName || "");
  const [customerPhone, setCustomerPhone] = useState(order?.customerPhone || "");
  const [customerEmail, setCustomerEmail] = useState(order?.customerEmail || "");
  const [shippingAddress, setShippingAddress] = useState(order?.shippingAddress || "");
  const [paymentMethod, setPaymentMethod] = useState(order?.paymentMethod || "PIX");
  const [notes, setNotes] = useState(order?.notes || "");
  const [itemTitle, setItemTitle] = useState(firstItem?.title || "");
  const [printSize, setPrintSize] = useState(firstItem?.printSize || "A3 (30x42cm)");
  const [unitPrice, setUnitPrice] = useState<number>(firstItem?.unitPrice || 0);

  useEffect(() => {
    if (order) {
      setCustomerName(order.customerName || "");
      setCustomerPhone(order.customerPhone || "");
      setCustomerEmail(order.customerEmail || "");
      setShippingAddress(order.shippingAddress || "");
      setPaymentMethod(order.paymentMethod || "PIX");
      setNotes(order.notes || "");
      const it = order.items?.[0];
      setItemTitle(it?.title || "");
      setPrintSize(it?.printSize || "A3 (30x42cm)");
      setUnitPrice(it?.unitPrice || 0);
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        await editOrder({
          orderId: order.id,
          customerName,
          customerPhone: customerPhone || undefined,
          customerEmail: customerEmail || undefined,
          shippingAddress: shippingAddress || undefined,
          paymentMethod,
          notes: notes || undefined,
          itemTitle: itemTitle || undefined,
          printSize,
          unitPrice: Number(unitPrice),
        });

        toast.success(`Pedido ${order.orderNumber} atualizado com sucesso!`);
        if (onSaved) onSaved();
        onClose();
      } catch (err: any) {
        toast.error("Erro ao salvar alterações: " + err.message);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <FileEdit size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">
                Editar Dados do Pedido {order.orderNumber}
              </h3>
              <p className="text-[11px] text-zinc-400">
                Atualização cadastral e recálculo financeiro
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Nome do Cliente *
              </label>
              <input
                required
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                WhatsApp / Telefone
              </label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                E-mail (opcional)
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Endereço de Entrega / Instrução
              </label>
              <input
                type="text"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Descrição da Peça / Estampa
              </label>
              <input
                type="text"
                value={itemTitle}
                onChange={(e) => setItemTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Tamanho da Folha DTF
              </label>
              <select
                value={printSize}
                onChange={(e) => setPrintSize(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              >
                <option value="A3 (30x42cm)">A3 (Costas grande - 30x42cm)</option>
                <option value="A4 (21x30cm)">A4 (Frente peito - 21x30cm)</option>
                <option value="Bolso (10x10cm)">Bolso (10x10cm)</option>
                <option value="Faixa / Manga">Faixa / Manga</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Preço Unitário Cobrado (R$) *
              </label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={unitPrice}
                onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Forma de Pagamento
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              >
                <option value="PIX">Pix</option>
                <option value="CARTAO">Cartão de Crédito / Débito</option>
                <option value="DINHEIRO">Dinheiro</option>
                <option value="BOLETO">Boleto Bancário</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Observações internas
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2.5">
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
        </form>
      </div>
    </div>
  );
}
