"use client";

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/HoverCard";
import { formatCurrency, STATUS_CONFIG } from "@/lib/utils";
import { Shirt, Flame } from "lucide-react";

interface OrderHoverPreviewProps {
  order: any;
  children: React.ReactNode;
}

export function OrderHoverPreview({ order, children }: OrderHoverPreviewProps) {
  const status = STATUS_CONFIG[order.status] || { label: order.status };
  const firstItem = order.items?.[0];
  const job = order.productionJob;

  const itemTitle = firstItem?.title || firstItem?.variant?.product?.name || "Camiseta Personalizada";
  const previewImage = firstItem?.artMockupUrl || firstItem?.dtfPrint?.dtfPreviewUrl || firstItem?.variant?.product?.imageUrl;
  const shirtLabel = firstItem?.shirtSize ? `${firstItem.shirtSize} • ${firstItem.shirtColor || "Preto"}` : firstItem?.variant?.title || "Tamanho padrão";

  return (
    <HoverCard openDelay={200} closeDelay={150}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>

      <HoverCardContent align="start" className="w-80 p-3.5 space-y-3">
        {/* Header Preview */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-zinc-100">
              {order.orderNumber}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${status.bg}`}>
              {status.label}
            </span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">
            {order.items?.length || 1} {order.items?.length === 1 ? "peça" : "peças"}
          </span>
        </div>

        {/* Item with Photo and Size */}
        {firstItem && (
          <div className="flex items-start gap-3">
            {previewImage ? (
              <img
                src={previewImage}
                alt=""
                className="w-14 h-14 rounded-lg object-cover border border-zinc-800 shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-600 shrink-0">
                <Shirt size={20} />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-zinc-200 block truncate" title={itemTitle}>
                {itemTitle}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] font-mono text-zinc-300 font-bold px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800">
                  {shirtLabel}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {firstItem.quantity} un
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Press / Production Status */}
        <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800/80 text-[11px] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 flex items-center gap-1.5">
              <Flame size={12} className="text-amber-400" />
              Status de Confecção:
            </span>
            <span className="font-medium text-zinc-300">
              {job?.stepCompleted
                ? "Prensada & Embalada"
                : job?.stepPressed
                ? "Prensagem OK (160°C)"
                : job?.stepBlankPicked
                ? "Camiseta Separada"
                : "Aguardando Prensa"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-zinc-400">
          <span>Líquido: {formatCurrency(order.netAmount)}</span>
          <span className="text-emerald-400 font-semibold">
            Lucro: {formatCurrency(order.netProfit)}
          </span>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
