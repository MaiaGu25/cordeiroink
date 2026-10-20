"use client";

import { useState } from "react";
import { useCart } from "./CartContext";
import { ShippingCalculator } from "@/components/shipping/ShippingCalculator";
import { createStorefrontOrder } from "@/actions/storefront";
import { formatCurrency } from "@/lib/utils";
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  Loader2,
  User,
  Phone,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

export function StorefrontCartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    clearCart,
    removeItem,
    updateQuantity,
    totalItemsCount,
    subtotal,
    selectedShipping,
    setSelectedShipping,
    destinationCep,
    setDestinationCep,
    grandTotal,
  } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Formatação automática do WhatsApp
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 11);
    let formatted = raw;
    if (raw.length > 2 && raw.length <= 7) {
      formatted = `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
    } else if (raw.length > 7) {
      formatted = `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7)}`;
    }
    setCustomerPhone(formatted);
  };

  // Finalização do Checkout sem Gateway:
  // 1. Salva na tabela Order do Prisma com status "PENDING"
  // 2. Redireciona imediatamente para o WhatsApp com mensagem formatada
  const handleCheckout = async () => {
    if (!customerName.trim()) {
      toast.error("Por favor, preencha seu nome completo.");
      return;
    }

    const cleanPhone = customerPhone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      toast.error("Por favor, informe seu WhatsApp com DDD.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createStorefrontOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        shippingAddress: streetAddress.trim() || undefined,
        destinationCep: destinationCep || undefined,
        shippingService: selectedShipping?.service,
        shippingPrice: selectedShipping?.price,
        deliveryDays: selectedShipping?.deliveryDays,
        items: items.map((i) => ({
          title: i.title,
          colorName: i.colorName,
          size: i.size,
          price: i.price,
          quantity: i.quantity,
          imageUrl: i.imageUrl,
          productId: i.productId,
        })),
      });

      if (res.success && res.whatsappUrl) {
        toast.success(
          `Pedido ${res.orderNumber} registrado! Abrindo WhatsApp do Ateliê...`
        );
        clearCart();
        // Redirecionamento imediato para a URL do WhatsApp
        setTimeout(() => {
          window.location.href = res.whatsappUrl;
        }, 600);
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao registrar pedido.");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={closeCart}
    >
      <div
        className="w-full max-w-md bg-[#FAF9F6] h-full shadow-2xl flex flex-col border-l border-[#E6DED2] animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#E6DED2] flex items-center justify-between bg-[#F7F4EE]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-full bg-[#0A0A0A] text-[#F7F4EE]">
              <ShoppingBag size={16} />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#0A0A0A] flex items-center gap-2">
                <span>Sua Sacola</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#0A0A0A]/10 text-[#0A0A0A]">
                  {totalItemsCount} {totalItemsCount === 1 ? "peça" : "peças"}
                </span>
              </h3>
              <p className="text-[10px] text-[#737373] font-sans tracking-wide">
                Produção artesanal sob demanda
              </p>
            </div>
          </div>

          <button
            onClick={closeCart}
            className="p-2 rounded-full hover:bg-black/5 text-[#0A0A0A] transition cursor-pointer"
            aria-label="Fechar sacola"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#F2ECE1] flex items-center justify-center text-[#A0988A]">
              <ShoppingBag size={28} />
            </div>
            <div className="space-y-1">
              <h4 className="font-serif text-lg text-[#0A0A0A] font-semibold">
                Sua sacola está vazia
              </h4>
              <p className="text-xs text-[#737373] max-w-xs font-light">
                Explore a coleção do ateliê e selecione sua estampa e tamanho favoritos.
              </p>
            </div>
            <button
              onClick={closeCart}
              className="mt-2 px-6 py-2.5 rounded-full bg-[#0A0A0A] text-[#F7F4EE] text-xs font-sans font-bold uppercase tracking-wider hover:bg-[#222222] transition cursor-pointer"
            >
              Explorar Coleção
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Lista de Peças */}
            <div className="space-y-3">
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#737373]">
                Peças Selecionadas
              </span>

              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-[#F7F4EE] border border-[#E6DED2] flex gap-3.5 items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-14 h-16 object-cover rounded-xl bg-black/5 shrink-0"
                    />
                    <div className="min-w-0 space-y-1">
                      <h5 className="font-serif text-xs font-bold text-[#0A0A0A] truncate">
                        {item.title}
                      </h5>
                      <div className="flex items-center gap-2 text-[10px] text-[#737373] font-mono">
                        <span className="px-1.5 py-0.5 rounded bg-black/5">
                          {item.colorName}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-black/5">
                          Tam {item.size}
                        </span>
                      </div>
                      <div className="font-mono text-xs font-bold text-[#0A0A0A]">
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                  </div>

                  {/* Quantity Controls & Delete */}
                  <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 text-[#A0988A] hover:text-red-600 transition cursor-pointer"
                      title="Remover peça"
                    >
                      <Trash2 size={13} />
                    </button>

                    <div className="flex items-center gap-1.5 bg-[#FAF9F6] border border-[#E6DED2] rounded-lg p-0.5">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 rounded text-[#0A0A0A] hover:bg-black/5 transition cursor-pointer"
                        title="Diminuir quantidade"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="font-mono text-xs font-bold px-1 min-w-[16px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 rounded text-[#0A0A0A] hover:bg-black/5 transition cursor-pointer"
                        title="Aumentar quantidade"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Módulo de Cálculo de Frete (Melhor Envio / Correios) */}
            <div className="space-y-2">
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#737373]">
                Entrega & Frete
              </span>
              <ShippingCalculator
                quantity={totalItemsCount}
                selectedOption={selectedShipping}
                onSelectOption={setSelectedShipping}
                variant="storefront"
                initialCep={destinationCep}
                onCepChange={setDestinationCep}
              />
            </div>

            {/* Dados do Cliente para Envio & Contato */}
            <div className="space-y-3 pt-2 border-t border-[#E6DED2]">
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#737373]">
                Seus Dados para Contato & Envio
              </span>

              <div className="space-y-2">
                <div>
                  <label className="block text-[11px] font-sans font-semibold text-[#0A0A0A] mb-1">
                    Nome Completo *
                  </label>
                  <div className="relative">
                    <User
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0988A]"
                    />
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ex: Lucas Silva"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF9F6] border border-[#D5CABE] text-[#0A0A0A] placeholder:text-[#A0988A] text-xs focus:outline-none focus:border-[#0A0A0A] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-sans font-semibold text-[#0A0A0A] mb-1">
                    WhatsApp com DDD *
                  </label>
                  <div className="relative">
                    <Phone
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0988A]"
                    />
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={handlePhoneChange}
                      placeholder="(11) 98765-4321"
                      maxLength={15}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF9F6] border border-[#D5CABE] text-[#0A0A0A] placeholder:text-[#A0988A] font-mono text-xs focus:outline-none focus:border-[#0A0A0A] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-sans font-semibold text-[#0A0A0A] mb-1">
                    Endereço de Entrega (Rua, Número, Bairro)
                  </label>
                  <div className="relative">
                    <MapPin
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0988A]"
                    />
                    <input
                      type="text"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder="Ex: Rua Augusta, 500 - Apto 32, Consolação"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF9F6] border border-[#D5CABE] text-[#0A0A0A] placeholder:text-[#A0988A] text-xs focus:outline-none focus:border-[#0A0A0A] transition"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Drawer Footer com Total e Botão de Finalizar */}
        {items.length > 0 && (
          <div className="p-5 border-t border-[#E6DED2] bg-[#F7F4EE] space-y-4 shrink-0">
            {/* Breakdown de Valores */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#737373]">
                <span>Subtotal ({totalItemsCount} itens)</span>
                <span className="font-mono">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex justify-between text-[#737373]">
                <span>
                  Frete ({selectedShipping ? selectedShipping.service : "A combinar"})
                </span>
                <span className="font-mono">
                  {selectedShipping
                    ? formatCurrency(selectedShipping.price)
                    : "Calcular acima"}
                </span>
              </div>

              <div className="pt-2 border-t border-[#E6DED2] flex justify-between items-baseline font-bold">
                <span className="font-serif text-base text-[#0A0A0A]">
                  Total do Pedido
                </span>
                <span className="font-mono text-lg text-[#0A0A0A]">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            {/* Botão de Finalizar Pedido: Salva no Prisma (PENDING) e Redireciona para o WhatsApp */}
            <button
              type="button"
              onClick={handleCheckout}
              disabled={isSubmitting}
              className="w-full py-4 rounded-full bg-[#0A0A0A] hover:bg-[#222222] text-[#F7F4EE] font-sans text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Registrando Pedido...</span>
                </>
              ) : (
                <>
                  <MessageCircle size={16} />
                  <span>Finalizar Pedido ({formatCurrency(grandTotal)})</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#737373] font-sans">
              <ShieldCheck size={12} className="text-emerald-600" />
              <span>Pedido salvo com segurança no ateliê e combinado no WhatsApp</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
