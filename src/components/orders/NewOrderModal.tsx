"use client";

import { useState, useTransition } from "react";
import { X, Plus, ShoppingBag, Loader2, Sparkles } from "lucide-react";
import { createManualOrder } from "@/actions/orders";
import { toast } from "sonner";

interface VariantOption {
  id: string;
  sku: string;
  title: string;
  basePrice: number;
  productName: string;
}

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  variants: VariantOption[];
  onOrderCreated?: () => void;
}

export function NewOrderModal({
  isOpen,
  onClose,
  variants,
  onOrderCreated,
}: NewOrderModalProps) {
  const [isPending, startTransition] = useTransition();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState(
    variants[0]?.id || ""
  );
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState<number>(
    variants[0]?.basePrice || 99.90
  );
  const [shippingCost, setShippingCost] = useState(0);
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleVariantChange = (id: string) => {
    setSelectedVariantId(id);
    const v = variants.find((item) => item.id === id);
    if (v) {
      setUnitPrice(v.basePrice);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      toast.error("Por favor, preencha o nome do cliente.");
      return;
    }
    if (!selectedVariantId) {
      toast.error("Por favor, selecione uma peça/variante.");
      return;
    }

    startTransition(async () => {
      try {
        await createManualOrder({
          customerName,
          customerPhone,
          customerEmail,
          shippingAddress,
          variantId: selectedVariantId,
          quantity: Number(quantity),
          unitPrice: Number(unitPrice),
          shippingCost: Number(shippingCost),
          notes,
        });

        toast.success("Pedido de venda direta criado com sucesso e enviado para a fila de produção!");
        if (onOrderCreated) onOrderCreated();
        onClose();
      } catch (err: any) {
        toast.error("Erro ao criar pedido: " + err.message);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Plus size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">
                Novo Pedido Manual (Venda Direta / Whats)
              </h3>
              <p className="text-[11px] text-zinc-400">
                Entrada rápida sem comissão de marketplace (100% líquida).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Nome do Cliente *
            </label>
            <input
              required
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="ex: João Paulo Miranda"
              className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                WhatsApp / Celular
              </label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="(11) 98765-4321"
                className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                E-mail (opcional)
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="cliente@email.com"
                className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Endereço Completo de Entrega
            </label>
            <input
              type="text"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Rua, número, bairro, cidade - UF e CEP"
              className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-2 border-t border-zinc-800">
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Selecione o Modelo e Tamanho / Cor *
            </label>
            <select
              value={selectedVariantId}
              onChange={(e) => handleVariantChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
            >
              {variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.productName} — {v.title} ({v.sku})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Quantidade
              </label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Preço Unit. (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Frete (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={shippingCost}
                onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Observações Internas / Brindes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ex: Cliente VIP, incluir 2 adesivos holográficos."
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
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
            >
              {isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Salvando e Liberando Produção...
                </>
              ) : (
                <>Criar Pedido e Enviar para Prensa</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
