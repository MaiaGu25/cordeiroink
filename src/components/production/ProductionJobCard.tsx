"use client";

import { useTransition } from "react";
import {
  Flame,
  CheckCircle2,
  Shirt,
  Image as ImageIcon,
  ExternalLink,
  Loader2,
  Clock,
  Phone,
  PackageCheck,
} from "lucide-react";
import { completeProductionJob } from "@/actions/production";
import { toast } from "sonner";
import { CHANNEL_CONFIG, formatDate } from "@/lib/utils";

interface ProductionJobCardProps {
  job: any;
  onRefresh?: () => void;
}

export function ProductionJobCard({ job, onRefresh }: ProductionJobCardProps) {
  const [isPending, startTransition] = useTransition();

  const order = job.order;
  const channel = CHANNEL_CONFIG[order.channel] || {
    label: order.channel,
    dot: "bg-zinc-500",
    bg: "bg-zinc-900",
    text: "text-zinc-300",
  };

  const firstItem = order.items?.[0];
  const artImage = firstItem?.artMockupUrl || firstItem?.dtfPrint?.dtfPreviewUrl;

  // Monta a descrição em destaque da camiseta a pegar na prateleira
  const shirtModel = firstItem?.shirtModel || firstItem?.blankShirt?.shirtModel || "CAMISETA";
  const shirtColor = firstItem?.shirtColor || firstItem?.blankShirt?.shirtColor || "PRETA";
  const shirtSize = firstItem?.shirtSize || firstItem?.blankShirt?.shirtSize || "M";
  const shirtShelfText = `${shirtModel.toUpperCase()} ${shirtColor.toUpperCase()} ${shirtSize.toUpperCase()}`;

  const currentShirtStock = firstItem?.blankShirt?.stockQuantity ?? null;

  const handleComplete = () => {
    startTransition(async () => {
      try {
        await completeProductionJob(job.id);
        toast.success(
          `Peça ${order.orderNumber} prensada e concluída! Camiseta baixada do estoque físico.`
        );
        if (onRefresh) onRefresh();
      } catch (err: any) {
        toast.error("Erro ao concluir produção: " + err.message);
      }
    });
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-sm ${
        job.stepCompleted
          ? "border-emerald-500/20 bg-zinc-950/60 opacity-60"
          : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700/80 hover:shadow-lg hover:shadow-black/40"
      }`}
    >
      <div>
        {/* Header: Número do Pedido, Canal & Cliente */}
        <div className="p-4 border-b border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-zinc-100">
              {order.orderNumber}
            </span>
            <div className={`flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${channel.bg} ${channel.text} border-zinc-700/60`}>
              <span className={`w-1.5 h-1.5 rounded-full ${channel.dot}`} />
              <span>{channel.label}</span>
            </div>
          </div>

          <span className="text-[11px] text-zinc-500 font-mono">
            {formatDate(order.paidAt || order.createdAt)}
          </span>
        </div>

        {/* Cliente & Contato Rápido */}
        <div className="px-4 py-2.5 bg-zinc-950/40 border-b border-zinc-850 flex items-center justify-between text-xs">
          <span className="font-semibold text-zinc-200">{order.customerName}</span>
          {order.customerPhone && (
            <span className="text-zinc-400 font-mono flex items-center gap-1 text-[11px]">
              <Phone size={11} className="text-emerald-400" />
              {order.customerPhone}
            </span>
          )}
        </div>

        {/* Foto / Preview da Arte em Destaque (Visual para o Ateliê) */}
        <div className="relative h-56 bg-zinc-950 overflow-hidden group flex items-center justify-center border-b border-zinc-850">
          {artImage ? (
            <img
              src={artImage}
              alt="Arte da estampa"
              className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 text-zinc-600">
              <ImageIcon size={36} />
              <span className="text-xs font-mono">Sem anexo de arte</span>
            </div>
          )}

          {/* Badges sobrepostas na imagem */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
            <span className="px-2.5 py-1 rounded-lg bg-zinc-950/90 backdrop-blur-md text-[11px] font-bold text-zinc-100 border border-zinc-800 shadow-md">
              {firstItem?.artTitle || firstItem?.title || "Arte Sob Encomenda"}
            </span>

            <span className="px-2.5 py-1 rounded-lg bg-amber-500/90 text-zinc-950 font-bold text-[10px] font-mono shadow-md">
              {firstItem?.printSize || "A3 (Costas)"}
            </span>
          </div>

          {artImage && (
            <a
              href={artImage}
              target="_blank"
              rel="noreferrer"
              className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 text-[10px] font-medium border border-zinc-700/80 flex items-center gap-1 transition shadow-md"
            >
              <span>Ver Imagem Cheia</span>
              <ExternalLink size={10} />
            </a>
          )}
        </div>

        {/* Camiseta a Pegar na Prateleira (Destaque Máximo para Operador) */}
        <div className="p-4 space-y-3">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border-2 border-amber-500/30">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
              <Shirt size={13} />
              PEGAR NA PRATELEIRA:
            </span>
            <div className="text-base font-extrabold text-zinc-100 tracking-tight">
              {shirtShelfText}
            </div>
            <div className="mt-1 flex items-center justify-between text-xs font-mono text-zinc-400">
              <span>Qtd: {firstItem?.quantity || 1} unidade(s)</span>
              {currentShirtStock !== null && (
                <span className={currentShirtStock <= 3 ? "text-red-400 font-bold" : "text-emerald-400"}>
                  Saldo físico: {currentShirtStock} un
                </span>
              )}
            </div>
          </div>

          {/* Observações da Prensagem se houver */}
          {job.notes && (
            <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-850 text-xs text-zinc-300">
              <span className="text-zinc-500 font-medium block text-[10px]">INSTRUÇÃO / OBSERVAÇÃO:</span>
              <span>{job.notes}</span>
            </div>
          )}
        </div>
      </div>

      {/* Botão de 1 Clique: Prensado & Concluído */}
      <div className="p-4 pt-0">
        {job.stepCompleted ? (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-2">
            <CheckCircle2 size={16} />
            <span>Prensado & Pronto para Envio</span>
          </div>
        ) : (
          <button
            type="button"
            disabled={isPending}
            onClick={handleComplete}
            className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-amber-500/20 cursor-pointer active:scale-[0.98]"
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Baixando do estoque...
              </>
            ) : (
              <>
                <Flame size={16} />
                <span>Prensado & Concluído</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
