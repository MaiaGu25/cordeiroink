"use client";

import {
  Search,
  AlertTriangle,
  Plus,
  Menu,
  LayoutDashboard,
  ShoppingBag,
  Flame,
  Package,
  Shirt,
  Truck,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { GlobalCommandSearch } from "./GlobalCommandSearch";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/Sheet";

interface TopbarProps {
  criticalCount?: number;
  activeOrdersCount?: number;
  inProductionCount?: number;
}

export function Topbar({
  criticalCount = 0,
  activeOrdersCount = 0,
  inProductionCount = 0,
}: TopbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    {
      label: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      label: "Pedidos",
      href: "/pedidos",
      icon: ShoppingBag,
      badge: activeOrdersCount > 0 ? activeOrdersCount : undefined,
      badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    },
    {
      label: "Produção & Prensagem",
      href: "/producao",
      icon: Flame,
      badge: inProductionCount > 0 ? inProductionCount : undefined,
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    },
    {
      label: "Estoque & Insumos",
      href: "/estoque",
      icon: Package,
      badge: criticalCount > 0 ? `${criticalCount} alertas` : undefined,
      badgeColor: "bg-red-500/20 text-red-400 border-red-500/30",
    },
    {
      label: "Produtos & Calculadora",
      href: "/produtos",
      icon: Shirt,
    },
    {
      label: "Compras & Fornecedores",
      href: "/compras",
      icon: Truck,
    },
    {
      label: "Financeiro & DRE",
      href: "/financeiro",
      icon: TrendingUp,
    },
  ];

  return (
    <>
      {/* 1. Mobile Topbar (Visible ONLY on mobile: flex md:hidden) */}
      <header className="flex md:hidden h-14 px-4 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          {/* Hamburger Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-zinc-800/80 transition active:scale-95"
            aria-label="Abrir menu de navegação"
          >
            <Menu size={18} />
          </button>

          {/* Mobile Brand Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 text-amber-400 font-black text-xs">
              CI
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-zinc-100 tracking-tight">
                CORDEIRO INK
              </span>
              <span className="text-[9px] uppercase font-bold px-1 py-0.2 rounded bg-zinc-800 text-amber-400 border border-zinc-700">
                HUB
              </span>
            </div>
          </Link>
        </div>

        {/* Mobile Right Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-zinc-800/80 transition"
            aria-label="Buscar"
          >
            <Search size={15} />
          </button>

          <Link
            href="/estoque"
            className="relative p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-zinc-800/80 transition"
            aria-label="Alertas de estoque"
          >
            <AlertTriangle
              size={15}
              className={criticalCount > 0 ? "text-amber-400" : "text-zinc-500"}
            />
            {criticalCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white font-mono">
                {criticalCount}
              </span>
            )}
          </Link>

          <Link
            href="/pedidos?novo=1"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-sm transition"
          >
            <Plus size={13} />
            <span>Pedido</span>
          </Link>
        </div>
      </header>

      {/* 2. Desktop Topbar (Visible on md and larger: hidden md:flex) */}
      <header className="hidden md:flex h-16 px-6 bg-zinc-950/70 backdrop-blur-md border-b border-zinc-800/60 items-center justify-between sticky top-0 z-20">
        {/* Left Side: Brand Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-zinc-500 font-mono">Status:</span>
            <span className="text-zinc-300 font-medium">
              Sob Demanda (On-Demand)
            </span>
          </div>
        </div>

        {/* Right Search & Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Search Trigger (Cmd + K) */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700/80 text-zinc-400 hover:text-zinc-200 text-xs transition-colors shadow-sm w-60 md:w-72 justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search
                size={14}
                className="text-zinc-500 group-hover:text-zinc-300 transition-colors"
              />
              <span className="text-zinc-500 group-hover:text-zinc-300">
                Buscar pedidos, SKUs...
              </span>
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
            <AlertTriangle
              size={15}
              className={criticalCount > 0 ? "text-amber-400/90" : "text-zinc-500"}
            />
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
            <span>Novo Pedido</span>
          </Link>
        </div>
      </header>

      {/* 3. Mobile Navigation Drawer (Sheet) */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-72 max-w-[85vw] p-0 flex flex-col bg-zinc-950 border-r border-zinc-800/80">
          {/* Brand Drawer Header */}
          <div className="flex items-center h-16 px-4 border-b border-zinc-800/80">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 text-amber-400 font-black text-sm">
                CI
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-zinc-100 flex items-center gap-1.5">
                  CORDEIRO INK
                  <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-zinc-800 text-amber-400 border border-zinc-700">
                    HUB
                  </span>
                </span>
                <span className="text-[10px] text-zinc-400">OPERATIONAL ERP</span>
              </div>
            </Link>
          </div>

          {/* Quick Status Badge */}
          <div className="mx-3 mt-3 p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-zinc-400">Prensa Térmica:</span>
            </div>
            <span className="font-medium text-emerald-400">160°C Pronta</span>
          </div>

          {/* Navigation Links with auto-close */}
          <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative",
                    isActive
                      ? "bg-zinc-900 text-zinc-100 border border-zinc-800 shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-amber-500 rounded-r-full" />
                  )}
                  <Icon
                    size={18}
                    className={cn(
                      "shrink-0 transition-colors",
                      isActive ? "text-amber-400" : "text-zinc-400"
                    )}
                  />
                  <div className="flex items-center justify-between flex-1 truncate">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full font-medium border shrink-0 ml-1.5",
                          item.badgeColor
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Marketplace Channels Footer */}
          <div className="p-3 mx-3 mb-2 rounded-lg bg-zinc-900/40 border border-zinc-800/60 text-[11px] text-zinc-400">
            <div className="flex items-center justify-between mb-1 font-medium uppercase tracking-wider text-[10px]">
              <span>Canais</span>
              <Sparkles size={11} className="text-amber-400" />
            </div>
            <div className="grid grid-cols-2 gap-1 text-[11px] text-zinc-300">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500" /> Shopee
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400" /> Shein
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" /> TikTok
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Whats
              </span>
            </div>
          </div>

          {/* User Session Profile */}
          <div className="p-3 border-t border-zinc-800/80 flex items-center gap-3">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Mateus Cordeiro"
                className="w-8 h-8 rounded-full object-cover border border-zinc-700"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-zinc-950 rounded-full" />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-semibold text-zinc-200 truncate">
                Mateus Cordeiro
              </span>
              <span className="text-[10px] text-amber-400 uppercase font-medium">
                Admin / Fundador
              </span>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Global Command Search Modal */}
      <GlobalCommandSearch
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
}
