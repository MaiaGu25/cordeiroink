"use client";

import { Search, AlertTriangle, Plus } from "lucide-react";
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
      <header className="h-16 px-6 bg-zinc-950/70 backdrop-blur-md border-b border-zinc-800/60 flex items-center justify-between sticky top-0 z-20">
        {/* Left Side: Brand Status or Title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-zinc-500 font-mono">Status:</span>
            <span className="text-zinc-300 font-medium">
              Sob Demanda (On-Demand)
            </span>
          </div>
        </div>

        {/* Center / Right Search & Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Search Trigger (Cmd + K) */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700/80 text-zinc-400 hover:text-zinc-200 text-xs transition-colors shadow-sm w-60 md:w-72 justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search size={14} className="text-zinc-500 group-hover:text-zinc-300 transition-colors" />
              <span className="text-zinc-500 group-hover:text-zinc-300">Buscar pedidos, SKUs...</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] text-zinc-500 bg-zinc-950 border border-zinc-800 rounded font-mono">
              Ctrl K
            </kbd>
          </button>

          {/* Critical Stock Alert Trigger */}
          <Link
            href="/estoque"
            className="relative p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-zinc-400 hover:text-zinc-200 transition-colors"
            title={`${criticalCount} insumos com reposição necessária`}
          >
            <AlertTriangle size={15} className={criticalCount > 0 ? "text-amber-400/90" : "text-zinc-500"} />
            {criticalCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm font-mono">
                {criticalCount}
              </span>
            )}
          </Link>

          {/* Quick New Order Action */}
          <Link
            href="/pedidos?novo=1"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition-colors shadow-sm"
          >
            <Plus size={13} />
            <span className="hidden sm:inline">Novo Pedido</span>
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
