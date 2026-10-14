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

export function AppShell({
  children,
  activeOrdersCount,
  inProductionCount,
  criticalStockCount,
}: AppShellProps) {
  const pathname = usePathname();
  const isPublicStorefront = pathname === "/";
  const isLoginPage = pathname === "/login";

  // Vitrine pública ou tela de login não renderizam a barra do ERP
  if (isPublicStorefront || isLoginPage) {
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
