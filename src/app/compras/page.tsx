import { getPurchases } from "@/actions/purchases";
import { PurchasesView } from "@/components/purchases/PurchasesView";

export const dynamic = "force-dynamic";

export default async function ComprasPage() {
  const { purchaseOrders, suppliers } = await getPurchases();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Compras & Gestão de Fornecedores
          </h1>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
            {purchaseOrders.length} ordens de compra registradas
          </span>
        </div>
        <p className="text-xs text-zinc-400 mt-1">
          Acompanhamento de compras de reposição de malhas, folhas DTF e caixas com baixa automática para o estoque ao receber o lote.
        </p>
      </div>

      <PurchasesView
        purchaseOrders={purchaseOrders}
        suppliers={suppliers}
      />
    </div>
  );
}
