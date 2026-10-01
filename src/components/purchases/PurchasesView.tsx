"use client";

import { useTransition } from "react";
import { Truck, CheckCircle2, Clock, Phone, Mail, PackagePlus, AlertCircle, Loader2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { receivePurchaseOrder } from "@/actions/purchases";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PurchasesViewProps {
  purchaseOrders: any[];
  suppliers: any[];
}

export function PurchasesView({ purchaseOrders, suppliers }: PurchasesViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleReceive = (poId: string, orderCode: string) => {
    startTransition(async () => {
      try {
        await receivePurchaseOrder(poId);
        toast.success(
          `Ordem de compra ${orderCode} marcada como recebida! Insumos adicionados ao estoque com sucesso.`
        );
        router.refresh();
      } catch (err: any) {
        toast.error("Erro ao receber pedido de compra: " + err.message);
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Purchase Orders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <Truck size={16} className="text-amber-400" />
              Ordens de Compra & Reposição de Insumos
            </h3>
            <p className="text-xs text-zinc-400">
              Pedidos de camisetas lisas, folhas DTF e caixas com fornecedores homologados.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {purchaseOrders.map((po) => {
            const isReceived = po.status === "RECEIVED";

            return (
              <div
                key={po.id}
                className={`p-5 rounded-2xl bg-zinc-900/80 border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${
                  isReceived
                    ? "border-zinc-800/80 bg-zinc-900/50"
                    : "border-amber-500/30 bg-zinc-900/90"
                }`}
              >
                <div>
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="font-mono text-sm font-bold text-zinc-100">
                      {po.orderCode}
                    </span>

                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${
                        isReceived
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                      }`}
                    >
                      {isReceived ? "Recebido no Estoque" : "Em Trânsito / Solicitado"}
                    </span>

                    <span className="text-xs font-semibold text-zinc-300">
                      {po.supplier?.name}
                    </span>
                  </div>

                  <div className="text-xs text-zinc-400 mb-2">
                    {po.notes || "Reposição programada de matéria-prima."}
                  </div>

                  {/* Purchased items pills */}
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    {po.items?.map((item: any) => (
                      <span
                        key={item.id}
                        className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono"
                      >
                        +{item.quantity} un de {item.rawItem?.name}
                      </span>
                    ))}
                  </div>

                  <div className="text-[10px] text-zinc-500 mt-2 font-mono">
                    Solicitado em: {formatDate(po.orderedAt || po.createdAt)}
                    {po.receivedAt && ` • Recebido em: ${formatDate(po.receivedAt)}`}
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-zinc-800">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-zinc-500 uppercase block font-medium">
                      Valor Total da Compra
                    </span>
                    <span className="text-base font-bold font-mono text-zinc-100">
                      {formatCurrency(po.totalCost)}
                    </span>
                  </div>

                  {!isReceived ? (
                    <button
                      disabled={isPending}
                      onClick={() => handleReceive(po.id, po.orderCode)}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                    >
                      {isPending ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          Atualizando Estoque...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={14} />
                          <span>Marcar como Recebido e Atualizar Estoque</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                      <CheckCircle2 size={13} />
                      <span>Estoque alimentado</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Suppliers Directory Grid */}
      <div className="space-y-4 pt-6 border-t border-zinc-800">
        <div>
          <h3 className="text-sm font-bold text-zinc-100">
            Fornecedores Homologados Cordeiro Ink
          </h3>
          <p className="text-xs text-zinc-400">
            Contatos diretos de malharias, birôs de impressão DTF e embalagens para compras rápidas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {suppliers.map((sup) => (
            <div
              key={sup.id}
              className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold text-zinc-100 block mb-1">
                  {sup.name}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-amber-400 border border-zinc-700">
                  {sup.category}
                </span>

                <div className="mt-4 space-y-1.5 text-xs text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Phone size={12} className="text-emerald-400" />
                    <span>{sup.whatsapp || "Sem whats"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={12} className="text-blue-400" />
                    <span className="truncate">{sup.email || "Sem e-mail"}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                <span>Prazo Médio:</span>
                <span className="text-zinc-300">{sup.leadTimeDays} dias</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
