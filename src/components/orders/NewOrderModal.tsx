"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import {
  X,
  Plus,
  Shirt,
  Image as ImageIcon,
  Loader2,
  Upload,
  Check,
  DollarSign,
  AlertCircle,
  Trash2,
  Flame,
  Send,
} from "lucide-react";
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
  dtfPrints?: RawOption[];
  packagings?: RawOption[];
  onOrderCreated?: () => void;
}

export function NewOrderModal({
  isOpen,
  onClose,
  blankShirts,
  onOrderCreated,
}: NewOrderModalProps) {
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Origem da Venda
  const [channel, setChannel] = useState<SalesChannel>(SalesChannel.WHATSAPP);

  // 2. Cliente
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // 3. Camiseta Base
  const [selectedShirtId, setSelectedShirtId] = useState<string>(blankShirts[0]?.id || "");

  // 4. Estampa / Arte
  const [artTitle, setArtTitle] = useState("");
  const [artUrl, setArtUrl] = useState("");
  const [printSize, setPrintSize] = useState("A3 (30x42cm)");

  // 5. Financeiro
  const [unitPrice, setUnitPrice] = useState<number>(99.90);
  const [quantity, setQuantity] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<"PIX" | "CARTAO" | "DINHEIRO">("PIX");
  const [isPaid, setIsPaid] = useState<boolean>(true);
  const [dtfCost, setDtfCost] = useState<number>(13.90);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (blankShirts.length > 0 && !selectedShirtId) {
      setSelectedShirtId(blankShirts[0].id);
    }
  }, [blankShirts, selectedShirtId]);

  if (!isOpen) return null;

  const handlePrintSizeChange = (newSize: string) => {
    setPrintSize(newSize);
    if (newSize.includes("A3")) setDtfCost(13.90);
    else if (newSize.includes("A4")) setDtfCost(9.50);
    else if (newSize.includes("Bolso")) setDtfCost(4.50);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem válida (PNG, JPG, WEBP).");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "artes-clientes");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro no upload");

      setArtUrl(data.url);
      if (!artTitle) {
        const cleanName = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[-_]/g, " ")
          .trim();
        setArtTitle(cleanName);
      }
      toast.success("Mockup/Arte carregada com sucesso!");
    } catch (err: any) {
      toast.error("Erro no upload da arte: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearImage = () => {
    setArtUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Cálculos dinâmicos
  const chosenShirt = blankShirts.find((s) => s.id === selectedShirtId);
  const shirtCost = chosenShirt ? chosenShirt.costPrice : 0;
  const currentDtfCost = dtfCost;
  const totalCostUnit = shirtCost + currentDtfCost;

  const totalCharged = unitPrice * quantity;
  const totalCMV = totalCostUnit * quantity;
  const netProfit = totalCharged - totalCMV;
  const marginPercent = totalCharged > 0 ? (netProfit / totalCharged) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      toast.error("Informe o nome do cliente.");
      return;
    }

    if (!customerPhone.trim()) {
      toast.error("Informe o WhatsApp do cliente.");
      return;
    }

    const shirtLabel = chosenShirt
      ? `${chosenShirt.shirtModel || chosenShirt.name} ${chosenShirt.shirtColor || ""} ${chosenShirt.shirtSize || ""}`.trim()
      : "Camiseta Lisa";

    const finalItemTitle = artTitle.trim()
      ? `${shirtLabel} — ${artTitle.trim()}`
      : `${shirtLabel} (Personalizada)`;

    startTransition(async () => {
      try {
        await createManualOrder({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          channel,
          paymentMethod,
          isPaid,
          itemTitle: finalItemTitle,
          blankShirtId: selectedShirtId || undefined,
          dtfCost: Number(dtfCost) || 0,
          artTitle: artTitle.trim() || undefined,
          artUrl: artUrl.trim() || undefined,
          printSize,
          quantity: Number(quantity) || 1,
          unitPrice: Number(unitPrice) || 0,
          notes: notes.trim() || undefined,
        });

        toast.success("Pedido Express criado! Enviado para a Fila de Prensagem.");
        if (onOrderCreated) onOrderCreated();
        onClose();
      } catch (err: any) {
        toast.error("Erro ao salvar pedido: " + err.message);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Flame size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <span>+ Novo Pedido Express</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Sob Demanda
                </span>
              </h3>
              <p className="text-xs text-zinc-500">
                Cadastro ágil de vendas via WhatsApp e Instagram Direct sem burocracia.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* 1. Origem da Venda (Pill Selector) */}
          <div>
            <label className="block text-zinc-400 mb-1.5 font-medium">Origem da Venda</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setChannel(SalesChannel.WHATSAPP)}
                className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 transition cursor-pointer font-semibold ${
                  channel === SalesChannel.WHATSAPP
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-sm"
                    : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel(SalesChannel.INSTAGRAM)}
                className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 transition cursor-pointer font-semibold ${
                  channel === SalesChannel.INSTAGRAM
                    ? "bg-pink-500/10 border-pink-500/40 text-pink-400 shadow-sm"
                    : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-pink-400" />
                <span>Instagram Direct</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel(SalesChannel.MANUAL)}
                className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 transition cursor-pointer font-semibold ${
                  channel === SalesChannel.MANUAL
                    ? "bg-zinc-800 border-zinc-700 text-zinc-100 shadow-sm"
                    : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-zinc-400" />
                <span>Balcão / Outro</span>
              </button>
            </div>
          </div>

          {/* 2. Cliente */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Nome do Cliente *</label>
              <input
                required
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="ex: João Pedro"
                className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-medium">WhatsApp / Telefone *</label>
              <input
                required
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="(11) 98765-4321"
                className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 font-mono"
              />
            </div>
          </div>

          {/* 3. Camiseta Base do Estoque */}
          <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-zinc-300 font-semibold flex items-center gap-1.5">
                <Shirt size={14} className="text-amber-400" />
                <span>Camiseta Base (Estoque Físico) *</span>
              </label>
              {chosenShirt && (
                <span className="text-[11px] font-mono text-zinc-400">
                  Custo: {formatCurrency(chosenShirt.costPrice)}
                </span>
              )}
            </div>

            <select
              value={selectedShirtId}
              onChange={(e) => setSelectedShirtId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-zinc-700 font-medium"
            >
              {blankShirts.length === 0 ? (
                <option value="">Nenhuma camiseta cadastrada no estoque (cadastre em /estoque)</option>
              ) : (
                blankShirts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.shirtModel || s.name} {s.shirtColor || ""} {s.shirtSize || ""} — Saldo: {s.stockQuantity} un ({formatCurrency(s.costPrice)})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* 4. Estampa & Upload da Arte do WhatsApp */}
          <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                Nome / Descrição da Estampa Encomendada *
              </label>
              <input
                required
                type="text"
                value={artTitle}
                onChange={(e) => setArtTitle(e.target.value)}
                placeholder="ex: Dragão Oriental Neon Costas"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
              />
            </div>

            {/* Upload Mockup WhatsApp */}
            <div>
              <label className="block text-zinc-400 mb-1.5 font-medium">
                Upload da Arte / Mockup Enviado pelo Cliente
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />

              {artUrl ? (
                <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={artUrl}
                      alt="Arte do cliente"
                      className="w-12 h-12 object-cover rounded-lg border border-zinc-850 shrink-0"
                    />
                    <div className="truncate">
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <Check size={11} /> Arte salva em public/uploads/artes-clientes
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono truncate block">
                        {artUrl}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearImage}
                    className="p-1.5 text-zinc-500 hover:text-red-400 transition cursor-pointer"
                    title="Remover imagem"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-4 rounded-xl border border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-950/60 hover:bg-zinc-950 transition flex items-center justify-center gap-3 cursor-pointer ${
                    isUploading ? "opacity-60 pointer-events-none" : ""
                  }`}
                >
                  {isUploading ? (
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Loader2 size={16} className="animate-spin text-amber-400" />
                      <span>Salvando arte do WhatsApp...</span>
                    </div>
                  ) : (
                    <>
                      <Upload size={16} className="text-zinc-500" />
                      <span className="text-xs text-zinc-300">
                        Clique para anexar o print/arquivo que o cliente enviou
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Tamanho da Estampa */}
            <div>
              <label className="block text-zinc-400 mb-1.5 font-medium">Tamanho da Estampa</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "A3 (Costas)", size: "A3 (30x42cm)", cost: 13.90 },
                  { label: "A4 (Frente)", size: "A4 (21x30cm)", cost: 9.50 },
                  { label: "Bolso (Peito)", size: "Bolso (10x10cm)", cost: 4.50 },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.size}
                    onClick={() => handlePrintSizeChange(item.size)}
                    className={`py-2 px-2 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                      printSize === item.size
                        ? "bg-amber-500/10 border-amber-500/40 text-amber-300 font-bold shadow-sm"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <span className="text-xs">{item.label}</span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      R$ {item.cost.toFixed(2)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 5. Financeiro da Venda */}
          <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Valor Total Cobrado (R$) *
                </label>
                <input
                  type="number"
                  step="0.50"
                  min={0}
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono text-base font-bold focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Custo Estimado do DTF (R$)</label>
                <input
                  type="number"
                  step="0.10"
                  min={0}
                  value={dtfCost}
                  onChange={(e) => setDtfCost(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono focus:outline-none focus:border-zinc-700"
                />
              </div>
            </div>

            {/* Método & Status do Pagamento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Método de Pagamento</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["PIX", "CARTAO", "DINHEIRO"] as const).map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setPaymentMethod(m)}
                      className={`py-1.5 px-2 rounded-lg border text-center text-xs font-semibold transition cursor-pointer ${
                        paymentMethod === m
                          ? "bg-zinc-800 border-zinc-600 text-zinc-100 shadow-sm"
                          : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      {m === "PIX" ? "Pix" : m === "CARTAO" ? "Cartão" : "Dinheiro"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Status do Pagamento</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsPaid(true)}
                    className={`py-1.5 px-2 rounded-lg border text-center text-xs font-semibold transition cursor-pointer ${
                      isPaid
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400"
                    }`}
                  >
                    ✓ Pago (Confirmado)
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPaid(false)}
                    className={`py-1.5 px-2 rounded-lg border text-center text-xs font-semibold transition cursor-pointer ${
                      !isPaid
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-300 font-bold"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400"
                    }`}
                  >
                    Pendente
                  </button>
                </div>
              </div>
            </div>

            {/* Live Financial Margin Box */}
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center justify-between font-mono text-xs">
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase">Custos Insumos</span>
                <span className="text-zinc-300 font-semibold">
                  {formatCurrency(totalCMV)}
                </span>
                <span className="text-[10px] text-zinc-500 block">
                  (R$ {shirtCost.toFixed(2)} malha + R$ {currentDtfCost.toFixed(2)} dtf)
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-emerald-500 block uppercase font-bold">
                  Lucro Líquido Real
                </span>
                <span className="text-emerald-400 font-bold text-base">
                  {formatCurrency(netProfit)}
                </span>
                <span className="text-[10px] text-emerald-500 block">
                  {marginPercent.toFixed(0)}% de margem no bolso
                </span>
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending || isUploading}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold transition shadow-sm flex items-center gap-2 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Salvando Pedido...
                </>
              ) : (
                <>
                  <Flame size={15} />
                  Criar Pedido & Liberar Prensagem
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
