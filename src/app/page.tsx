import { prisma } from "@/lib/prisma";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { CriticalStockAlerts } from "@/components/dashboard/CriticalStockAlerts";
import { TopProductsTable } from "@/components/dashboard/TopProductsTable";
import { OrderStatusOverview } from "@/components/dashboard/OrderStatusOverview";
import { TimeFilter } from "@/components/dashboard/TimeFilter";
import { DashboardHeaderAction } from "@/components/dashboard/DashboardHeaderAction";
import { Flame, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { RawItemType } from "@prisma/client";

interface DashboardPageProps {
  searchParams: Promise<{ period?: string }>;
}

export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const resolvedParams = await searchParams;
  const period = resolvedParams.period || "month";

  // Determina a data de início conforme o período
  const now = new Date();
  let startDate = new Date();

  if (period === "today") {
    startDate.setHours(0, 0, 0, 0);
  } else if (period === "7d") {
    startDate.setDate(now.getDate() - 7);
  } else if (period === "30d") {
    startDate.setDate(now.getDate() - 30);
  } else {
    // Mês atual
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  // Buscar pedidos e insumos do período
  const [orders, rawItems, orderItems] = await Promise.all([
    prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      include: {
        items: {
          include: {
            variant: {
              include: { product: true },
            },
            blankShirt: true,
            dtfPrint: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.rawItem.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: { gte: startDate },
          status: { not: "CANCELLED" },
        },
      },
      include: {
        variant: {
          include: { product: true },
        },
        blankShirt: true,
        dtfPrint: true,
      },
    }),
  ]);

  // Cálculos Operacionais Focados no Fluxo Direto (WhatsApp / Instagram / Loja)
  const validOrders = orders.filter((o) => o.status !== "CANCELLED");
  const directSales = validOrders.reduce((acc, o) => acc + o.totalProducts, 0);
  const netProfit = validOrders.reduce((acc, o) => acc + o.netProfit, 0);
  const profitMargin = directSales > 0 ? (netProfit / directSales) * 100 : 0;

  // Custo somado de camisetas lisas e DTF no período
  let shirtCostTotal = 0;
  let dtfCostTotal = 0;

  orderItems.forEach((item) => {
    if (item.blankShirt) {
      shirtCostTotal += (item.blankShirt.costPrice || 0) * item.quantity;
    }
    if (item.dtfPrint) {
      dtfCostTotal += (item.dtfPrint.costPrice || 0) * item.quantity;
    } else if (item.unitCost && item.blankShirt) {
      const dtfAvulso = Math.max(0, item.unitCost - (item.blankShirt.costPrice || 0));
      dtfCostTotal += dtfAvulso * item.quantity;
    }
  });

  // Total de camisetas a estampar hoje / ativas na prensa
  const shirtsToPrintToday = orders
    .filter((o) => ["WAITING_PRODUCTION", "IN_PRODUCTION"].includes(o.status))
    .reduce((acc, o) => acc + o.items.reduce((sum, item) => sum + item.quantity, 0), 0);

  // Status Counts
  const statusCounts: Record<string, number> = {};
  orders.forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });

  const inProductionCount = statusCounts["IN_PRODUCTION"] || 0;

  // Estoque crítico de camisetas lisas
  const blankShirts = rawItems.filter((i) => i.type === RawItemType.BLANK_SHIRT);
  const lowStockShirts = blankShirts.filter((i) => i.stockQuantity <= i.minStock);
  const criticalItems = rawItems.filter((i) => i.stockQuantity <= i.minStock);

  // Peças / Modelos mais vendidos (suporta sob encomenda e catálogo)
  const productAgg: Record<
    string,
    { name: string; sku: string; category: string; unitsSold: number; totalRevenue: number; imageUrl?: string | null }
  > = {};

  orderItems.forEach((item) => {
    const key = item.variantId || item.artTitle || item.title;
    const name = item.artTitle || item.title || item.variant?.product?.name || "Camiseta Personalizada";
    const sku = item.variant?.sku || (item.blankShirt ? item.blankShirt.sku : "ENCOMENDA");
    const category = item.shirtModel || item.variant?.product?.category || "Streetwear";
    const imageUrl = item.artMockupUrl || item.dtfPrint?.dtfPreviewUrl || item.variant?.product?.imageUrl;

    if (!productAgg[key]) {
      productAgg[key] = {
        name,
        sku,
        category,
        unitsSold: 0,
        totalRevenue: 0,
        imageUrl,
      };
    }
    productAgg[key].unitsSold += item.quantity;
    productAgg[key].totalRevenue += item.total;
  });

  const topProducts = Object.values(productAgg).sort((a, b) => b.unitsSold - a.unitsSold);

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* Header com Ação Express & Filtro de Período */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-100">
              Painel Operacional
            </h1>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Produção sob demanda direta (WhatsApp & Direct) e lucro líquido em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <TimeFilter />
          <DashboardHeaderAction blankShirts={blankShirts} />
        </div>
      </div>

      {/* 4 Métricas Principais da Operação Ágil */}
      <MetricCards
        directSales={directSales}
        netProfit={netProfit}
        shirtsToPrintToday={shirtsToPrintToday}
        lowStockShirtsCount={lowStockShirts.length}
        profitMargin={profitMargin}
        shirtCostTotal={shirtCostTotal}
        dtfCostTotal={dtfCostTotal}
      />

      {/* Alerta de Estoque Crítico de Insumos */}
      <CriticalStockAlerts items={criticalItems} />

      {/* Status da Fila e Ciclo de Vida */}
      <OrderStatusOverview statusCounts={statusCounts} />

      {/* Tabela de Artes / Peças Mais Produzidas */}
      <div className="grid grid-cols-1 gap-6">
        <TopProductsTable products={topProducts} />
      </div>

      {/* Dock Rápido da Prensa Térmica */}
      <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-800/60 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-800/60 border border-zinc-700/60 flex items-center justify-center text-amber-400/90">
            <Flame size={15} />
          </div>
          <div>
            <span className="font-medium text-zinc-200">
              Fila da Prensa Térmica
            </span>
            <p className="text-zinc-500 text-[11px]">
              {shirtsToPrintToday} {shirtsToPrintToday === 1 ? "camiseta aguardando ou em prensagem" : "camisetas aguardando ou em prensagem"} no ateliê.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href="/producao"
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-200 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
          >
            Abrir Fila de Produção <ArrowUpRight size={13} />
          </Link>
          <DashboardHeaderAction blankShirts={blankShirts} />
        </div>
      </div>
    </div>
  );
}
