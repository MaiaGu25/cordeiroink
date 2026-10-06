import { getInventoryItems } from "@/actions/inventory";
import { InventoryView } from "@/components/inventory/InventoryView";

export const dynamic = "force-dynamic";

export default async function EstoquePage() {
  const { blankShirts, dtfPrints, supplies, criticalItems, suppliers } =
    await getInventoryItems();

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-100">
            Estoque & Matéria-Prima
          </h1>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
            {blankShirts.length + dtfPrints.length + supplies.length} insumos
          </span>
        </div>
        <p className="text-xs text-zinc-500 mt-1">
          Saldos em tempo real de camisetas lisas por cor e tamanho, banco de estampas DTF e insumos de embalagem.
        </p>
      </div>

      <InventoryView
        blankShirts={blankShirts}
        dtfPrints={dtfPrints}
        supplies={supplies}
        criticalItems={criticalItems}
        suppliers={suppliers}
      />
    </div>
  );
}
