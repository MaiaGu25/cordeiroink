"use client";

import { useState, useTransition } from "react";
import {
  Truck,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  Key,
  Building2,
  Plus,
  Loader2,
  Trash2,
  FileText,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { receivePurchaseOrder, deleteSupplier } from "@/actions/purchases";
import { NewSupplierModal } from "./NewSupplierModal";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PurchasesViewProps {
  purchaseOrders: any[];
  suppliers: any[];
}

export function PurchasesView({ purchaseOrders, suppliers }: PurchasesViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isNewSupplierOpen, setIsNewSupplierOpen] = useState(false);

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

  const handleDeleteSupplier = (supId: string, supName: string) => {
    if (confirm(`Deseja remover o fornecedor "${supName}"?`)) {
      startTransition(async () => {
        try {
          await deleteSupplier(supId);
          toast.success(`Fornecedor "${supName}" removido.`);
          router.refresh();
        } catch (err: any) {
          toast.error("Erro ao remover fornecedor: " + err.message);
        }
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Fornecedores Homologados Section (Top Priority as requested) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <Building2 size={16} className="text-amber-400" />
              Fornecedores Homologados Cordeiro Ink
            </h3>
            <p className="text-xs text-zinc-400">
              Contatos diretos de malharias, birôs de impressão DTF e embalagens para compras rápidas.
            </p>
          </div>

          <button
            onClick={() => setIsNewSupplierOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer self-start sm:self-auto"
          >
            <Plus size={14} />
            <span>+ Novo Fornecedor</span>
          </button>
        </div>

        {suppliers.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-zinc-900/40 border border-dashed border-zinc-800/80 flex flex-col items-center justify-center gap-3">
            <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400">
              <Building2 size={26} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-zinc-200">
                Nenhum item cadastrado ainda. Clique no botão acima para adicionar.
              </h4>
              <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
                Cadastre seus fornecedores reais de camisetas lisas, birôs de impressão DTF e embalagens para agilizar pedidos e pagamentos Pix.
              </p>
            </div>
            <button
              onClick={() => setIsNewSupplierOpen(true)}
              className="mt-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition shadow-sm cursor-pointer"
            >
              + Novo Fornecedor
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.map((sup) => (
              <div
                key={sup.id}
                className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between hover:border-zinc-700/80 transition-all shadow-sm group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-sm font-bold text-zinc-100 block">
                        {sup.name}
                      </span>
                      {sup.contactName && (
                        <span className="text-xs text-zinc-400">
                          Contato: {sup.contactName}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteSupplier(sup.id, sup.name)}
                      title="Remover fornecedor"
                      className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-zinc-800/80 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-800 text-amber-300 border border-zinc-700/80 mb-3">
                    {sup.category}
                  </span>

                  <div className="space-y-2 text-xs text-zinc-400 pt-2 border-t border-zinc-800/60">
                    {sup.whatsapp && (
                      <div className="flex items-center gap-2">
                        <Phone size={13} className="text-emerald-400 shrink-0" />
                        <span className="text-zinc-200">{sup.whatsapp}</span>
                      </div>
                    )}
                    {sup.email && (
                      <div className="flex items-center gap-2">
                        <Mail size={13} className="text-blue-400 shrink-0" />
                        <span className="truncate text-zinc-300">{sup.email}</span>
                      </div>
                    )}
                    {sup.pixKey && (
                      <div className="flex items-center gap-2">
                        <Key size={13} className="text-amber-400 shrink-0" />
                        <span className="font-mono text-[11px] text-zinc-200 truncate">
                          Pix: {sup.pixKey}
                        </span>
                      </div>
                    )}
                    {sup.notes && (
                      <div className="flex items-start gap-2 pt-1 text-zinc-400 text-[11px]">
                        <FileText size={12} className="text-zinc-500 mt-0.5 shrink-0" />
                        <span className="line-clamp-2">{sup.notes}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                  <span>Prazo Médio:</span>
                  <span className="text-zinc-300 font-semibold">{sup.leadTimeDays} dias</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Purchase Orders Section */}
      <div className="space-y-4 pt-6 border-t border-zinc-800">
        <div>
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <Truck size={16} className="text-amber-400" />
            Ordens de Compra & Reposição de Insumos
          </h3>
          <p className="text-xs text-zinc-400">
            Acompanhe pedidos de compras e dê entrada com 1 clique para alimentar o estoque.
          </p>
        </div>

        {purchaseOrders.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-zinc-900/30 border border-dashed border-zinc-800/60 text-xs text-zinc-500">
            Nenhuma ordem de compra aberta no momento. O estoque é alimentado diretamente pelo cadastro de insumos ou compras registradas.
          </div>
        ) : (
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
        )}
      </div>

      {/* Modal de Novo Fornecedor */}
      <NewSupplierModal
        isOpen={isNewSupplierOpen}
        onClose={() => setIsNewSupplierOpen(false)}
        onCreated={() => router.refresh()}
      />
    </div>
  );
}
