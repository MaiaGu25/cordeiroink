"use client";

import { Printer, X, Download, Building2, Calendar, FileText, CheckCircle2, Clock } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface PurchaseOrderItem {
  id: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  rawItem?: {
    id: string;
    sku: string;
    name: string;
    type: string;
    shirtModel?: string | null;
    shirtColor?: string | null;
    shirtSize?: string | null;
    dtfCode?: string | null;
    dtfPrintSize?: string | null;
  };
}

interface PurchaseOrder {
  id: string;
  orderCode: string;
  status: string;
  totalCost: number;
  notes?: string | null;
  orderedAt?: string | Date | null;
  receivedAt?: string | Date | null;
  createdAt: string | Date;
  supplier?: {
    id: string;
    name: string;
    category?: string;
    contactName?: string | null;
    whatsapp?: string | null;
    email?: string | null;
    pixKey?: string | null;
    leadTimeDays?: number;
  };
  items?: PurchaseOrderItem[];
}

interface PurchaseOrderPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: PurchaseOrder | null;
}

export function PurchaseOrderPrintModal({ isOpen, onClose, order }: PurchaseOrderPrintModalProps) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const isReceived = order.status === "RECEIVED";
  const emissionDate = order.orderedAt || order.createdAt;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar (Hidden on print) */}
        <div className="print:hidden flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Printer size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <span>Impressão da Ordem de Compra</span>
                <span className="font-mono text-amber-400">{order.orderCode}</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Visualize ou exporte como arquivo PDF para conferência de estoque.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-sm"
              title="Imprimir ou Salvar como PDF"
            >
              <Printer size={14} />
              <span>Imprimir / Salvar PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              title="Fechar"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-white text-zinc-900 print:p-0 print:m-0 print:overflow-visible">
          {/* Printable Layout Wrapper */}
          <div className="space-y-6 max-w-2xl mx-auto">
            {/* Header Documento */}
            <div className="flex items-start justify-between border-b-2 border-zinc-900 pb-4">
              <div>
                <span className="font-serif text-2xl font-black uppercase tracking-tight text-zinc-950 block">
                  Cordeiro Ink
                </span>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-600 block mt-0.5">
                  Ateliê de Streetwear Cristão • Dele. Por Ele. Para Ele.
                </span>
                <span className="text-xs font-semibold text-zinc-800 mt-1 block">
                  ORDEM DE COMPRA & REPOSIÇÃO DE INSUMOS
                </span>
              </div>

              <div className="text-right">
                <span className="font-mono text-lg font-black text-zinc-950 block">
                  {order.orderCode}
                </span>
                <span className="text-xs text-zinc-600 block">
                  Emissão: {formatDate(emissionDate)}
                </span>
                <span
                  className={`inline-block text-[10px] uppercase px-2 py-0.5 rounded font-bold mt-1 border ${
                    isReceived
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                      : "bg-amber-50 text-amber-800 border-amber-300"
                  }`}
                >
                  {isReceived ? "Recebido no Estoque" : "Ordem Aberta / Solicitada"}
                </span>
              </div>
            </div>

            {/* Informações do Fornecedor */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                  Fornecedor Homologado
                </span>
                <span className="font-bold text-zinc-900 text-sm">
                  {order.supplier?.name || "Fornecedor Direto"}
                </span>
                {order.supplier?.category && (
                  <span className="text-[11px] text-zinc-600 block">
                    Categoria: {order.supplier.category}
                  </span>
                )}
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                  Contato / WhatsApp
                </span>
                <span className="font-mono text-zinc-800">
                  {order.supplier?.whatsapp || order.supplier?.contactName || "—"}
                </span>
                {order.supplier?.email && (
                  <span className="text-[11px] text-zinc-600 block truncate">
                    {order.supplier.email}
                  </span>
                )}
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                  Chave Pix para Pagamento
                </span>
                <span className="font-mono font-semibold text-zinc-900 block truncate">
                  {order.supplier?.pixKey || "A combinar no faturamento"}
                </span>
                {order.supplier?.leadTimeDays && (
                  <span className="text-[10px] text-zinc-500 block">
                    Prazo Médio: {order.supplier.leadTimeDays} dias
                  </span>
                )}
              </div>
            </div>

            {/* Tabela com Insumos Solicitados */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800 mb-2">
                Itens & Insumos a Repor
              </h4>

              <table className="w-full text-left text-xs border border-zinc-200 rounded-lg overflow-hidden">
                <thead className="bg-zinc-100 border-b border-zinc-200 text-zinc-700 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Item / Insumo</th>
                    <th className="py-2.5 px-3">Especificação (Cor / Tam)</th>
                    <th className="py-2.5 px-2 text-center">Qtd</th>
                    <th className="py-2.5 px-3 text-right">Custo Unit.</th>
                    <th className="py-2.5 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item) => {
                      const raw = item.rawItem;
                      const spec =
                        raw?.shirtColor || raw?.shirtSize
                          ? `${raw?.shirtColor || ""} ${raw?.shirtSize ? `(Tam ${raw.shirtSize})` : ""}`
                          : raw?.dtfPrintSize || raw?.type || "Padrão";

                      return (
                        <tr key={item.id} className="hover:bg-zinc-50/50">
                          <td className="py-2.5 px-3 font-semibold text-zinc-900">
                            {raw?.name || "Insumo Matéria-Prima"}
                            {raw?.shirtModel && raw.shirtModel !== raw.name && (
                              <span className="block text-[10px] font-normal text-zinc-500">
                                {raw.shirtModel}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-zinc-700">
                            {spec}
                          </td>
                          <td className="py-2.5 px-2 text-center font-mono font-bold text-zinc-900">
                            {item.quantity} un
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-zinc-700">
                            {formatCurrency(item.unitCost)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-zinc-950">
                            {formatCurrency(item.totalCost || item.quantity * item.unitCost)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-zinc-500">
                        Nenhum insumo discriminado nesta ordem.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-zinc-100 font-bold border-t-2 border-zinc-900 text-zinc-950">
                  <tr>
                    <td colSpan={2} className="py-3 px-3 uppercase text-xs">
                      Valor Total da Ordem
                    </td>
                    <td className="py-3 px-2 text-center font-mono">
                      {order.items?.reduce((acc, i) => acc + (i.quantity || 0), 0) || 0} un
                    </td>
                    <td colSpan={2} className="py-3 px-3 text-right text-base font-mono">
                      {formatCurrency(order.totalCost)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Observações */}
            {order.notes && (
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs">
                <span className="font-bold uppercase text-[10px] text-zinc-500 block mb-0.5">
                  Observações de Compra
                </span>
                <p className="text-zinc-700">{order.notes}</p>
              </div>
            )}

            {/* Espaço para Conferência e Assinatura de Recebimento */}
            <div className="pt-6 border-t border-zinc-300 space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-800 block">
                Termo de Conferência & Recebimento no Ateliê
              </span>

              <div className="grid grid-cols-2 gap-6 text-xs text-zinc-700">
                <div className="space-y-3">
                  <div>
                    <span className="text-zinc-500 text-[10px] uppercase block">Conferido por:</span>
                    <div className="border-b border-zinc-400 h-6"></div>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-[10px] uppercase block">Data de Chegada:</span>
                    <div className="border-b border-zinc-400 h-6">
                      {order.receivedAt ? formatDate(order.receivedAt) : "____ / ____ / ________"}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-zinc-500 text-[10px] uppercase block">Condição dos Insumos:</span>
                    <div className="flex gap-4 pt-1 text-[11px]">
                      <span>[  ] Sem Avarias</span>
                      <span>[  ] Com Ressalvas</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-[10px] uppercase block">Assinatura do Recebedor:</span>
                    <div className="border-b border-zinc-400 h-6"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rodapé Oficial */}
            <div className="pt-4 border-t border-zinc-200 flex justify-between items-center text-[10px] text-zinc-500 font-mono">
              <span>Cordeiro Ink • Gestão Integrada de Ateliê</span>
              <span>Documento gerado em {new Date().toLocaleDateString("pt-BR")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
