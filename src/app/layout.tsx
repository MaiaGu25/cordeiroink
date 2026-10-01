import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Toaster } from "sonner";
import { prisma } from "@/lib/prisma";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cordeiro Ink Hub | ERP & Operações Sob Demanda",
  description:
    "Sistema Operacional Integrado de Estamparia, Fila de Produção DTF e Gestão de Marketplace da Cordeiro Ink.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Coleta dados em tempo real para os badges da navegação
  const [activeOrdersCount, inProductionCount, allRawItems] = await Promise.all([
    prisma.order.count({
      where: {
        status: { in: ["NEW", "PAID", "WAITING_PRODUCTION", "IN_PRODUCTION"] },
      },
    }),
    prisma.productionJob.count({
      where: {
        stepCompleted: false,
      },
    }),
    prisma.rawItem.findMany({
      select: { stockQuantity: true, minStock: true },
    }),
  ]);

  const criticalStockCount = allRawItems.filter(
    (i) => i.stockQuantity <= i.minStock
  ).length;

  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-zinc-100 flex h-screen overflow-hidden selection:bg-amber-500/30 selection:text-amber-200`}
      >
        <Sidebar
          activeOrdersCount={activeOrdersCount}
          inProductionCount={inProductionCount}
          criticalStockCount={criticalStockCount}
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-zinc-950">
          <Topbar criticalCount={criticalStockCount} />
          <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#09090b]">
            {children}
          </main>
        </div>

        <Toaster
          theme="dark"
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              background: "#18181b",
              border: "1px solid #27272a",
              color: "#f4f4f5",
            },
          }}
        />
      </body>
    </html>
  );
}
