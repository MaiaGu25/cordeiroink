"use client";

import { useState } from "react";
import { FinancialDRE } from "./FinancialDRE";
import { NewTransactionModal } from "./NewTransactionModal";
import { PlusCircle, ArrowDownRight, ArrowUpRight, DollarSign, Calendar } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface FinanceViewProps {
  dre: any;
  transactions: any[];
}

export function FinanceView({ dre, transactions }: FinanceViewProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-zinc-300">
            Painel de Lucratividade & Extrato de Operações
          </h2>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
        >
          <PlusCircle size={14} />
          <span>Novo Lançamento</span>
        </button>
      </div>

      {/* DRE Waterfall */}
      <FinancialDRE dre={dre} />

      {/* Transactions Table */}
      <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
          Extrato das Últimas Transações Realizadas
        </h3>

        <div className="overflow-x-auto rounded-xl">
          <table className="w-full text-left text-xs whitespace-nowrap min-w-[520px]">
            <thead>
              <tr className="border-b border-zinc-800 text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">
                <th className="px-2.5 py-2.5 sm:px-3 sm:py-3 font-medium">Data / Hora</th>
                <th className="px-2.5 py-2.5 sm:px-3 sm:py-3 font-medium">Descrição / Origem</th>
                <th className="px-2.5 py-2.5 sm:px-3 sm:py-3 font-medium">Categoria</th>
                <th className="px-2.5 py-2.5 sm:px-3 sm:py-3 font-medium text-right">Valor (BRL)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {transactions.map((tx) => {
                const isIncome = tx.type === "INCOME";

                return (
                  <tr key={tx.id} className="hover:bg-zinc-800/30 transition">
                    <td className="px-2.5 py-2.5 sm:px-3 sm:py-3 text-zinc-400 font-mono text-[11px] whitespace-nowrap">
                      {formatDate(tx.date)}
                    </td>
                    <td className="px-2.5 py-2.5 sm:px-3 sm:py-3 text-zinc-200 font-medium whitespace-nowrap">
                      {tx.description}
                    </td>
                    <td className="px-2.5 py-2.5 sm:px-3 sm:py-3 whitespace-nowrap">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800">
                        {tx.category}
                      </span>
                    </td>
                    <td
                      className={`px-2.5 py-2.5 sm:px-3 sm:py-3 text-right font-mono font-bold whitespace-nowrap ${
                        isIncome ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {isIncome ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <NewTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={() => router.refresh()}
      />
    </div>
  );
}
