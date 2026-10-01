import { prisma } from "@/lib/prisma";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { CriticalStockAlerts } from "@/components/dashboard/CriticalStockAlerts";
import { SalesChannelChart } from "@/components/dashboard/SalesChannelChart";
import { TopProductsTable } from "@/components/dashboard/TopProductsTable";
import { OrderStatusOverview } from "@/components/dashboard/OrderStatusOverview";
import { TimeFilter } from "@/components/dashboard/TimeFilter";
import { Sparkles, ArrowUpRight, Flame } from "lucide-react";
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
      },
    }),
  ]);

  // Cálculos do Dashboard
  const validOrders = orders.filter((o) => o.status !== "CANCELLED");
  const grossSales = validOrders.reduce((acc, o) => acc + o.totalProducts, 0);
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

  // Produtos mais vendidos
  const productAgg: Record<
    string,
    { name: string; sku: string; category: string; unitsSold: number; totalRevenue: number; imageUrl?: string | null }
  > = {};

  orderItems.forEach((item) => {
    const p = item.variant.product;
    if (!productAgg[p.id]) {
      productAgg[p.id] = {
        name: p.name,
        sku: p.skuBase,
        category: p.category,
        unitsSold: 0,
        totalRevenue: 0,
        imageUrl: p.imageUrl,
      };
    }
    productAgg[p.id].unitsSold += item.quantity;
    productAgg[p.id].totalRevenue += item.total;
  });

  const topProducts = Object.values(productAgg).sort((a, b) => b.unitsSold - a.unitsSold);

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Welcome & Period Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
              Painel Operacional & Indicadores
            </h1>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Live Data
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Visão consolidada de vendas, prensa térmica, margens e estoque sob demanda.
          </p>
        </div>

        <TimeFilter />
      </div>

      {/* Main Metric Cards */}
      <MetricCards
        grossSales={grossSales}
        netProfit={netProfit}
        avgTicket={avgTicket}
        activeOrdersCount={activeOrdersCount}
        profitMargin={profitMargin}
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

      {/* Quick Action Dock */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Flame size={16} />
          </div>
          <div>
            <span className="font-semibold text-zinc-200">
              Fila de Produção e Prensagem DTF
            </span>
            <p className="text-zinc-400 text-[11px]">
              {statusCounts["IN_PRODUCTION"] || 0} camisetas atualmente sendo impressas e montadas no ateliê.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link
            href="/producao"
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium transition text-center flex items-center justify-center gap-1.5"
          >
            Abrir Fila de Produção <ArrowUpRight size={13} />
          </Link>
          <Link
            href="/pedidos?novo=1"
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold transition text-center"
          >
            + Novo Pedido
          </Link>
        </div>
      </div>
    </div>
  );
}
