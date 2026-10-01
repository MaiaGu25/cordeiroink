import { getInventoryItems } from "@/actions/inventory";
import { InventoryView } from "@/components/inventory/InventoryView";

export const dynamic = "force-dynamic";

export default async function EstoquePage() {
  const { blankShirts, dtfPrints, supplies, criticalItems } =
    await getInventoryItems();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Estoque & Matéria-Prima de Confecção
          </h1>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
            {blankShirts.length + dtfPrints.length + supplies.length} insumos catalogados
          </span>
        </div>
        <p className="text-xs text-zinc-400 mt-1">
          Controle de saldo em tempo real de camisetas lisas por cor/tamanho, acervo de estampas DTF têxteis e insumos de embalagem.
        </p>
      </div>

      <InventoryView
        blankShirts={blankShirts}
        dtfPrints={dtfPrints}
        supplies={supplies}
        criticalItems={criticalItems}
      />
    </div>
  );
}
