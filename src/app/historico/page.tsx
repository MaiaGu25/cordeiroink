import { getHistoricalOrders } from "@/actions/orders";
import { ProductionHistoryView } from "@/components/production/ProductionHistoryView";

export const dynamic = "force-dynamic";

export default async function HistoricoPage() {
  const orders = await getHistoricalOrders();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-100">
            Histórico Operacional & Arquivo
          </h1>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
            {orders.length} pedidos arquivados
          </span>
        </div>
        <p className="text-xs text-zinc-400 mt-1">
          Registro completo de pedidos finalizados (prontos, despachados, entregues), cancelamentos com devolução de estoque e perdas registradas na prensa.
        </p>
      </div>

      <ProductionHistoryView orders={orders} />
    </div>
  );
}
