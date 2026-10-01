"use client";

import { Search, Bell, AlertTriangle, PlusCircle, Sparkles } from "lucide-react";
import { useState } from "react";
import { GlobalCommandSearch } from "./GlobalCommandSearch";
import Link from "next/link";

interface TopbarProps {
  criticalCount?: number;
}

export function Topbar({ criticalCount = 3 }: TopbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="h-16 px-6 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 flex items-center justify-between sticky top-0 z-20">
        {/* Left Side: Brand Status or Title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-zinc-400">Modo de Operação:</span>
            <span className="text-zinc-200 font-semibold uppercase tracking-wider">
              Sob Demanda (On-Demand)
            </span>
          </div>
        </div>

        {/* Center / Right Search & Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Search Trigger (Cmd + K) */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-3 px-3.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs transition shadow-sm w-64 md:w-80 justify-between group"
          >
            <div className="flex items-center gap-2">
              <Search size={14} className="text-zinc-400 group-hover:text-amber-400 transition" />
              <span>Buscar pedidos, SKUs, insumos...</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] text-zinc-400 bg-zinc-950 border border-zinc-800 rounded font-mono">
              Ctrl K
            </kbd>
          </button>

          {/* Critical Stock Alert Trigger */}
          <Link
            href="/estoque"
            className="relative p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 transition"
            title={`${criticalCount} insumos abaixo do estoque mínimo`}
          >
            <AlertTriangle size={16} className={criticalCount > 0 ? "text-amber-400" : "text-zinc-400"} />
            {criticalCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm">
                {criticalCount}
              </span>
            )}
          </Link>

          {/* Quick New Order Action */}
          <Link
            href="/pedidos?novo=1"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-zinc-950 font-semibold text-xs transition shadow-sm hover:shadow-amber-500/20"
          >
            <PlusCircle size={14} />
            <span className="hidden sm:inline">Novo Pedido Manual</span>
          </Link>
        </div>
      </header>

      {/* Global Command Search Modal */}
      <GlobalCommandSearch
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
}
