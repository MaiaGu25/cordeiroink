import { prisma } from "@/lib/prisma";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { CriticalStockAlerts } from "@/components/dashboard/CriticalStockAlerts";
import { SalesChannelChart } from "@/components/dashboard/SalesChannelChart";
import { TopProductsTable } from "@/components/dashboard/TopProductsTable";
import { OrderStatusOverview } from "@/components/dashboard/OrderStatusOverview";
import { TimeFilter } from "@/components/dashboard/TimeFilter";
import { Flame, ArrowUpRight } from "lucide-react";
import Link from "next/link";

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

  // Buscar pedidos do período
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
          },
        },
      },
    }),
    prisma.rawItem.findMany(),
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

  // Cálculos do Dashboard
  const validOrders = orders.filter((o) => o.status !== "CANCELLED");
  const grossSales = validOrders.reduce((acc, o) => acc + o.totalProducts, 0);
  const platformFees = validOrders.reduce((acc, o) => acc + o.platformFee, 0);
  const estimatedCMV = validOrders.reduce((acc, o) => acc + o.estimatedCMV, 0);
  const netProfit = validOrders.reduce((acc, o) => acc + o.netProfit, 0);
  const avgTicket = validOrders.length > 0 ? grossSales / validOrders.length : 0;
  const profitMargin = grossSales > 0 ? (netProfit / grossSales) * 100 : 0;

  // Status Counts
  const statusCounts: Record<string, number> = {};
  orders.forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });

  const activeOrdersCount = orders.filter((o) =>
    ["NEW", "PAID", "WAITING_PRODUCTION", "IN_PRODUCTION"].includes(o.status)
  ).length;

  const inProductionCount = statusCounts["IN_PRODUCTION"] || 0;
  const waitingCount = (statusCounts["WAITING_PRODUCTION"] || 0) + (statusCounts["PAID"] || 0);

  // Canais
  const channels = ["SHOPEE", "SHEIN", "TIKTOK", "MANUAL"];
  const channelData = channels.map((ch) => {
    const chOrders = validOrders.filter((o) => o.channel === ch);
    return {
      channel: ch,
      totalSales: chOrders.reduce((acc, o) => acc + o.netAmount, 0),
      orderCount: chOrders.length,
    };
  });

  // Estoque crítico
  const criticalItems = rawItems.filter((i) => i.stockQuantity <= i.minStock);

  // Peças / Modelos mais vendidos (suporta sob encomenda e catálogo)
  const productAgg: Record<
    string,
    { name: string; sku: string; category: string; unitsSold: number; totalRevenue: number; imageUrl?: string | null }
  > = {};

  orderItems.forEach((item) => {
    const key = item.variantId || item.title;
    const name = item.title || item.variant?.product?.name || "Camiseta Personalizada";
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
      {/* Welcome & Period Header with clean whitespace */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-100">
              Painel Operacional
            </h1>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Métricas de produção sob demanda e lucratividade real multicanal.
          </p>
        </div>

        <TimeFilter />
      </div>

      {/* Main Metric Cards with Progressive Disclosure HoverCards */}
      <MetricCards
        grossSales={grossSales}
        netProfit={netProfit}
        avgTicket={avgTicket}
        activeOrdersCount={activeOrdersCount}
        profitMargin={profitMargin}
        platformFees={platformFees}
        estimatedCMV={estimatedCMV}
        inProductionCount={inProductionCount}
        waitingCount={waitingCount}
      />

      {/* Critical Stock Warning Banner */}
      <CriticalStockAlerts items={criticalItems} />

      {/* Order Status Lifecycle Funnel */}
      <OrderStatusOverview statusCounts={statusCounts} />

      {/* Visual Analytics Grid: Sales Channels & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChannelChart data={channelData} />
        <TopProductsTable products={topProducts} />
      </div>

      {/* Quiet Production Quick Dock */}
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
              {inProductionCount} camisetas em processo de montagem e prensagem no ateliê.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href="/producao"
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-200 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
          >
            Fila de Produção <ArrowUpRight size={13} />
          </Link>
          <Link
            href="/pedidos?novo=1"
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs transition-colors text-center"
          >
            + Novo Pedido
          </Link>
        </div>
      </div>
    </div>
  );
}
