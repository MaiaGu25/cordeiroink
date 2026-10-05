"use client";

import { useTransition } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/Sheet";
import { formatCurrency, formatDate, CHANNEL_CONFIG, STATUS_CONFIG } from "@/lib/utils";
import { OrderStatus } from "@prisma/client";
import { updateOrderStatus } from "@/actions/orders";
import { toast } from "sonner";
import {
  User,
  MapPin,
  Phone,
  Mail,
  ShoppingBag,
  Flame,
  CheckCircle2,
  DollarSign,
  Layers,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

interface OrderSheetProps {
  order: any | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdated?: () => void;
}

export function OrderSheet({
  order,
  isOpen,
  onClose,
  onOrderUpdated,
}: OrderSheetProps) {
  const [isPending, startTransition] = useTransition();

  if (!order) return null;

  const channel = CHANNEL_CONFIG[order.channel] || { label: order.channel, dot: "bg-zinc-500" };
  const status = STATUS_CONFIG[order.status] || { label: order.status, dot: "bg-zinc-400" };

  const handleStatusChange = (newStatus: OrderStatus) => {
    startTransition(async () => {
      try {
        await updateOrderStatus(order.id, newStatus);
        toast.success(
          `Status do pedido ${order.orderNumber} atualizado para ${STATUS_CONFIG[newStatus]?.label || newStatus}`
        );
        if (onOrderUpdated) onOrderUpdated();
        onClose();
      } catch (err: any) {
        toast.error("Erro ao atualizar status: " + err.message);
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="overflow-y-auto">
        {/* Header */}
        <SheetHeader>
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${channel.dot}`} />
            <span className="text-xs font-semibold text-zinc-300">
              {channel.label}
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-xs text-zinc-500">
              {formatDate(order.createdAt)}
            </span>
          </div>

          <SheetTitle className="flex items-center justify-between">
            <span className="font-mono text-lg text-zinc-100">
              {order.orderNumber}
            </span>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full border ${status.bg} font-medium mr-6`}>
              {status.label}
            </span>
          </SheetTitle>

          <SheetDescription>
            Detalhes cadastrais, peças sob encomenda e demonstrativo de margem líquida.
          </SheetDescription>
        </SheetHeader>

        {/* Content Body */}
        <div className="flex-1 p-6 space-y-6">
          {/* Customer & Delivery Section */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <User size={13} className="text-zinc-400" />
              Destinatário & Envio
            </h4>

            <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60 space-y-2 text-xs">
              <div className="font-semibold text-zinc-200">
                {order.customerName}
              </div>
              {order.customerPhone && (
                <div className="flex items-center gap-2 text-zinc-400">
                  <Phone size={12} className="text-zinc-500" />
                  <span>{order.customerPhone}</span>
                </div>
              )}
              {order.customerEmail && (
                <div className="flex items-center gap-2 text-zinc-400">
                  <Mail size={12} className="text-zinc-500" />
                  <span>{order.customerEmail}</span>
                </div>
              )}
              <div className="pt-2 border-t border-zinc-800/80 flex items-start gap-2 text-zinc-400">
                <MapPin size={13} className="text-zinc-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {order.shippingAddress || "Entrega ou retirada direta no ateliê"}
                </span>
              </div>
              {order.notes && (
                <div className="mt-2 p-2 rounded bg-zinc-950 border border-zinc-800/80 text-[11px] text-zinc-300 italic">
                  &ldquo;{order.notes}&rdquo;
                </div>
              )}
            </div>
          </div>

          {/* Items & Insumos */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingBag size={13} className="text-zinc-400" />
              Peças Sob Encomenda & Insumos Gastos
            </h4>

            <div className="space-y-2.5">
              {order.items?.map((item: any) => {
                const itemTitle = item.title || item.variant?.product?.name || "Camiseta Personalizada";
                const previewImg = item.artMockupUrl || item.dtfPrint?.dtfPreviewUrl || item.variant?.product?.imageUrl;

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60 space-y-3 text-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {previewImg ? (
                          <img
                            src={previewImg}
                            alt=""
                            className="w-14 h-14 rounded-lg object-cover border border-zinc-800 shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-600 shrink-0">
                            <ShoppingBag size={18} />
                          </div>
                        )}
                        <div>
                          <span className="font-semibold text-zinc-200 block text-xs">
                            {itemTitle}
                          </span>
                          {(item.shirtSize || item.variant?.size) && (
                            <div className="flex items-center gap-2 mt-1 font-mono text-[11px] text-zinc-400">
                              <span className="text-zinc-300 font-semibold px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800">
                                {item.shirtSize || item.variant?.size} • {item.shirtColor || item.variant?.color || "Preto"}
                              </span>
                              {item.printSize && (
                                <span className="text-zinc-500 font-mono">
                                  {item.printSize}
                                </span>
                              )}
                            </div>
                          )}

                          {item.artMockupUrl && (
                            <a
                              href={item.artMockupUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-amber-400 hover:underline font-mono"
                            >
                              <span>Ver Arquivo da Arte</span>
                              <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono font-bold text-zinc-100 block">
                          {formatCurrency(item.total)}
                        </span>
                        <span className="font-mono text-[10px] text-zinc-500">
                          {item.quantity}x {formatCurrency(item.unitPrice)}
                        </span>
                      </div>
                    </div>

                    {/* Breakdown de Insumos gastos no item */}
                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-850 space-y-1 text-[11px] font-mono">
                      <span className="text-zinc-500 uppercase font-sans text-[10px] block font-semibold mb-1">
                        Insumos Consumidos no Estoque:
                      </span>
                      {item.blankShirt && (
                        <div className="flex justify-between text-zinc-300">
                          <span>• {item.blankShirt.name}</span>
                          <span className="text-zinc-500">{formatCurrency(item.blankShirt.costPrice)}</span>
                        </div>
                      )}
                      {item.dtfPrint && (
                        <div className="flex justify-between text-zinc-300">
                          <span>• {item.dtfPrint.name} ({item.dtfPrint.dtfPrintSize || "A3"})</span>
                          <span className="text-zinc-500">{formatCurrency(item.dtfPrint.costPrice)}</span>
                        </div>
                      )}
                      {item.packaging && (
                        <div className="flex justify-between text-zinc-300">
                          <span>• {item.packaging.name}</span>
                          <span className="text-zinc-500">{formatCurrency(item.packaging.costPrice)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-zinc-400 pt-1 border-t border-zinc-900 font-semibold">
                        <span>Custo Unitário Total (CMV):</span>
                        <span className="text-amber-400/90">{formatCurrency(item.unitCost)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign size={13} className="text-zinc-400" />
              Demonstrativo Financeiro do Pedido
            </h4>

            <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-zinc-300">
                <span className="font-sans text-zinc-400">Valor dos Produtos:</span>
                <span>{formatCurrency(order.totalProducts)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span className="font-sans text-zinc-500">Frete Pago pelo Cliente:</span>
                <span>+{formatCurrency(order.shippingCost)}</span>
              </div>
              {order.platformFee > 0 && (
                <div className="flex justify-between text-orange-400/90">
                  <span className="font-sans">Taxa do Marketplace ({channel.label}):</span>
                  <span>-{formatCurrency(order.platformFee)}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-200 border-t border-zinc-800/80 pt-2 font-semibold">
                <span className="font-sans text-zinc-400">Valor Líquido Recebido:</span>
                <span>{formatCurrency(order.netAmount)}</span>
              </div>
              <div className="flex justify-between text-amber-400/90">
                <span className="font-sans">Custo Insumos (Camiseta + DTF + Tag):</span>
                <span>-{formatCurrency(order.estimatedCMV)}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold border-t border-zinc-800 pt-2 text-sm">
                <span className="font-sans">Lucro Líquido Real:</span>
                <span>{formatCurrency(order.netProfit)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer / Quick Status Actions */}
        <SheetFooter className="flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {order.status !== "PAID" && (
              <button
                disabled={isPending}
                onClick={() => handleStatusChange(OrderStatus.PAID)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 transition cursor-pointer"
              >
                Marcar Pago
              </button>
            )}
            {order.status !== "IN_PRODUCTION" && (
              <button
                disabled={isPending}
                onClick={() => handleStatusChange(OrderStatus.IN_PRODUCTION)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition cursor-pointer"
              >
                Pôr na Prensa
              </button>
            )}
            {order.status !== "READY" && (
              <button
                disabled={isPending}
                onClick={() => handleStatusChange(OrderStatus.READY)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition cursor-pointer"
              >
                Pronto / Embalado
              </button>
            )}
            {order.status !== "SHIPPED" && (
              <button
                disabled={isPending}
                onClick={() => handleStatusChange(OrderStatus.SHIPPED)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 transition cursor-pointer"
              >
                Despachar
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium transition cursor-pointer"
          >
            Fechar
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
