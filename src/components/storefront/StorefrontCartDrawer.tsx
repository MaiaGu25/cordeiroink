"use client";

import { useCart } from "./CartContext";
import { ShippingCalculator } from "@/components/shipping/ShippingCalculator";
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
} from "lucide-react";

export function StorefrontCartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
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

  if (!isOpen) return null;

  const brandPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "5511999999999";

  // Montagem da mensagem estruturada para o WhatsApp
  const generateWhatsAppMessage = () => {
    let msg = `*NOVO PEDIDO — CORDEIRO INK ATELIÊ*\n\n`;
    msg += `Olá! Gostaria de fechar o seguinte pedido:\n\n`;

    items.forEach((item, idx) => {
      msg += `▪ ${item.quantity}x *${item.title}*\n`;
      msg += `   Cor: ${item.colorName} | Tamanho: ${item.size}\n`;
      msg += `   Subtotal: ${formatCurrency(item.price * item.quantity)}\n\n`;
    });

    msg += `--------------------------------\n`;
    msg += `*Subtotal das Peças:* ${formatCurrency(subtotal)}\n`;

    if (selectedShipping) {
      msg += `*Frete Selecionado:* ${selectedShipping.service}\n`;
      msg += `*CEP de Destino:* ${destinationCep || "Informado"}\n`;
      msg += `*Prazo de Entrega:* ${selectedShipping.deliveryDays} dias úteis\n`;
      msg += `*Valor do Frete:* ${formatCurrency(selectedShipping.price)}\n`;
    } else {
      msg += `*Frete:* A combinar no WhatsApp\n`;
    }

    msg += `--------------------------------\n`;
    msg += `*TOTAL DO PEDIDO:* ${formatCurrency(grandTotal)}\n\n`;
    msg += `Por favor, me envie os dados para pagamento (PIX) e confirmação de envio!`;

    return encodeURIComponent(msg);
  };

  const whatsappCheckoutLink = `https://wa.me/${brandPhone}?text=${generateWhatsAppMessage()}`;

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
              className="mt-2 px-6 py-2.5 rounded-full bg-[#0A0A0A] text-[#F7F4EE] text-xs font-sans font-bold uppercase tracking-wider hover:bg-[#222222] transition"
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

            {/* Módulo de Cálculo de Frete (Melhor Envio Sandbox) */}
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
          </div>
        )}

        {/* Drawer Footer com Total e Checkout */}
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
                  Frete ({selectedShipping ? selectedShipping.service : "A calcular"})
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

            {/* Botão de Fechar Pedido via WhatsApp */}
            <a
              href={whatsappCheckoutLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 rounded-full bg-[#0A0A0A] hover:bg-[#222222] text-[#F7F4EE] font-sans text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-xl cursor-pointer"
            >
              <MessageCircle size={16} />
              <span>Finalizar via WhatsApp ({formatCurrency(grandTotal)})</span>
              <ArrowRight size={14} />
            </a>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#737373] font-sans">
              <ShieldCheck size={12} className="text-emerald-600" />
              <span>Envio seguro com código de rastreamento Correios</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
