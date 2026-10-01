import { prisma } from "@/lib/prisma";
import { OrdersView } from "@/components/orders/OrdersView";

interface PedidosPageProps {
  searchParams: Promise<{ novo?: string }>;
}

export const dynamic = "force-dynamic";

export default async function PedidosPage({ searchParams }: PedidosPageProps) {
  const resolvedParams = await searchParams;
  const initialNewOrderModalOpen = resolvedParams.novo === "1";

  const [orders, variants] = await Promise.all([
    prisma.order.findMany({
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
        productionJob: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.productVariant.findMany({
      include: {
        product: true,
      },
      where: { isActive: true },
    }),
  ]);

  const formattedVariants = variants.map((v) => ({
    id: v.id,
    sku: v.sku,
    title: v.title,
    basePrice: v.basePrice,
    productName: v.product.name,
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Gestão de Pedidos Multicanal
          </h1>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
            {orders.length} pedidos registrados
          </span>
        </div>
        <p className="text-xs text-zinc-400 mt-1">
          Acompanhamento dinâmico de vendas da Shopee, Shein, TikTok Shop e Vendas Diretas com margens e status.
        </p>
      </div>

      <OrdersView
        initialOrders={orders}
        variants={formattedVariants}
        initialNewOrderModalOpen={initialNewOrderModalOpen}
      />
    </div>
  );
}
