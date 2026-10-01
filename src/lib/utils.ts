import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return "0";
  return new Intl.NumberFormat("pt-BR").format(value);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatDateShort(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(d);
}

export const CHANNEL_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string; iconColor: string }
> = {
  SHOPEE: {
    label: "Shopee",
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    border: "border-orange-500/20",
    iconColor: "#f97316",
  },
  SHEIN: {
    label: "Shein",
    bg: "bg-purple-500/10",
    text: "text-purple-300",
    border: "border-purple-500/20",
    iconColor: "#c084fc",
  },
  TIKTOK: {
    label: "TikTok Shop",
    bg: "bg-cyan-500/10",
    text: "text-cyan-300",
    border: "border-cyan-500/20",
    iconColor: "#06b6d4",
  },
  MANUAL: {
    label: "Venda Direta / Whats",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    iconColor: "#10b981",
  },
};

export const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; dot: string }
> = {
  NEW: {
    label: "Novo",
    bg: "bg-zinc-800 text-zinc-300 border-zinc-700",
    text: "text-zinc-300",
    dot: "bg-zinc-400",
  },
  PAID: {
    label: "Pago",
    bg: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    text: "text-blue-400",
    dot: "bg-blue-400",
  },
  WAITING_PRODUCTION: {
    label: "Fila Produção",
    bg: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    text: "text-amber-300",
    dot: "bg-amber-400 animate-pulse",
  },
  IN_PRODUCTION: {
    label: "Em Produção",
    bg: "bg-purple-500/10 text-purple-300 border-purple-500/20",
    text: "text-purple-300",
    dot: "bg-purple-400 animate-ping",
  },
  READY: {
    label: "Pronto / Embalado",
    bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
  },
  SHIPPED: {
    label: "Despachado",
    bg: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    text: "text-sky-400",
    dot: "bg-sky-400",
  },
  DELIVERED: {
    label: "Entregue",
    bg: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    text: "text-teal-400",
    dot: "bg-teal-400",
  },
  CANCELLED: {
    label: "Cancelado",
    bg: "bg-red-500/10 text-red-400 border-red-500/20",
    text: "text-red-400",
    dot: "bg-red-400",
  },
};
