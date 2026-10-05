"use client";

import { useTransition } from "react";
import {
  Flame,
  CheckCircle2,
  Clock,
  Shirt,
  Scissors,
  Check,
  Package,
  Layers,
  Sparkles,
  AlertCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { updateProductionStep, completeProductionJob } from "@/actions/production";
import { toast } from "sonner";
import { CHANNEL_CONFIG, formatDate } from "@/lib/utils";

interface ProductionJobCardProps {
  job: any;
  onRefresh?: () => void;
}

export function ProductionJobCard({ job, onRefresh }: ProductionJobCardProps) {
  const [isPending, startTransition] = useTransition();

  const order = job.order;
  const channel = CHANNEL_CONFIG[order.channel] || { label: order.channel, dot: "bg-zinc-500" };

  const handleStepToggle = (
    stepKey: "stepBlankPicked" | "stepDtfPicked" | "stepPressed" | "stepQcPassed" | "stepPacked",
    currentVal: boolean
  ) => {
    startTransition(async () => {
      try {
        await updateProductionStep(job.id, stepKey, !currentVal);
        toast.success("Checklist de produção atualizado!");
        if (onRefresh) onRefresh();
      } catch (err: any) {
        toast.error("Erro ao atualizar etapa: " + err.message);
      }
    });
  };

  const handleCompleteAll = () => {
    startTransition(async () => {
      try {
        await completeProductionJob(job.id);
        toast.success(
          `Produção de ${order.orderNumber} concluída! Baixa nos insumos executada com sucesso.`
        );
        if (onRefresh) onRefresh();
      } catch (err: any) {
        toast.error("Erro ao concluir produção: " + err.message);
      }
    });
  };

  // Calcula progresso das etapas
  const stepsList = [
    job.stepBlankPicked,
    job.stepDtfPicked,
    job.stepPressed,
    job.stepQcPassed,
    job.stepPacked,
  ];
  const completedStepsCount = stepsList.filter(Boolean).length;
  const progressPercent = (completedStepsCount / 5) * 100;

  return (
    <div
      className={`p-5 rounded-2xl bg-zinc-900/40 border transition-all duration-200 shadow-sm flex flex-col justify-between ${
        job.stepCompleted
          ? "border-emerald-500/20 bg-zinc-900/20 opacity-70"
          : job.priority === "URGENT"
          ? "border-red-500/30"
          : "border-zinc-800/60 hover:border-zinc-700/80"
      }`}
    >
      <div>
        {/* Header: Order Number, Channel & Priority */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-zinc-100">
              {order.orderNumber}
            </span>
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-medium px-2 py-0.5 rounded-md bg-zinc-950 border border-zinc-800">
              <span className={`w-1.5 h-1.5 rounded-full ${channel.dot}`} />
              <span>{channel.label}</span>
            </div>
            {job.priority === "URGENT" && (
              <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-red-500/10 text-red-400 border border-red-500/20 uppercase">
                Urgente
              </span>
            )}
          </div>

          <div className="text-[11px] font-mono text-zinc-500">
            {completedStepsCount}/5 etapas
          </div>
        </div>

        {/* Client & Date */}
        <div className="flex items-center justify-between text-xs text-zinc-300 mb-3">
          <span className="font-semibold text-zinc-200">{order.customerName}</span>
          <span className="text-[11px] text-zinc-500">
            {formatDate(order.paidAt || order.createdAt)}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-zinc-950 rounded-full h-1 overflow-hidden border border-zinc-850 mb-4">
          <div
            className={`h-full transition-all duration-300 ${
              job.stepCompleted
                ? "bg-emerald-500"
                : progressPercent >= 60
                ? "bg-amber-400"
                : "bg-zinc-500"
            }`}
            style={{ width: `${job.stepCompleted ? 100 : progressPercent}%` }}
          />
        </div>

        {/* Items to Produce */}
        <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-850 mb-4 space-y-2.5">
          <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
            <Shirt size={12} className="text-zinc-400" />
            Especificação da Peça & Estampa
          </div>

          {order.items?.map((item: any) => {
            const itemTitle = item.title || item.variant?.product?.name || "Camiseta Personalizada";
            const artImage = item.artMockupUrl || item.dtfPrint?.dtfPreviewUrl;

            return (
              <div key={item.id} className="text-xs space-y-2">
                <div className="font-medium text-zinc-100 flex items-start justify-between gap-2">
                  <span>
                    {item.quantity}x {itemTitle}
                  </span>
                  {(item.shirtSize || item.variant?.size) && (
                    <span className="font-mono text-zinc-200 font-bold px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 shrink-0">
                      {item.shirtSize || item.variant?.size} • {item.shirtColor || item.variant?.color || "Preto"}
                    </span>
                  )}
                </div>

                {/* Arte e Mockup link */}
                {(item.artTitle || item.artMockupUrl) && (
                  <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800 text-[11px] flex items-center justify-between">
                    <div>
                      <span className="text-zinc-400 block font-medium">
                        Arte: {item.artTitle || "Personalizada"} ({item.printSize || "A3"})
                      </span>
                    </div>

                    {item.artMockupUrl && (
                      <a
                        href={item.artMockupUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-400 hover:underline flex items-center gap-1 font-mono shrink-0"
                      >
                        <span>Abrir Arte</span>
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                )}

                {/* Insumos a serem baixados */}
                <div className="pt-2 border-t border-zinc-900 text-[10px] text-zinc-500 space-y-0.5 font-mono">
                  <span className="text-zinc-400 font-sans block font-semibold mb-0.5">Baixa de estoque programada:</span>
                  {item.blankShirt && (
                    <div className="flex justify-between text-zinc-400">
                      <span>• {item.blankShirt.name}</span>
                      <span>{item.quantity} un</span>
                    </div>
                  )}
                  {item.dtfPrint && (
                    <div className="flex justify-between text-zinc-400">
                      <span>• {item.dtfPrint.name}</span>
                      <span>{item.quantity} un</span>
                    </div>
                  )}
                  {item.packaging && (
                    <div className="flex justify-between text-zinc-400">
                      <span>• {item.packaging.name}</span>
                      <span>{item.quantity} un</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {job.notes && (
            <div className="mt-2 p-2 rounded bg-zinc-900 text-[11px] text-zinc-300 border border-zinc-800">
              Instrução Operador: {job.notes}
            </div>
          )}
        </div>

        {/* Interactive Checklist Steps */}
        <div className="space-y-1.5 mb-4">
          <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
            Checklist Operacional de Montagem:
          </div>

          {/* Step 1: Blank Shirt Picked */}
          <button
            type="button"
            disabled={isPending || job.stepCompleted}
            onClick={() => handleStepToggle("stepBlankPicked", job.stepBlankPicked)}
            className={`w-full p-2 rounded-xl border text-left text-xs flex items-center justify-between transition cursor-pointer ${
              job.stepBlankPicked
                ? "bg-zinc-900/90 border-zinc-700 text-zinc-200"
                : "bg-zinc-950/40 border-zinc-800/60 text-zinc-400 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-4 h-4 rounded flex items-center justify-center border ${
                  job.stepBlankPicked
                    ? "bg-zinc-100 border-zinc-200 text-zinc-950 font-bold"
                    : "border-zinc-700 bg-zinc-900"
                }`}
              >
                {job.stepBlankPicked && <Check size={12} />}
              </div>
              <span>1. Separar Camiseta Lisa do Estoque</span>
            </div>
          </button>

          {/* Step 2: DTF Picked */}
          <button
            type="button"
            disabled={isPending || job.stepCompleted}
            onClick={() => handleStepToggle("stepDtfPicked", job.stepDtfPicked)}
            className={`w-full p-2 rounded-xl border text-left text-xs flex items-center justify-between transition cursor-pointer ${
              job.stepDtfPicked
                ? "bg-zinc-900/90 border-zinc-700 text-zinc-200"
                : "bg-zinc-950/40 border-zinc-800/60 text-zinc-400 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-4 h-4 rounded flex items-center justify-center border ${
                  job.stepDtfPicked
                    ? "bg-zinc-100 border-zinc-200 text-zinc-950 font-bold"
                    : "border-zinc-700 bg-zinc-900"
                }`}
              >
                {job.stepDtfPicked && <Check size={12} />}
              </div>
              <span>2. Separar e Recortar Folha DTF</span>
            </div>
          </button>

          {/* Step 3: Heat Pressed */}
          <button
            type="button"
            disabled={isPending || job.stepCompleted}
            onClick={() => handleStepToggle("stepPressed", job.stepPressed)}
            className={`w-full p-2 rounded-xl border text-left text-xs flex items-center justify-between transition cursor-pointer ${
              job.stepPressed
                ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                : "bg-zinc-950/40 border-zinc-800/60 text-zinc-400 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-4 h-4 rounded flex items-center justify-center border ${
                  job.stepPressed
                    ? "bg-amber-500 border-amber-400 text-zinc-950 font-bold"
                    : "border-zinc-700 bg-zinc-900"
                }`}
              >
                {job.stepPressed && <Check size={12} />}
              </div>
              <span className="flex items-center gap-1.5">
                3. Prensagem Térmica (160°C / 15s)
                <Flame size={12} className={job.stepPressed ? "text-amber-400" : "text-zinc-500"} />
              </span>
            </div>
          </button>

          {/* Step 4: Quality Control */}
          <button
            type="button"
            disabled={isPending || job.stepCompleted}
            onClick={() => handleStepToggle("stepQcPassed", job.stepQcPassed)}
            className={`w-full p-2 rounded-xl border text-left text-xs flex items-center justify-between transition cursor-pointer ${
              job.stepQcPassed
                ? "bg-zinc-900/90 border-zinc-700 text-zinc-200"
                : "bg-zinc-950/40 border-zinc-800/60 text-zinc-400 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-4 h-4 rounded flex items-center justify-center border ${
                  job.stepQcPassed
                    ? "bg-zinc-100 border-zinc-200 text-zinc-950 font-bold"
                    : "border-zinc-700 bg-zinc-900"
                }`}
              >
                {job.stepQcPassed && <Check size={12} />}
              </div>
              <span>4. Controle de Qualidade (Alinhamento & Aderência)</span>
            </div>
          </button>

          {/* Step 5: Packaging */}
          <button
            type="button"
            disabled={isPending || job.stepCompleted}
            onClick={() => handleStepToggle("stepPacked", job.stepPacked)}
            className={`w-full p-2 rounded-xl border text-left text-xs flex items-center justify-between transition cursor-pointer ${
              job.stepPacked
                ? "bg-zinc-900/90 border-zinc-700 text-zinc-200"
                : "bg-zinc-950/40 border-zinc-800/60 text-zinc-400 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-4 h-4 rounded flex items-center justify-center border ${
                  job.stepPacked
                    ? "bg-zinc-100 border-zinc-200 text-zinc-950 font-bold"
                    : "border-zinc-700 bg-zinc-900"
                }`}
              >
                {job.stepPacked && <Check size={12} />}
              </div>
              <span>5. Embalagem (Saco Zip + Tag)</span>
            </div>
          </button>
        </div>
      </div>

      {/* Footer / Final Completion Button with Stock Deduction Trigger */}
      <div className="pt-3 border-t border-zinc-850">
        {job.stepCompleted ? (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-2">
            <CheckCircle2 size={15} />
            <span>Produção Concluída & Estoque Baixado</span>
          </div>
        ) : (
          <button
            type="button"
            disabled={isPending}
            onClick={handleCompleteAll}
            className="w-full py-2.5 px-3 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Processando Baixa de Insumos...
              </>
            ) : (
              <>
                <CheckCircle2 size={15} />
                <span>Concluir Produção & Dar Baixa no Estoque</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
