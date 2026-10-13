"use client";

import { formatDate } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  FileEdit,
  PlusCircle,
  XCircle,
  Truck,
  Layers,
  User,
} from "lucide-react";

interface AuditLogItem {
  id: string;
  action: string;
  entity: string;
  userName?: string | null;
  userEmail?: string | null;
  details?: string | null;
  createdAt: string | Date;
}

interface OrderTimelineProps {
  logs: AuditLogItem[] | undefined;
}

export function OrderTimeline({ logs = [] }: OrderTimelineProps) {
  if (!logs || logs.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-850 text-center text-xs text-zinc-500 font-mono">
        Nenhum evento registrado ainda na trilha de auditoria.
      </div>
    );
  }

  const getActionConfig = (action: string) => {
    switch (action) {
      case "ORDER_CREATED":
        return {
          label: "Pedido Criado",
          icon: PlusCircle,
          color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        };
      case "ORDER_STATUS_CHANGED":
        return {
          label: "Status Atualizado",
          icon: Clock,
          color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        };
      case "ORDER_UPDATED":
        return {
          label: "Dados Editados",
          icon: FileEdit,
          color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
        };
      case "ORDER_CANCELLED":
        return {
          label: "Pedido Cancelado",
          icon: XCircle,
          color: "text-red-400 bg-red-500/10 border-red-500/20",
        };
      case "PRODUCTION_COMPLETED_STOCK_DEDUCTED":
        return {
          label: "Prensado & Concluído",
          icon: CheckCircle2,
          color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        };
      case "REWORK_LOGGED":
        return {
          label: "Perda / Retrabalho",
          icon: AlertTriangle,
          color: "text-red-400 bg-red-500/10 border-red-500/20",
        };
      default:
        return {
          label: action,
          icon: Layers,
          color: "text-zinc-400 bg-zinc-800 border-zinc-700",
        };
    }
  };

  return (
    <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
      {logs.map((log) => {
        const config = getActionConfig(log.action);
        const Icon = config.icon;
        const authorName = log.userName || log.userEmail?.split("@")[0] || "Sistema";

        return (
          <div key={log.id} className="relative group">
            {/* Timeline Node Dot */}
            <div
              className={`absolute -left-6 top-1 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${config.color}`}
            >
              <Icon size={11} />
            </div>

            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-850/80 hover:border-zinc-700/80 transition-colors space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-zinc-200">
                    {config.label}
                  </span>
                  <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center gap-1">
                    <User size={10} className="text-zinc-500" />
                    {authorName}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {formatDate(log.createdAt)}
                </span>
              </div>

              {log.details && (
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  {log.details}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
