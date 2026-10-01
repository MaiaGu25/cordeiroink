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
  const channel = CHANNEL_CONFIG[order.channel] || { label: order.channel };

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
          `Produção de ${order.orderNumber} concluída! Estoque de insumos baixado automaticamente e pedido pronto para expedição.`
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
      className={`p-5 rounded-2xl bg-zinc-900/80 border transition-all shadow-sm flex flex-col justify-between ${
        job.stepCompleted
          ? "border-emerald-500/30 bg-zinc-900/40 opacity-75"
          : job.priority === "URGENT"
          ? "border-red-500/40 shadow-red-950/20"
          : "border-zinc-800 hover:border-zinc-700"
      }`}
    >
      <div>
        {/* Header: Order Number, Channel & Priority */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-amber-400">
              {order.orderNumber}
            </span>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded font-semibold border ${channel.bg} ${channel.text} ${channel.border}`}
            >
              {channel.label}
            </span>
            {job.priority === "URGENT" && (
              <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-red-500/20 text-red-400 border border-red-500/30 uppercase animate-pulse">
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
          <span className="font-semibold">{order.customerName}</span>
          <span className="text-[11px] text-zinc-500">
            {formatDate(order.paidAt || order.createdAt)}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden border border-zinc-800 mb-4">
          <div
            className={`h-full transition-all duration-300 ${
              job.stepCompleted
                ? "bg-emerald-500"
                : progressPercent >= 60
                ? "bg-amber-400"
                : "bg-blue-500"
            }`}
            style={{ width: `${job.stepCompleted ? 100 : progressPercent}%` }}
          />
        </div>

        {/* Items to Produce */}
        <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 mb-4 space-y-2">
          <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Shirt size={12} className="text-amber-400" />
            Peça & Especificação DTF
          </div>
          {order.items?.map((item: any) => (
            <div key={item.id} className="text-xs">
              <div className="font-medium text-zinc-100 flex items-center justify-between">
                <span>
                  {item.quantity}x {item.variant?.product?.name}
                </span>
                <span className="font-mono text-amber-400 font-bold">
                  {item.variant?.size} / {item.variant?.color}
                </span>
              </div>
              <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                SKU: {item.variant?.sku}
              </div>

              {/* BOM details preview */}
              {item.variant?.bom && item.variant.bom.length > 0 && (
                <div className="mt-2 pt-2 border-t border-zinc-900 text-[10px] text-zinc-400 space-y-0.5">
                  <span className="text-zinc-500 font-semibold block">Insumos vinculados (BOM):</span>
                  {item.variant.bom.map((b: any) => (
                    <div key={b.id} className="flex justify-between text-zinc-400">
                      <span>• {b.rawItem?.name}</span>
                      <span className="font-mono text-zinc-400">{b.quantity} un</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {job.notes && (
            <div className="mt-2 p-2 rounded bg-zinc-900 text-[11px] text-amber-300 border border-amber-500/20">
              Obs Operador: {job.notes}
            </div>
          )}
        </div>

        {/* Interactive Checklist Steps */}
        <div className="space-y-2 mb-4">
          <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
            Checklist Operacional de Montagem:
          </div>

          {/* Step 1: Blank Shirt Picked */}
          <button
            type="button"
            disabled={isPending || job.stepCompleted}
            onClick={() => handleStepToggle("stepBlankPicked", job.stepBlankPicked)}
            className={`w-full p-2 rounded-lg border text-left text-xs flex items-center justify-between transition cursor-pointer ${
              job.stepBlankPicked
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-4 h-4 rounded flex items-center justify-center border ${
                  job.stepBlankPicked
                    ? "bg-emerald-500 border-emerald-400 text-zinc-950 font-bold"
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
            className={`w-full p-2 rounded-lg border text-left text-xs flex items-center justify-between transition cursor-pointer ${
              job.stepDtfPicked
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-4 h-4 rounded flex items-center justify-center border ${
                  job.stepDtfPicked
                    ? "bg-emerald-500 border-emerald-400 text-zinc-950 font-bold"
                    : "border-zinc-700 bg-zinc-900"
                }`}
              >
                {job.stepDtfPicked && <Check size={12} />}
              </div>
              <span>2. Separar e Recortar Estampa DTF</span>
            </div>
          </button>

          {/* Step 3: Heat Pressed */}
          <button
            type="button"
            disabled={isPending || job.stepCompleted}
            onClick={() => handleStepToggle("stepPressed", job.stepPressed)}
            className={`w-full p-2 rounded-lg border text-left text-xs flex items-center justify-between transition cursor-pointer ${
              job.stepPressed
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-4 h-4 rounded flex items-center justify-center border ${
                  job.stepPressed
                    ? "bg-emerald-500 border-emerald-400 text-zinc-950 font-bold"
                    : "border-zinc-700 bg-zinc-900"
                }`}
              >
                {job.stepPressed && <Check size={12} />}
              </div>
              <span className="flex items-center gap-1.5">
                3. Prensagem Térmica (160°C / 15s)
                <Flame size={12} className={job.stepPressed ? "text-emerald-400" : "text-amber-400"} />
              </span>
            </div>
          </button>

          {/* Step 4: Quality Control */}
          <button
            type="button"
            disabled={isPending || job.stepCompleted}
            onClick={() => handleStepToggle("stepQcPassed", job.stepQcPassed)}
            className={`w-full p-2 rounded-lg border text-left text-xs flex items-center justify-between transition cursor-pointer ${
              job.stepQcPassed
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-4 h-4 rounded flex items-center justify-center border ${
                  job.stepQcPassed
                    ? "bg-emerald-500 border-emerald-400 text-zinc-950 font-bold"
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
            className={`w-full p-2 rounded-lg border text-left text-xs flex items-center justify-between transition cursor-pointer ${
              job.stepPacked
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-4 h-4 rounded flex items-center justify-center border ${
                  job.stepPacked
                    ? "bg-emerald-500 border-emerald-400 text-zinc-950 font-bold"
                    : "border-zinc-700 bg-zinc-900"
                }`}
              >
                {job.stepPacked && <Check size={12} />}
              </div>
              <span>5. Embalagem (Saco Zip + Tag + Brinde)</span>
            </div>
          </button>
        </div>
      </div>

      {/* Footer / Final Completion Button with Stock Deduction Trigger */}
      <div className="pt-3 border-t border-zinc-800">
        {job.stepCompleted ? (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-2">
            <CheckCircle2 size={16} />
            <span>Produção Concluída & Estoque Baixado</span>
          </div>
        ) : (
          <button
            type="button"
            disabled={isPending}
            onClick={handleCompleteAll}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Processando Baixa de Estoque...
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
