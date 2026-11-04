"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

interface AppShellProps {
  children: React.ReactNode;
  activeOrdersCount: number;
  inProductionCount: number;
  criticalStockCount: number;
}

// Rotas internas exclusivas do ERP / Painel de Gestão da Equipe
const ERP_ROUTES = [
  "/admin",
  "/pedidos",
  "/producao",
  "/estoque",
  "/compras",
  "/financeiro",
  "/historico",
  "/produtos",
];

export function AppShell({
  children,
  activeOrdersCount,
  inProductionCount,
  criticalStockCount,
}: AppShellProps) {
  const pathname = usePathname();

  // Verifica se a rota atual é parte do ERP interno da equipe
  const isErpRoute = Boolean(
    pathname &&
      ERP_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
      )
  );

  // Páginas públicas da loja (Home "/", "/quem-somos", "/eventos-b2b") ou tela de login
  // NÃO renderizam a barra lateral nem o topo do ERP
  if (!isErpRoute || pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-black text-zinc-100 w-full selection:bg-amber-500/30 selection:text-amber-200">
      <Sidebar
        activeOrdersCount={activeOrdersCount}
        inProductionCount={inProductionCount}
        criticalStockCount={criticalStockCount}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-black">
        <Topbar
          criticalCount={criticalStockCount}
          activeOrdersCount={activeOrdersCount}
          inProductionCount={inProductionCount}
        />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-8 bg-black">
          {children}
        </main>
      </div>
    </div>
  );
}
