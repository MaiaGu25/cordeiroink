"use client";

import { useState, useTransition } from "react";
import { X, Plus, Shirt, Image as ImageIcon, Package, Loader2, Sparkles, Link as LinkIcon, DollarSign } from "lucide-react";
import { createManualOrder } from "@/actions/orders";
import { formatCurrency } from "@/lib/utils";
import { SalesChannel } from "@prisma/client";
import { toast } from "sonner";

interface RawOption {
  id: string;
  name: string;
  costPrice: number;
  stockQuantity: number;
  shirtModel?: string | null;
  shirtColor?: string | null;
  shirtSize?: string | null;
  dtfCode?: string | null;
  dtfPrintSize?: string | null;
}

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  blankShirts: RawOption[];
  dtfPrints: RawOption[];
  packagings: RawOption[];
  onOrderCreated?: () => void;
}

export function NewOrderModal({
  isOpen,
  onClose,
  blankShirts,
  dtfPrints,
  packagings,
  onOrderCreated,
}: NewOrderModalProps) {
  const [isPending, startTransition] = useTransition();

  // Canal e Cliente
  const [channel, setChannel] = useState<SalesChannel>(SalesChannel.MANUAL);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");

  // Peça e Encomenda
  const [itemTitle, setItemTitle] = useState("");
  const [selectedShirtId, setSelectedShirtId] = useState<string>(blankShirts[0]?.id || "");
  const [selectedDtfId, setSelectedDtfId] = useState<string>(dtfPrints[0]?.id || "none");
  const [selectedPackId, setSelectedPackId] = useState<string>(packagings[0]?.id || "none");

  // Arte
  const [artTitle, setArtTitle] = useState("");
  const [artUrl, setArtUrl] = useState("");
  const [printSize, setPrintSize] = useState("A3 (30x42cm)");
  const [saveToDtfCatalog, setSaveToDtfCatalog] = useState(false);

  // Valores e Quantidade
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState<number>(99.90);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  // Cálculos dinâmicos de custos na hora
  const chosenShirt = blankShirts.find((s) => s.id === selectedShirtId);
  const chosenDtf = dtfPrints.find((d) => d.id === selectedDtfId);
  const chosenPack = packagings.find((p) => p.id === selectedPackId);

  const shirtCost = chosenShirt ? chosenShirt.costPrice : 0;
  const dtfCost = chosenDtf ? chosenDtf.costPrice : 0;
  const packCost = chosenPack ? chosenPack.costPrice : 0;
  const unitCost = shirtCost + dtfCost + packCost;

  const totalProducts = unitPrice * quantity;
  
  // Taxa do canal
  let feeRate = 0;
  let fixedFee = 0;
  if (channel === SalesChannel.SHOPEE) {
    feeRate = 0.20;
    fixedFee = 4.0;
  } else if (channel === SalesChannel.SHEIN) {
    feeRate = 0.18;
  } else if (channel === SalesChannel.TIKTOK) {
    feeRate = 0.15;
  }

  const estimatedFee = totalProducts * feeRate + fixedFee;
  const netAmount = totalProducts - estimatedFee;
  const estimatedCMV = unitCost * quantity;
  const estimatedNetProfit = netAmount - estimatedCMV;
  const profitMargin = totalProducts > 0 ? (estimatedNetProfit / totalProducts) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      toast.error("Por favor, informe o nome do cliente.");
      return;
    }

    const finalTitle = itemTitle.trim() || (chosenShirt ? `${chosenShirt.name} (Sob Encomenda)` : "Camiseta Personalizada");

    startTransition(async () => {
      try {
        await createManualOrder({
          customerName,
          customerPhone,
          customerEmail,
          shippingAddress,
          channel,
          itemTitle: finalTitle,
          blankShirtId: selectedShirtId || undefined,
          dtfPrintId: selectedDtfId !== "none" ? selectedDtfId : undefined,
          packagingId: selectedPackId !== "none" ? selectedPackId : undefined,
          artTitle: artTitle || undefined,
          artUrl: artUrl || undefined,
          printSize,
          saveToDtfCatalog,
          quantity: Number(quantity),
          unitPrice: Number(unitPrice),
          shippingCost: Number(shippingCost),
          notes,
        });

        toast.success("Pedido sob encomenda criado com sucesso! Fila de prensagem liberada.");
        if (onOrderCreated) onOrderCreated();
        onClose();
      } catch (err: any) {
        toast.error("Erro ao criar pedido: " + err.message);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Plus size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">
                Novo Pedido Sob Encomenda (Arte Personalizada)
              </h3>
              <p className="text-xs text-zinc-500">
                Defina a camiseta lisa e os insumos gastos sem amarras a um catálogo prévio.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* 1. Canal & Cliente */}
          <div className="space-y-3">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">
              1. Canal de Venda & Destinatário
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-400 mb-1">Canal de Origem</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as SalesChannel)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-zinc-700"
                >
                  <option value={SalesChannel.MANUAL}>Venda Direta / Whats Pix (0% taxa)</option>
                  <option value={SalesChannel.SHOPEE}>Shopee (~20% + R$4)</option>
                  <option value={SalesChannel.SHEIN}>Shein (~18%)</option>
                  <option value={SalesChannel.TIKTOK}>TikTok Shop (~15%)</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Nome do Cliente *</label>
                <input
                  required
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="ex: Lucas Martins"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-400 mb-1">WhatsApp / Telefone</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Endereço de Entrega</label>
                <input
                  type="text"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Rua, número, cidade - UF"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
                />
              </div>
            </div>
          </div>

          {/* 2. Peça Sob Demanda & Insumos Gastos */}
          <div className="space-y-3 pt-3 border-t border-zinc-850">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">
              2. Definição da Peça & Insumos Consumidos
            </span>

            <div>
              <label className="block text-zinc-400 mb-1">
                Título / Descrição da Encomenda *
              </label>
              <input
                type="text"
                value={itemTitle}
                onChange={(e) => setItemTitle(e.target.value)}
                placeholder="ex: Camiseta Oversized Preta G - Arte Dragão Oriental Costas"
                className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
              />
            </div>

            {/* Insumos Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-400 mb-1 flex items-center justify-between">
                  <span>Camiseta Lisa (Insumo)</span>
                  {chosenShirt && (
                    <span className="text-[10px] text-zinc-500 font-mono">
                      Custo: {formatCurrency(chosenShirt.costPrice)}
                    </span>
                  )}
                </label>
                <select
                  value={selectedShirtId}
                  onChange={(e) => setSelectedShirtId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-zinc-700"
                >
                  {blankShirts.map((shirt) => (
                    <option key={shirt.id} value={shirt.id}>
                      {shirt.name} ({shirt.stockQuantity} un)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 flex items-center justify-between">
                  <span>Folha / Estampa DTF</span>
                  {chosenDtf && (
                    <span className="text-[10px] text-zinc-500 font-mono">
                      Custo: {formatCurrency(chosenDtf.costPrice)}
                    </span>
                  )}
                </label>
                <select
                  value={selectedDtfId}
                  onChange={(e) => setSelectedDtfId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-zinc-700"
                >
                  <option value="none">Sem DTF (Camiseta Lisa)</option>
                  {dtfPrints.map((dtf) => (
                    <option key={dtf.id} value={dtf.id}>
                      {dtf.name} ({dtf.dtfPrintSize || "A3"}) — {formatCurrency(dtf.costPrice)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Arte e Mockup */}
            <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-850 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Nome / Identificação da Arte</label>
                  <input
                    type="text"
                    value={artTitle}
                    onChange={(e) => setArtTitle(e.target.value)}
                    placeholder="ex: Dragão Oriental Neon Costas"
                    className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Tamanho da Impressão</label>
                  <select
                    value={printSize}
                    onChange={(e) => setPrintSize(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-zinc-700"
                  >
                    <option value="A3 (30x42cm)">A3 (30x42cm) — Estampa Grande</option>
                    <option value="A4 (21x30cm)">A4 (21x30cm) — Estampa Média</option>
                    <option value="Bolso (10x10cm)">Bolso (10x10cm) — Logo Peito</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 flex items-center gap-1.5">
                  <LinkIcon size={12} className="text-zinc-500" />
                  <span>Link do Arquivo da Arte ou Mockup (Drive, WeTransfer, Imgur)</span>
                </label>
                <input
                  type="url"
                  value={artUrl}
                  onChange={(e) => setArtUrl(e.target.value)}
                  placeholder="https://drive.google.com/... ou https://..."
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 font-mono text-[11px]"
                />
              </div>

              {artTitle && (
                <label className="flex items-center gap-2 cursor-pointer pt-1 text-zinc-400 hover:text-zinc-200 transition-colors">
                  <input
                    type="checkbox"
                    checked={saveToDtfCatalog}
                    onChange={(e) => setSaveToDtfCatalog(e.target.checked)}
                    className="rounded bg-zinc-950 border-zinc-800 text-amber-500 accent-amber-500"
                  />
                  <span>Salvar esta arte no repositório do Banco de Estampas para reuso</span>
                </label>
              )}
            </div>
          </div>

          {/* 3. Valores & Live Breakdown */}
          <div className="space-y-3 pt-3 border-t border-zinc-850">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">
              3. Precificação & Cálculo Instantâneo de Lucro
            </span>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-zinc-400 mb-1">Quantidade</label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 font-mono text-center focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Preço Unitário (R$)</label>
                <input
                  type="number"
                  step="0.10"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 font-mono text-center focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Frete (R$)</label>
                <input
                  type="number"
                  step="0.10"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 font-mono text-center focus:outline-none focus:border-zinc-700"
                />
              </div>
            </div>

            {/* Live Financial Card */}
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between text-xs font-mono">
              <div className="space-y-0.5">
                <span className="text-zinc-500 block">Custo Insumos (CMV):</span>
                <span className="text-zinc-300 font-semibold">{formatCurrency(estimatedCMV)}</span>
              </div>

              <div className="space-y-0.5 text-center">
                <span className="text-zinc-500 block">Valor Bruto:</span>
                <span className="text-zinc-200 font-semibold">{formatCurrency(totalProducts)}</span>
              </div>

              <div className="space-y-0.5 text-right">
                <span className="text-emerald-500 block">Lucro Líquido Real:</span>
                <span className="text-emerald-400 font-bold text-sm">
                  {formatCurrency(estimatedNetProfit)} ({profitMargin.toFixed(0)}%)
                </span>
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Observações Internas para a Prensa</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ex: Prensagem 160°C 15s nas costas, centralizada 8cm abaixo da gola."
                className="w-full px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
              />
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold transition shadow-sm flex items-center gap-2 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Criando Pedido...
                </>
              ) : (
                <>Criar Pedido e Liberar Produção</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
