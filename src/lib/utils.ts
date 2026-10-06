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

// Configuração refinada e monocromática para evitar ruído visual
export const CHANNEL_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  WHATSAPP: {
    label: "WhatsApp",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    dot: "bg-emerald-400",
  },
  INSTAGRAM: {
    label: "Instagram Direct",
    bg: "bg-pink-500/10",
    text: "text-pink-400",
    border: "border-pink-500/20",
    dot: "bg-pink-400",
  },
  MANUAL: {
    label: "Venda Direta",
    bg: "bg-zinc-900/60",
    text: "text-zinc-300",
    border: "border-zinc-800",
    dot: "bg-emerald-500/80",
  },
  SHOPEE: {
    label: "Shopee",
    bg: "bg-zinc-900/60",
    text: "text-zinc-300",
    border: "border-zinc-800",
    dot: "bg-orange-500/80",
  },
  SHEIN: {
    label: "Shein",
    bg: "bg-zinc-900/60",
    text: "text-zinc-300",
    border: "border-zinc-800",
    dot: "bg-purple-400/80",
  },
  TIKTOK: {
    label: "TikTok Shop",
    bg: "bg-zinc-900/60",
    text: "text-zinc-300",
    border: "border-zinc-800",
    dot: "bg-cyan-400/80",
  },
};

// Status monocromáticos padrão com cores apenas em estados críticos ou conclusivos
export const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; dot: string }
> = {
  NEW: {
    label: "Novo",
    bg: "bg-zinc-900/70 border-zinc-800 text-zinc-400",
    text: "text-zinc-400",
    dot: "bg-zinc-500",
  },
  PAID: {
    label: "Pago",
    bg: "bg-zinc-900/70 border-zinc-800 text-zinc-300",
    text: "text-zinc-300",
    dot: "bg-zinc-400",
  },
  WAITING_PRODUCTION: {
    label: "Fila Produção",
    bg: "bg-zinc-900/70 border-zinc-800 text-zinc-300",
    text: "text-zinc-300",
    dot: "bg-amber-400",
  },
  IN_PRODUCTION: {
    label: "Em Produção",
    bg: "bg-amber-500/10 border-amber-500/20 text-amber-300",
    text: "text-amber-300",
    dot: "bg-amber-400 animate-pulse",
  },
  READY: {
    label: "Pronto",
    bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
  },
  SHIPPED: {
    label: "Despachado",
    bg: "bg-zinc-900/70 border-zinc-800 text-zinc-300",
    text: "text-zinc-300",
    dot: "bg-sky-400",
  },
  DELIVERED: {
    label: "Entregue",
    bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
  },
  CANCELLED: {
    label: "Cancelado",
    bg: "bg-red-500/10 border-red-500/20 text-red-400",
    text: "text-red-400",
    dot: "bg-red-400",
  },
};
