"use client";

import { useState, useTransition, useEffect } from "react";
import { X, Plus, Shirt, Image as ImageIcon, Package, Loader2, Sparkles, Link as LinkIcon, DollarSign, AlertCircle } from "lucide-react";
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

  // 1. Canal de Venda & Cliente
  const [channel, setChannel] = useState<SalesChannel>(SalesChannel.MANUAL);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");

  // 2. Arte e Encomenda
  const [artTitle, setArtTitle] = useState("");
  const [itemTitle, setItemTitle] = useState("");
  const [printSize, setPrintSize] = useState("A3 (30x42cm)");
  const [artUrl, setArtUrl] = useState("");
  const [saveToDtfCatalog, setSaveToDtfCatalog] = useState(false);

  // 3. Camiseta Lisa & Insumos
  const [selectedShirtId, setSelectedShirtId] = useState<string>(blankShirts[0]?.id || "");
  const [selectedDtfId, setSelectedDtfId] = useState<string>("custom");
  const [dtfCost, setDtfCost] = useState<number>(13.90);
  const [selectedPackId, setSelectedPackId] = useState<string>(packagings[0]?.id || "none");

  // 4. Valores e Quantidade
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState<number>(99.90);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [notes, setNotes] = useState("");

  // Atualiza default shirt se lista mudar
  useEffect(() => {
    if (blankShirts.length > 0 && !selectedShirtId) {
      setSelectedShirtId(blankShirts[0].id);
    }
  }, [blankShirts, selectedShirtId]);

  if (!isOpen) return null;

  // Atualiza custo do DTF ao mudar o tamanho
  const handlePrintSizeChange = (newSize: string) => {
    setPrintSize(newSize);
    if (selectedDtfId === "custom") {
      if (newSize.includes("A4")) setDtfCost(9.50);
      else if (newSize.includes("Bolso")) setDtfCost(4.50);
      else setDtfCost(13.90);
    }
  };

  const chosenShirt = blankShirts.find((s) => s.id === selectedShirtId);
  const chosenPack = packagings.find((p) => p.id === selectedPackId);

  const shirtCost = chosenShirt ? chosenShirt.costPrice : 0;
  const currentDtfCost = dtfCost;
  const packCost = chosenPack ? chosenPack.costPrice : 0;
  const unitCost = shirtCost + currentDtfCost + packCost;

  const totalProducts = unitPrice * quantity;
  const totalBilled = totalProducts + shippingCost;

  // Cálculo da comissão do canal
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

    if (!customerPhone.trim()) {
      toast.error("Por favor, informe o telefone/WhatsApp do cliente.");
      return;
    }

    const finalTitle =
      itemTitle.trim() ||
      (artTitle.trim()
        ? `Camiseta ${chosenShirt?.shirtModel || "Oversized"} - ${artTitle.trim()}`
        : chosenShirt
        ? `${chosenShirt.name} (Sob Encomenda)`
        : "Camiseta Personalizada Sob Encomenda");

    startTransition(async () => {
      try {
        await createManualOrder({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim() || undefined,
          shippingAddress: shippingAddress.trim() || undefined,
          channel,
          itemTitle: finalTitle,
          blankShirtId: selectedShirtId && selectedShirtId !== "none" ? selectedShirtId : undefined,
          dtfPrintId: selectedDtfId !== "custom" && selectedDtfId !== "none" ? selectedDtfId : undefined,
          dtfCost: Number(dtfCost) || 0,
          packagingId: selectedPackId !== "none" ? selectedPackId : undefined,
          artTitle: artTitle.trim() || undefined,
          artUrl: artUrl.trim() || undefined,
          printSize,
          saveToDtfCatalog,
          quantity: Number(quantity) || 1,
          unitPrice: Number(unitPrice) || 0,
          shippingCost: Number(shippingCost) || 0,
          notes: notes.trim() || undefined,
        });

        toast.success("Pedido cadastrado com sucesso! Enviado para a fila de Produção e Kanban.");
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
                Lance pedidos da Shopee, Shein, TikTok ou WhatsApp com cálculo dinâmico de insumos e margem.
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
          {/* 1. Canal de Venda & Cliente */}
          <div className="space-y-3">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">
              1. Canal de Venda & Dados do Cliente
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Canal de Venda *</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as SalesChannel)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-zinc-700 font-medium"
                >
                  <option value={SalesChannel.MANUAL}>WhatsApp / Direto (0% taxa)</option>
                  <option value={SalesChannel.SHOPEE}>Shopee (~20% + R$ 4,00)</option>
                  <option value={SalesChannel.SHEIN}>Shein (~18% comissão)</option>
                  <option value={SalesChannel.TIKTOK}>TikTok Shop (~15% comissão)</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Nome do Cliente *</label>
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
                <label className="block text-zinc-400 mb-1 font-medium">WhatsApp / Telefone *</label>
                <input
                  required
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Endereço de Entrega (Opcional)</label>
                <input
                  type="text"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Rua, número, bairro - Cidade/UF"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
                />
              </div>
            </div>
          </div>

          {/* 2. Arte / Descrição da Estampa */}
          <div className="space-y-3 pt-3 border-t border-zinc-850">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">
              2. Arte & Estampa Sob Encomenda
            </span>

            <div>
              <label className="block text-zinc-400 mb-1 font-medium">
                Arte / Descrição da Estampa Sob Encomenda *
              </label>
              <input
                required
                type="text"
                value={artTitle}
                onChange={(e) => setArtTitle(e.target.value)}
                placeholder="ex: Estampa Caveira Cyberpunk Costas (Neon)"
                className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Tamanho da Impressão</label>
                <select
                  value={printSize}
                  onChange={(e) => handlePrintSizeChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-zinc-700"
                >
                  <option value="A3 (30x42cm)">A3 (30x42cm) — Estampa Grande</option>
                  <option value="A4 (21x30cm)">A4 (21x30cm) — Estampa Média</option>
                  <option value="Bolso (10x10cm)">Bolso (10x10cm) — Logo Peito</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium flex items-center gap-1.5">
                  <LinkIcon size={12} className="text-zinc-500" />
                  <span>Link da Arte / Mockup (Drive, Imgur, etc.)</span>
                </label>
                <input
                  type="url"
                  value={artUrl}
                  onChange={(e) => setArtUrl(e.target.value)}
                  placeholder="https://drive.google.com/... ou https://..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 font-mono text-[11px] focus:outline-none focus:border-zinc-700"
                />
              </div>
            </div>

            {artTitle && (
              <label className="flex items-center gap-2 cursor-pointer pt-1 text-zinc-400 hover:text-zinc-200 transition-colors">
                <input
                  type="checkbox"
                  checked={saveToDtfCatalog}
                  onChange={(e) => setSaveToDtfCatalog(e.target.checked)}
                  className="rounded bg-zinc-950 border-zinc-800 text-amber-500 accent-amber-500"
                />
                <span>Salvar esta arte no Banco de Estampas para reuso futuro</span>
              </label>
            )}
          </div>

          {/* 3. Camiseta Lisa & Custo do DTF */}
          <div className="space-y-3 pt-3 border-t border-zinc-850">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">
              3. Insumos Consumidos & Custos
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Dropdown Camiseta Lisa do Estoque */}
              <div>
                <label className="block text-zinc-400 mb-1 font-medium flex items-center justify-between">
                  <span>Camiseta Lisa Utilizada *</span>
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
                  {blankShirts.length === 0 ? (
                    <option value="">Nenhuma camiseta cadastrada no estoque</option>
                  ) : (
                    blankShirts.map((shirt) => (
                      <option key={shirt.id} value={shirt.id}>
                        {shirt.name} (Saldo: {shirt.stockQuantity} un) — {formatCurrency(shirt.costPrice)}
                      </option>
                    ))
                  )}
                </select>
                {blankShirts.length === 0 && (
                  <p className="text-[10px] text-amber-400/80 mt-1 flex items-center gap-1">
                    <AlertCircle size={10} />
                    Cadastre suas camisetas em Estoque para abater o saldo físico.
                  </p>
                )}
              </div>

              {/* Custo do DTF / Impressão */}
              <div>
                <label className="block text-zinc-400 mb-1 font-medium flex items-center justify-between">
                  <span>Custo do DTF / Impressão (R$) *</span>
                  <span className="text-[10px] text-zinc-500 font-mono">por peça</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.10"
                    min={0}
                    value={dtfCost}
                    onChange={(e) => setDtfCost(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 font-mono focus:outline-none focus:border-zinc-700"
                  />
                </div>
                {/* Quick Presets for DTF Cost */}
                <div className="flex gap-1.5 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setDtfCost(13.90)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800/60 transition font-mono"
                  >
                    A3 (R$ 13,90)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDtfCost(9.50)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800/60 transition font-mono"
                  >
                    A4 (R$ 9,50)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDtfCost(4.50)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800/60 transition font-mono"
                  >
                    Bolso (R$ 4,50)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDtfCost(0)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800/60 transition font-mono"
                  >
                    Sem DTF (R$ 0)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Valores & Margem em Tempo Real */}
          <div className="space-y-3 pt-3 border-t border-zinc-850">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">
              4. Precificação Cobrada do Cliente & Margem Real
            </span>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Quantidade</label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 font-mono text-center focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Valor Cobrado (R$)</label>
                <input
                  type="number"
                  step="0.50"
                  min={0}
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 font-mono text-center focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Frete Cobrado (R$)</label>
                <input
                  type="number"
                  step="0.50"
                  min={0}
                  value={shippingCost}
                  onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 font-mono text-center focus:outline-none focus:border-zinc-700"
                />
              </div>
            </div>

            {/* Live Financial Breakdown Card */}
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between text-xs font-mono">
              <div className="space-y-0.5">
                <span className="text-zinc-500 block text-[11px]">CMV Insumos:</span>
                <span className="text-zinc-300 font-semibold">{formatCurrency(estimatedCMV)}</span>
                <span className="text-[10px] text-zinc-600 block">
                  (R$ {shirtCost.toFixed(2)} malha + R$ {currentDtfCost.toFixed(2)} dtf)
                </span>
              </div>

              <div className="space-y-0.5 text-center">
                <span className="text-zinc-500 block text-[11px]">Taxas ({channel}):</span>
                <span className="text-zinc-400 font-semibold">{formatCurrency(estimatedFee)}</span>
                <span className="text-[10px] text-zinc-600 block">
                  Líq. Venda: {formatCurrency(netAmount)}
                </span>
              </div>

              <div className="space-y-0.5 text-right">
                <span className="text-emerald-500 block text-[11px] font-bold">Lucro Líquido Real:</span>
                <span className="text-emerald-400 font-bold text-sm">
                  {formatCurrency(estimatedNetProfit)} ({profitMargin.toFixed(0)}%)
                </span>
                <span className="text-[10px] text-emerald-600 block">
                  No bolso por peça: R$ {(estimatedNetProfit / quantity).toFixed(2)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-medium">
                Observações para a Fila de Produção / Prensagem
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ex: Prensagem a 160°C por 15s nas costas, centralizada 7cm abaixo da gola."
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
