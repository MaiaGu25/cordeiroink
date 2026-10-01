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
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-100">
            Pedidos Multicanal
          </h1>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
            {orders.length} pedidos
          </span>
        </div>
        <p className="text-xs text-zinc-500 mt-1">
          Monitoramento e expedição de pedidos da Shopee, Shein, TikTok Shop e WhatsApp Direto.
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
