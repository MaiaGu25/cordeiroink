"use client";

import { ShoppingBag, Clock, Flame, CheckCircle2, Truck, ArrowRight } from "lucide-react";
import Link from "next/link";

interface OrderStatusOverviewProps {
  statusCounts: Record<string, number>;
}

export function OrderStatusOverview({ statusCounts }: OrderStatusOverviewProps) {
  const steps = [
    {
      key: "NEW",
      label: "Novos",
      count: statusCounts["NEW"] || 0,
      icon: ShoppingBag,
    },
    {
      key: "PAID",
      label: "Pagos / Fila",
      count: statusCounts["PAID"] || 0,
      icon: Clock,
    },
    {
      key: "IN_PRODUCTION",
      label: "Em Prensagem",
      count: (statusCounts["IN_PRODUCTION"] || 0) + (statusCounts["WAITING_PRODUCTION"] || 0),
      icon: Flame,
      highlight: true,
    },
    {
      key: "READY",
      label: "Pronto / Embalado",
      count: statusCounts["READY"] || 0,
      icon: CheckCircle2,
      isSuccess: true,
    },
    {
      key: "SHIPPED",
      label: "Despachados",
      count: statusCounts["SHIPPED"] || 0,
      icon: Truck,
    },
  ];

  return (
    <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 backdrop-blur-sm shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">
            Fluxo Operacional de Pedidos
          </h3>
          <p className="text-xs text-zinc-500">
            Controle de estágio desde a aprovação até a expedição final.
          </p>
        </div>
        <Link
          href="/pedidos"
          className="text-xs text-zinc-400 hover:text-amber-400 font-medium flex items-center gap-1 transition-colors"
        >
          Quadro Kanban <ArrowRight size={12} />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.key}
              href={`/pedidos?status=${s.key}`}
              className={`p-4 rounded-xl border transition-all duration-200 ease-out flex flex-col justify-between group cursor-pointer ${
                s.highlight
                  ? "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40"
                  : s.isSuccess
                  ? "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40"
                  : "bg-zinc-950/60 border-zinc-800/60 hover:border-zinc-700/80 hover:bg-zinc-900/60"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-zinc-400">
                  {s.label}
                </span>
                <Icon
                  size={14}
                  className={
                    s.highlight
                      ? "text-amber-400/90"
                      : s.isSuccess
                      ? "text-emerald-400/90"
                      : "text-zinc-500 group-hover:text-zinc-300"
                  }
                />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold font-mono text-zinc-100 group-hover:translate-x-0.5 transition-transform">
                  {s.count}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">pedidos</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
