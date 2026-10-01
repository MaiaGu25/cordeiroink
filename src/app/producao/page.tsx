import { getProductionJobs } from "@/actions/production";
import { ProductionQueueView } from "@/components/production/ProductionQueueView";

export const dynamic = "force-dynamic";

export default async function ProducaoPage() {
  const jobs = await getProductionJobs();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Fila de Produção & Prensagem Térmica DTF
          </h1>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {jobs.filter((j) => !j.stepCompleted).length} na prensa / ateliê
          </span>
        </div>
        <p className="text-xs text-zinc-400 mt-1">
          Acompanhamento operacional por peça: separação de camiseta, corte da estampa DTF, prensagem a 160°C, QC e baixa automática de estoque.
        </p>
      </div>

      <ProductionQueueView initialJobs={jobs} />
    </div>
  );
}
