"use client";

import { useState, useTransition } from "react";
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
  AlertTriangle,
  X,
  RotateCcw,
} from "lucide-react";
import { completeProductionJob, registerProductionLoss } from "@/actions/production";
import { toast } from "sonner";
import { CHANNEL_CONFIG, formatDate, formatCurrency } from "@/lib/utils";

interface ProductionJobCardProps {
  job: any;
  onRefresh?: () => void;
}

export function ProductionJobCard({ job, onRefresh }: ProductionJobCardProps) {
  const [isPending, startTransition] = useTransition();
  const [isLossPending, startLossTransition] = useTransition();
  const [isLossModalOpen, setIsLossModalOpen] = useState(false);
  const [selectedLossReason, setSelectedLossReason] = useState("Prensagem desalinhada / torta");
  const [lossDetails, setLossDetails] = useState("");

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
  const shirtCost = firstItem?.blankShirt?.costPrice || 25.0;

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

  const handleRegisterLoss = () => {
    const finalReason = lossDetails.trim()
      ? `${selectedLossReason} - ${lossDetails.trim()}`
      : selectedLossReason;

    startLossTransition(async () => {
      try {
        await registerProductionLoss(job.id, finalReason);
        toast.success(
          `Perda registrada! +1 camiseta (${shirtShelfText}) descontada do estoque e custo operacional registrado.`
        );
        setIsLossModalOpen(false);
        setLossDetails("");
        if (onRefresh) onRefresh();
      } catch (err: any) {
        toast.error("Erro ao registrar perda: " + err.message);
      }
    });
  };

  return (
    <>
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
              <div
                className={`flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${channel.bg} ${channel.text} border-zinc-700/60`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${channel.dot}`} />
                <span>{channel.label}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {job.reworkCount > 0 && (
                <span
                  title={`${job.reworkCount} perda(s) / retrabalho(s) registrada(s): ${job.lossReason || ""}`}
                  className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20"
                >
                  <AlertTriangle size={11} />
                  <span>{job.reworkCount}x retrabalho</span>
                </span>
              )}
              <span className="text-[11px] text-zinc-500 font-mono">
                {formatDate(order.paidAt || order.createdAt)}
              </span>
            </div>
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
                <span>Qtd do pedido: {firstItem?.quantity || 1} unidade(s)</span>
                {currentShirtStock !== null && (
                  <span
                    className={
                      currentShirtStock <= 3
                        ? "text-red-400 font-bold"
                        : "text-emerald-400"
                    }
                  >
                    Saldo físico: {currentShirtStock} un
                  </span>
                )}
              </div>
            </div>

            {/* Observações da Prensagem se houver */}
            {job.notes && (
              <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-850 text-xs text-zinc-300">
                <span className="text-zinc-500 font-medium block text-[10px]">
                  INSTRUÇÃO / OBSERVAÇÃO:
                </span>
                <span>{job.notes}</span>
              </div>
            )}
          </div>
        </div>

        {/* Botões de Ação na Produção */}
        <div className="p-4 pt-0 space-y-2">
          {job.stepCompleted ? (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-2">
              <CheckCircle2 size={16} />
              <span>Prensado & Pronto para Envio</span>
            </div>
          ) : (
            <>
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

              <button
                type="button"
                onClick={() => setIsLossModalOpen(true)}
                className="w-full py-2 px-3 rounded-xl bg-zinc-950 hover:bg-red-950/30 text-zinc-400 hover:text-red-400 border border-zinc-850 hover:border-red-900/40 text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <AlertTriangle size={13} className="text-red-400/90" />
                <span>Registrar Perda / Retrabalho</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Modal de Confirmação de Perda / Retrabalho */}
      {isLossModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">
                    Registrar Perda / Retrabalho
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    Pedido {order.orderNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLossModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Alerta de Impacto no Estoque e Financeiro */}
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-200 space-y-1.5">
                <span className="font-bold flex items-center gap-1.5 text-red-300">
                  <AlertTriangle size={13} />
                  Impacto Operacional Imediato:
                </span>
                <p className="text-[11px] text-red-200/90 leading-relaxed">
                  Será descontada <strong>+1 camiseta lisa</strong> (
                  <span className="font-mono">{shirtShelfText}</span>) do estoque físico
                  e lançado um custo operacional de{" "}
                  <strong>{formatCurrency(shirtCost)}</strong> no DRE/Financeiro com log de auditoria.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Motivo da Falha / Retrabalho *
                </label>
                <select
                  value={selectedLossReason}
                  onChange={(e) => setSelectedLossReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-red-500"
                >
                  <option value="Prensagem desalinhada / torta">
                    Prensagem desalinhada / torta
                  </option>
                  <option value="Temperatura ou tempo incorreto">
                    Temperatura ou tempo incorreto (queimou / não fixou)
                  </option>
                  <option value="Falha de adesão do filme DTF">
                    Falha de adesão do filme DTF (descolou pó de poliamida)
                  </option>
                  <option value="Mancha ou defeito no tecido da camiseta">
                    Mancha ou defeito de fábrica no tecido da camiseta
                  </option>
                  <option value="Arte ou tamanho errado impresso">
                    Arte ou tamanho errado impresso
                  </option>
                  <option value="Outro motivo operacional">
                    Outro motivo operacional
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Observações complementares (opcional)
                </label>
                <textarea
                  rows={2}
                  value={lossDetails}
                  onChange={(e) => setLossDetails(e.target.value)}
                  placeholder="Ex: Folha DTF repuxou ao retirar a quente..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsLossModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isLossPending}
                  onClick={handleRegisterLoss}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isLossPending ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <RotateCcw size={13} />
                      <span>Confirmar Perda & Baixar +1</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
