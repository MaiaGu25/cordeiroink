"use client";

import { ShoppingBag, Clock, Flame, CheckCircle2, Truck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { STATUS_CONFIG } from "@/lib/utils";

interface StatusCount {
  status: string;
  count: number;
}

interface OrderStatusOverviewProps {
  statusCounts: Record<string, number>;
}

export function OrderStatusOverview({ statusCounts }: OrderStatusOverviewProps) {
  const steps = [
    {
      key: "NEW",
      label: "Novos Pedidos",
      icon: ShoppingBag,
      count: statusCounts["NEW"] || 0,
      color: "text-zinc-300",
      border: "border-zinc-700",
      bg: "bg-zinc-800/40",
    },
    {
      key: "PAID",
      label: "Pagos / Fila",
      icon: Clock,
      count: statusCounts["PAID"] || 0,
      color: "text-blue-400",
      border: "border-blue-500/30",
      bg: "bg-blue-500/10",
    },
    {
      key: "IN_PRODUCTION",
      label: "Prensagem & DTF",
      icon: Flame,
      count: (statusCounts["IN_PRODUCTION"] || 0) + (statusCounts["WAITING_PRODUCTION"] || 0),
      color: "text-amber-400",
      border: "border-amber-500/30",
      bg: "bg-amber-500/10",
    },
    {
      key: "READY",
      label: "Pronto / Embalado",
      icon: CheckCircle2,
      count: statusCounts["READY"] || 0,
      color: "text-emerald-400",
      border: "border-emerald-500/30",
      bg: "bg-emerald-500/10",
    },
    {
      key: "SHIPPED",
      label: "Despachados",
      icon: Truck,
      count: statusCounts["SHIPPED"] || 0,
      color: "text-sky-400",
      border: "border-sky-500/30",
      bg: "bg-sky-500/10",
    },
  ];

  return (
    <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100">
            Funil Operacional de Pedidos
          </h3>
          <p className="text-[11px] text-zinc-400">
            Visão em tempo real do fluxo de vida dos pedidos da estamparia.
          </p>
        </div>
        <Link
          href="/pedidos"
          className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition"
        >
          Ver Quadro Kanban <ArrowRight size={12} />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.key}
              href={`/pedidos?status=${s.key}`}
              className={`p-3.5 rounded-xl border ${s.border} ${s.bg} hover:brightness-110 transition flex flex-col justify-between group`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-zinc-300">
                  {s.label}
                </span>
                <Icon size={14} className={s.color} />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold font-mono text-zinc-100 group-hover:scale-105 transition-transform">
                  {s.count}
                </span>
                <span className="text-[10px] text-zinc-500">pedidos</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
