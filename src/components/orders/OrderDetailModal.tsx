"use client";

import { X, User, MapPin, Phone, Mail, ShoppingBag, ShieldCheck, Flame, ArrowRight, DollarSign } from "lucide-react";
import { formatCurrency, formatDate, CHANNEL_CONFIG, STATUS_CONFIG } from "@/lib/utils";
import { OrderStatus } from "@prisma/client";
import { updateOrderStatus } from "@/actions/orders";
import { toast } from "sonner";
import { useState, useTransition } from "react";

interface OrderDetailModalProps {
  order: any | null;
  onClose: () => void;
  onOrderUpdated?: () => void;
}

export function OrderDetailModal({ order, onClose, onOrderUpdated }: OrderDetailModalProps) {
  const [isPending, startTransition] = useTransition();

  if (!order) return null;

  const channel = CHANNEL_CONFIG[order.channel] || { label: order.channel };
  const status = STATUS_CONFIG[order.status] || { label: order.status };

  const handleStatusChange = (newStatus: OrderStatus) => {
    startTransition(async () => {
      try {
        await updateOrderStatus(order.id, newStatus);
        toast.success(`Status do pedido ${order.orderNumber} atualizado para ${STATUS_CONFIG[newStatus]?.label || newStatus}`);
        if (onOrderUpdated) onOrderUpdated();
        onClose();
      } catch (err: any) {
        toast.error("Erro ao atualizar status: " + err.message);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShoppingBag size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-base text-zinc-100">
                  {order.orderNumber}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${status.bg}`}>
                  {status.label}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700 font-medium">
                  {channel.label}
                </span>
              </div>
              <span className="text-xs text-zinc-400">
                Criado em {formatDate(order.createdAt)}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Customer & Shipping Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                <User size={13} className="text-amber-400" />
                Dados do Cliente
              </div>
              <div className="text-sm font-semibold text-zinc-100">
                {order.customerName}
              </div>
              {order.customerEmail && (
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <Mail size={12} />
                  <span>{order.customerEmail}</span>
                </div>
              )}
              {order.customerPhone && (
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <Phone size={12} />
                  <span>{order.customerPhone}</span>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                <MapPin size={13} className="text-amber-400" />
                Endereço de Entrega
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {order.shippingAddress || "Entrega / Retirada em mãos"}
              </p>
              {order.notes && (
                <div className="mt-2 pt-2 border-t border-zinc-800/80 text-[11px] text-amber-300/90 italic">
                  &ldquo;{order.notes}&rdquo;
                </div>
              )}
            </div>
          </div>

          {/* Items Section */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Itens do Pedido & Ficha Técnica
            </h4>
            <div className="space-y-2.5">
              {order.items?.map((item: any) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {item.variant?.product?.imageUrl ? (
                      <img
                        src={item.variant.product.imageUrl}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover border border-zinc-700"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400">
                        <ShoppingBag size={18} />
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-semibold text-zinc-100">
                        {item.variant?.product?.name || "Produto"}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-mono text-zinc-400">
                          SKU: {item.variant?.sku}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">
                          {item.variant?.title}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-1">
                        Custo Estimado Insumos: {formatCurrency(item.unitCost)} / un
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold font-mono text-zinc-100">
                      {formatCurrency(item.total)}
                    </div>
                    <span className="text-xs text-zinc-400 font-mono">
                      {item.quantity}x {formatCurrency(item.unitPrice)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2 text-xs">
            <h4 className="font-semibold text-zinc-300 mb-2">
              Desdobramento Financeiro do Pedido
            </h4>
            <div className="flex justify-between text-zinc-400">
              <span>Valor dos Produtos:</span>
              <span className="font-mono text-zinc-200">{formatCurrency(order.totalProducts)}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Frete Pago pelo Cliente:</span>
              <span className="font-mono text-zinc-200">+{formatCurrency(order.shippingCost)}</span>
            </div>
            <div className="flex justify-between text-orange-400">
              <span>Comissão do Canal ({channel.label}):</span>
              <span className="font-mono">-{formatCurrency(order.platformFee)}</span>
            </div>
            <div className="flex justify-between text-zinc-400 border-t border-zinc-800/80 pt-2 font-medium">
              <span>Valor Líquido Recebido:</span>
              <span className="font-mono text-zinc-100">{formatCurrency(order.netAmount)}</span>
            </div>
            <div className="flex justify-between text-zinc-500">
              <span>Custo Insumos (Camiseta + DTF + Embalagem):</span>
              <span className="font-mono">-{formatCurrency(order.estimatedCMV)}</span>
            </div>
            <div className="flex justify-between text-emerald-400 font-bold border-t border-zinc-800 pt-2 text-sm">
              <span>Lucro Líquido Real Cordeiro Ink:</span>
              <span className="font-mono">{formatCurrency(order.netProfit)}</span>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer: Quick Status Transitions */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Alterar Status:</span>
            <div className="flex flex-wrap gap-1.5">
              {order.status !== "PAID" && (
                <button
                  disabled={isPending}
                  onClick={() => handleStatusChange(OrderStatus.PAID)}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/30 hover:bg-blue-500/20 transition cursor-pointer"
                >
                  Marcar Pago
                </button>
              )}
              {order.status !== "IN_PRODUCTION" && (
                <button
                  disabled={isPending}
                  onClick={() => handleStatusChange(OrderStatus.IN_PRODUCTION)}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/30 hover:bg-purple-500/20 transition cursor-pointer"
                >
                  Pôr na Produção
                </button>
              )}
              {order.status !== "READY" && (
                <button
                  disabled={isPending}
                  onClick={() => handleStatusChange(OrderStatus.READY)}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 transition cursor-pointer"
                >
                  Pronto / Embalado
                </button>
              )}
              {order.status !== "SHIPPED" && (
                <button
                  disabled={isPending}
                  onClick={() => handleStatusChange(OrderStatus.SHIPPED)}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-sky-500/10 text-sky-300 border border-sky-500/30 hover:bg-sky-500/20 transition cursor-pointer"
                >
                  Despachar Pedido
                </button>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
