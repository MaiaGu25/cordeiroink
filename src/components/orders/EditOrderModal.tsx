"use client";

import { useState, useTransition, useEffect } from "react";
import { X, FileEdit, Loader2, Save } from "lucide-react";
import { editOrder } from "@/actions/orders";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { toast } from "sonner";

interface EditOrderModalProps {
  order: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

function getDefaults(order: any | null) {
  const firstItem = order?.items?.[0];
  return {
    customerName: order?.customerName ?? "",
    customerPhone: order?.customerPhone ?? "",
    customerEmail: order?.customerEmail ?? "",
    shippingAddress: order?.shippingAddress ?? "",
    paymentMethod: order?.paymentMethod ?? "PIX",
    notes: order?.notes ?? "",
    itemTitle: firstItem?.title ?? "",
    printSize: firstItem?.printSize ?? "A3 (30x42cm)",
    unitPrice: firstItem?.unitPrice ?? 0,
  };
}

export function EditOrderModal({
  order,
  isOpen,
  onClose,
  onSaved,
}: EditOrderModalProps) {
  const [isPending, startTransition] = useTransition();

  const defaults = getDefaults(order);
  const [customerName, setCustomerName] = useState(defaults.customerName);
  const [customerPhone, setCustomerPhone] = useState(defaults.customerPhone);
  const [customerEmail, setCustomerEmail] = useState(defaults.customerEmail);
  const [shippingAddress, setShippingAddress] = useState(defaults.shippingAddress);
  const [paymentMethod, setPaymentMethod] = useState(defaults.paymentMethod);
  const [notes, setNotes] = useState(defaults.notes);
  const [itemTitle, setItemTitle] = useState(defaults.itemTitle);
  const [printSize, setPrintSize] = useState(defaults.printSize);
  const [unitPrice, setUnitPrice] = useState<number | "">(defaults.unitPrice);

  // Sync all fields whenever order changes (different order selected) OR modal opens
  useEffect(() => {
    const d = getDefaults(order);
    setCustomerName(d.customerName);
    setCustomerPhone(d.customerPhone);
    setCustomerEmail(d.customerEmail);
    setShippingAddress(d.shippingAddress);
    setPaymentMethod(d.paymentMethod);
    setNotes(d.notes);
    setItemTitle(d.itemTitle);
    setPrintSize(d.printSize);
    setUnitPrice(d.unitPrice);
  }, [order?.id, isOpen]);

  if (!isOpen || !order) return null;

  const handleClose = () => {
    // Fields will be re-synced on next open via useEffect; no manual reset needed here
    onClose();
  };

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
          unitPrice: typeof unitPrice === "number" ? unitPrice : parseFloat(String(unitPrice).replace(",", ".")) || 0,
        });

        toast.success(`Pedido ${order.orderNumber} atualizado com sucesso!`);
        if (onSaved) onSaved();
        handleClose();
      } catch (err: any) {
        const message = err?.message || (typeof err === "string" ? err : "Erro interno");
        toast.error(`Erro ao salvar alterações: ${String(message)}`);
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
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label htmlFor="edit-customer-name" className="block text-xs font-semibold text-zinc-300 mb-1">
                Nome do Cliente *
              </label>
              <input
                id="edit-customer-name"
                required
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label htmlFor="edit-phone" className="block text-xs font-medium text-zinc-400 mb-1">
                WhatsApp / Telefone
              </label>
              <input
                id="edit-phone"
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label htmlFor="edit-email" className="block text-xs font-medium text-zinc-400 mb-1">
                E-mail (opcional)
              </label>
              <input
                id="edit-email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="edit-address" className="block text-xs font-medium text-zinc-400 mb-1">
                Endereço de Entrega / Instrução
              </label>
              <input
                id="edit-address"
                type="text"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label htmlFor="edit-item-title" className="block text-xs font-medium text-zinc-400 mb-1">
                Descrição da Peça / Estampa
              </label>
              <input
                id="edit-item-title"
                type="text"
                value={itemTitle}
                onChange={(e) => setItemTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label htmlFor="edit-print-size" className="block text-xs font-medium text-zinc-400 mb-1">
                Tamanho da Folha DTF
              </label>
              <select
                id="edit-print-size"
                value={printSize}
                onChange={(e) => setPrintSize(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="A3 (30x42cm)">A3 (Costas grande - 30x42cm)</option>
                <option value="A4 (21x30cm)">A4 (Frente peito - 21x30cm)</option>
                <option value="Bolso (10x10cm)">Bolso (10x10cm)</option>
                <option value="Faixa / Manga">Faixa / Manga</option>
              </select>
            </div>

            <div>
              <label htmlFor="edit-unit-price" className="block text-xs font-semibold text-zinc-300 mb-1">
                Preço Unitário Cobrado (R$) *
              </label>
              <CurrencyInput
                id="edit-unit-price"
                value={unitPrice}
                onChange={(val) => setUnitPrice(val)}
                placeholder="0,00"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label htmlFor="edit-payment" className="block text-xs font-medium text-zinc-400 mb-1">
                Forma de Pagamento
              </label>
              <select
                id="edit-payment"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="PIX">Pix</option>
                <option value="CARTAO">Cartão de Crédito / Débito</option>
                <option value="DINHEIRO">Dinheiro</option>
                <option value="BOLETO">Boleto Bancário</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="edit-notes" className="block text-xs font-medium text-zinc-400 mb-1">
                Observações internas
              </label>
              <textarea
                id="edit-notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleClose}
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
