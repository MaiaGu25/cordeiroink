"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Flame,
  Package,
  Shirt,
  Truck,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeOrdersCount?: number;
  inProductionCount?: number;
  criticalStockCount?: number;
}

export function Sidebar({
  activeOrdersCount = 4,
  inProductionCount = 2,
  criticalStockCount = 3,
}: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

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
      badge: criticalStockCount > 0 ? `${criticalStockCount} alertas` : undefined,
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
    <aside
      className={cn(
        "hidden md:flex relative flex-col bg-zinc-950 border-r border-zinc-800/80 transition-all duration-300 ease-in-out select-none z-30 shrink-0",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-zinc-800/80">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 text-amber-400 font-black tracking-wider text-sm shadow-sm group-hover:border-amber-400/50 transition">
              CI
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-zinc-100 flex items-center gap-1.5">
                CORDEIRO INK
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-zinc-800 text-amber-400 border border-zinc-700">
                  HUB
                </span>
              </span>
              <span className="text-[11px] text-zinc-400 tracking-wide">
                OPERATIONAL ERP
              </span>
            </div>
          </Link>
        )}

        {collapsed && (
          <div className="mx-auto flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-900 border border-amber-500/30 text-amber-400 font-bold text-sm">
            CI
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex items-center justify-center w-7 h-7 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800 transition"
          title={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Quick Production Status Badge */}
      {!collapsed && (
        <div className="mx-3 mt-3 p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-zinc-400">Prensa Térmica #1:</span>
          </div>
          <span className="font-medium text-emerald-400">160°C Pronta</span>
        </div>
      )}

      {/* Navigation Links */}
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
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative",
                isActive
                  ? "bg-zinc-900 text-zinc-100 border border-zinc-800 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
              )}
              title={collapsed ? item.label : undefined}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-amber-500 rounded-r-full" />
              )}
              <Icon
                size={18}
                className={cn(
                  "shrink-0 transition-colors",
                  isActive
                    ? "text-amber-400"
                    : "text-zinc-400 group-hover:text-zinc-200"
                )}
              />
              {!collapsed && (
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
              )}
            </Link>
          );
        })}
      </nav>

      {/* Marketplace Channel Status Footer */}
      {!collapsed && (
        <div className="p-3 mx-3 mb-2 rounded-lg bg-zinc-900/40 border border-zinc-800/60 text-[11px] text-zinc-400">
          <div className="flex items-center justify-between mb-1.5 font-medium text-zinc-400 uppercase tracking-wider text-[10px]">
            <span>Canais Conectados</span>
            <Sparkles size={11} className="text-amber-400" />
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-zinc-300">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500" /> Shopee
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400" /> Shein
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" /> TikTok
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Whats Direct
            </span>
          </div>
        </div>
      )}

      {/* User Session Profile */}
      <div className="p-3 border-t border-zinc-800/80">
        <div
          className={cn(
            "flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-900/60 transition cursor-pointer",
            collapsed && "justify-center p-1"
          )}
        >
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="Mateus Cordeiro"
              className="w-8 h-8 rounded-full object-cover border border-zinc-700"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-zinc-950 rounded-full" />
          </div>

          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="text-xs font-semibold text-zinc-200 truncate">
                Mateus Cordeiro
              </span>
              <span className="text-[10px] text-amber-400 uppercase font-medium">
                Admin / Fundador
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
