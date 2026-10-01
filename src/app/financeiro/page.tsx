import { getFinancialData } from "@/actions/finance";
import { FinanceView } from "@/components/finance/FinanceView";

export const dynamic = "force-dynamic";

export default async function FinanceiroPage() {
  const { dre, transactions } = await getFinancialData();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Financeiro & Demonstrativo DRE
          </h1>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Lucro Real Apurado
          </span>
        </div>
        <p className="text-xs text-zinc-400 mt-1">
          DRE gerencial do mês separando faturamento bruto de marketplace, comissões retidas, CMV de insumos têxteis e despesas operacionais.
        </p>
      </div>

      <FinanceView dre={dre} transactions={transactions} />
    </div>
  );
}
