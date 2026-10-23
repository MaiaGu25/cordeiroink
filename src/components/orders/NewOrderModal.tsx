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
  Layers,
  Sparkles,
} from "lucide-react";
import { createManualOrder, type ManualOrderItemInput } from "@/actions/orders";
import { formatCurrency } from "@/lib/utils";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { SafeImage } from "@/components/ui/SafeImage";
import { SalesChannel } from "@prisma/client";
import { toast } from "sonner";
import { ShippingCalculator } from "@/components/shipping/ShippingCalculator";
import type { ShippingOption } from "@/lib/shipping-constants";

export interface RawOption {
  id: string;
  name: string;
  costPrice: number;
  stockQuantity: number;
  sellingPrice?: number;
  description?: string | null;
  shirtModel?: string | null;
  shirtColor?: string | null;
  shirtSize?: string | null;
  dtfCode?: string | null;
  dtfPrintSize?: string | null;
  dtfPreviewUrl?: string | null;
}

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  blankShirts: RawOption[];
  dtfPrints?: RawOption[];
  packagings?: RawOption[];
  onOrderCreated?: () => void;
}

interface OrderItemRow {
  id: string;
  blankShirtId: string;
  dtfMode: "catalog" | "custom";
  dtfPrintId: string;
  artTitle: string;
  artUrl: string;
  printSize: string;
  dtfCost: number | "";
  unitPrice: number | "";
  quantity: number;
}

export function NewOrderModal({
  isOpen,
  onClose,
  blankShirts = [],
  dtfPrints = [],
  packagings = [],
  onOrderCreated,
}: NewOrderModalProps) {
  const [isPending, startTransition] = useTransition();
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);

  // 1. Origem da Venda
  const [channel, setChannel] = useState<SalesChannel>(SalesChannel.WHATSAPP);

  // 2. Cliente
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // 3. Itens Dinâmicos
  const initialShirt = blankShirts[0];
  const initialPrice = initialShirt?.sellingPrice && initialShirt.sellingPrice > 0 ? initialShirt.sellingPrice : 99.90;

  const createDefaultItem = (): OrderItemRow => {
    const s = blankShirts[0];
    const price = s?.sellingPrice && s.sellingPrice > 0 ? s.sellingPrice : 99.90;
    return {
      id: Math.random().toString(36).substring(2, 9),
      blankShirtId: s?.id || "",
      dtfMode: dtfPrints.length > 0 ? "catalog" : "custom",
      dtfPrintId: dtfPrints[0]?.id || "",
      artTitle: dtfPrints[0]?.name || "",
      artUrl: dtfPrints[0]?.dtfPreviewUrl || "",
      printSize: dtfPrints[0]?.dtfPrintSize || "A3 (30x42cm)",
      dtfCost: dtfPrints[0]?.costPrice ?? 13.90,
      unitPrice: price,
      quantity: 1,
    };
  };

  const [items, setItems] = useState<OrderItemRow[]>([createDefaultItem()]);

  // 4. Financeiro & Frete
  const [paymentMethod, setPaymentMethod] = useState<"PIX" | "CARTAO" | "DINHEIRO">("PIX");
  const [isPaid, setIsPaid] = useState<boolean>(true);
  const [notes, setNotes] = useState("");
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [destinationCep, setDestinationCep] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");

  // Limpeza de estado ao abrir/fechar
  useEffect(() => {
    if (!isOpen) {
      setChannel(SalesChannel.WHATSAPP);
      setCustomerName("");
      setCustomerPhone("");
      setItems([createDefaultItem()]);
      setPaymentMethod("PIX");
      setIsPaid(true);
      setNotes("");
      setSelectedShipping(null);
      setDestinationCep("");
      setShippingAddress("");
    } else if (items.length === 0 || !items[0].blankShirtId) {
      setItems([createDefaultItem()]);
    }
  }, [isOpen, blankShirts, dtfPrints]);

  if (!isOpen) return null;

  // Handlers para manipular itens
  const handleAddItem = () => {
    setItems((prev) => [...prev, createDefaultItem()]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleShirtChange = (itemId: string, shirtId: string) => {
    const chosen = blankShirts.find((s) => s.id === shirtId);
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const newUnitPrice =
          chosen?.sellingPrice && chosen.sellingPrice > 0 ? chosen.sellingPrice : item.unitPrice || 99.90;
        return {
          ...item,
          blankShirtId: shirtId,
          unitPrice: newUnitPrice,
        };
      })
    );
  };

  const handleDtfModeChange = (itemId: string, mode: "catalog" | "custom") => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        if (mode === "catalog" && dtfPrints.length > 0) {
          const firstDtf = dtfPrints[0];
          return {
            ...item,
            dtfMode: "catalog",
            dtfPrintId: firstDtf.id,
            artTitle: firstDtf.name,
            artUrl: firstDtf.dtfPreviewUrl || "",
            printSize: firstDtf.dtfPrintSize || "A3 (30x42cm)",
            dtfCost: firstDtf.costPrice,
          };
        } else {
          return {
            ...item,
            dtfMode: "custom",
            dtfPrintId: "",
            artTitle: "",
            artUrl: "",
            printSize: "A3 (30x42cm)",
            dtfCost: 13.90,
          };
        }
      })
    );
  };

  const handleDtfSelect = (itemId: string, dtfId: string) => {
    const dtf = dtfPrints.find((d) => d.id === dtfId);
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        if (!dtf) return item;
        return {
          ...item,
          dtfPrintId: dtf.id,
          artTitle: dtf.name,
          artUrl: dtf.dtfPreviewUrl || "",
          printSize: dtf.dtfPrintSize || "A3 (30x42cm)",
          dtfCost: dtf.costPrice,
        };
      })
    );
  };

  const handlePrintSizeChange = (itemId: string, newSize: string) => {
    let cost = 13.90;
    if (newSize.includes("A4")) cost = 9.50;
    else if (newSize.includes("Bolso")) cost = 4.50;

    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        return {
          ...item,
          printSize: newSize,
          dtfCost: cost,
        };
      })
    );
  };

  const handleImageUpload = async (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem válida (PNG, JPG, WEBP).");
      return;
    }

    setUploadingItemId(itemId);
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

      const cleanName = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]/g, " ")
        .trim();

      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== itemId) return item;
          return {
            ...item,
            artUrl: data.url,
            artTitle: item.artTitle.trim() ? item.artTitle : cleanName,
          };
        })
      );

      toast.success("Mockup/Arte carregada com sucesso!");
    } catch (err: any) {
      toast.error("Erro no upload da arte: " + err.message);
    } finally {
      setUploadingItemId(null);
    }
  };

  // Cálculos Consolidados
  const totalQuantity = items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

  let totalProducts = 0;
  let totalCMV = 0;

  items.forEach((item) => {
    const shirt = blankShirts.find((s) => s.id === item.blankShirtId);
    const shirtCost = shirt ? shirt.costPrice : 0;
    const numDtfCost = typeof item.dtfCost === "number" ? item.dtfCost : parseFloat(String(item.dtfCost).replace(",", ".")) || 0;
    const numUnitPrice = typeof item.unitPrice === "number" ? item.unitPrice : parseFloat(String(item.unitPrice).replace(",", ".")) || 0;
    const qty = Math.max(1, Number(item.quantity) || 1);

    totalProducts += numUnitPrice * qty;
    totalCMV += (shirtCost + numDtfCost) * qty;
  });

  const netProfit = totalProducts - totalCMV;
  const marginPercent = totalProducts > 0 ? (netProfit / totalProducts) * 100 : 0;

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

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.blankShirtId) {
        toast.error(`Selecione a camiseta base para a peça ${i + 1}.`);
        return;
      }
      if (!it.artTitle.trim()) {
        toast.error(`Informe o nome ou arte da estampa para a peça ${i + 1}.`);
        return;
      }
    }

    startTransition(async () => {
      try {
        const payloadItems: ManualOrderItemInput[] = items.map((it) => {
          const shirt = blankShirts.find((s) => s.id === it.blankShirtId);
          const shirtLabel = shirt
            ? `${shirt.shirtModel || shirt.name} ${shirt.shirtColor || ""} ${shirt.shirtSize || ""}`.trim()
            : "Camiseta Lisa";
          const title = `${shirtLabel} — ${it.artTitle.trim()}`;

          return {
            itemTitle: title,
            blankShirtId: it.blankShirtId,
            dtfPrintId: it.dtfMode === "catalog" ? it.dtfPrintId : undefined,
            dtfCost: typeof it.dtfCost === "number" ? it.dtfCost : parseFloat(String(it.dtfCost).replace(",", ".")) || 0,
            artTitle: it.artTitle.trim(),
            artUrl: it.artUrl.trim() || undefined,
            printSize: it.printSize,
            quantity: Math.max(1, Number(it.quantity) || 1),
            unitPrice: typeof it.unitPrice === "number" ? it.unitPrice : parseFloat(String(it.unitPrice).replace(",", ".")) || 0,
          };
        });

        await createManualOrder({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          channel,
          paymentMethod,
          isPaid,
          items: payloadItems,
          shippingAddress:
            shippingAddress.trim() ||
            (destinationCep ? `CEP: ${destinationCep}` : undefined),
          shippingCost: selectedShipping ? selectedShipping.price : 0,
          notes: notes.trim() || undefined,
        });

        toast.success(`Pedido Express (${items.length} peça/peças) criado com sucesso! Enviado para a Prensagem.`);
        if (onOrderCreated) onOrderCreated();
        onClose();
      } catch (err: any) {
        const message = err?.message || (typeof err === "string" ? err : "Erro interno");
        toast.error(`Erro ao salvar pedido: ${String(message)}`);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-[98%] sm:w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-zinc-800/80 bg-zinc-900/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Flame size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <span>+ Novo Pedido Express</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Sob Demanda
                </span>
              </h3>
              <p className="text-xs text-zinc-500">
                Cadastro ágil de vendas multicanal com cálculo automático de insumos e margem.
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
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden text-xs">
          <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
            {/* 1. Origem da Venda */}
            <div>
              <label className="block text-zinc-400 mb-1.5 font-medium">Origem da Venda</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setChannel(SalesChannel.WHATSAPP)}
                  className={`p-2 rounded-xl border flex items-center justify-center gap-2 transition cursor-pointer font-semibold ${
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
                  className={`p-2 rounded-xl border flex items-center justify-center gap-2 transition cursor-pointer font-semibold ${
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
                  className={`p-2 rounded-xl border flex items-center justify-center gap-2 transition cursor-pointer font-semibold ${
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
                  placeholder="ex: Gabriel Santos"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 font-medium"
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

            {/* 3. Peças do Pedido (Lista Dinâmica Múltipla) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-zinc-300 font-semibold flex items-center gap-1.5">
                  <Shirt size={14} className="text-amber-400" />
                  <span>Peças do Pedido ({items.length})</span>
                </label>

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-2.5 py-1 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-amber-400 border border-zinc-700/80 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus size={12} />
                  <span>+ Adicionar Outra Peça</span>
                </button>
              </div>

              {items.map((item, index) => {
                const chosenShirt = blankShirts.find((s) => s.id === item.blankShirtId);

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-3.5 relative group"
                  >
                    {/* Item Header & Remove */}
                    <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2">
                      <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center font-mono text-[10px] text-zinc-400">
                          {index + 1}
                        </span>
                        <span>Item #{index + 1}</span>
                      </span>

                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition cursor-pointer"
                          title="Remover este item"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>

                    {/* Camiseta Base */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-zinc-400 font-medium text-[11px]">
                          Camiseta Base (Estoque Físico) *
                        </label>
                        {chosenShirt && (
                          <span className="text-[10px] font-mono text-zinc-500">
                            Custo: {formatCurrency(chosenShirt.costPrice)}
                            {chosenShirt.sellingPrice && chosenShirt.sellingPrice > 0
                              ? ` | Sugerido: ${formatCurrency(chosenShirt.sellingPrice)}`
                              : ""}
                          </span>
                        )}
                      </div>

                      <select
                        value={item.blankShirtId}
                        onChange={(e) => handleShirtChange(item.id, e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-zinc-700 font-medium"
                      >
                        {blankShirts.length === 0 ? (
                          <option value="">Nenhuma camiseta cadastrada no estoque</option>
                        ) : (
                          blankShirts.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.shirtModel || s.name} {s.shirtColor || ""} {s.shirtSize || ""} — Saldo: {s.stockQuantity} un ({formatCurrency(s.costPrice)})
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    {/* Seleção de Estampa DTF: Banco de Estampas vs Upload Avulso */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-zinc-400 font-medium text-[11px]">
                          Arte / Estampa DTF *
                        </label>
                        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[10px]">
                          <button
                            type="button"
                            onClick={() => handleDtfModeChange(item.id, "catalog")}
                            className={`px-2 py-0.5 rounded transition ${
                              item.dtfMode === "catalog"
                                ? "bg-zinc-800 text-zinc-100 font-semibold"
                                : "text-zinc-500 hover:text-zinc-300"
                            }`}
                          >
                            Banco de DTF ({dtfPrints.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDtfModeChange(item.id, "custom")}
                            className={`px-2 py-0.5 rounded transition ${
                              item.dtfMode === "custom"
                                ? "bg-zinc-800 text-zinc-100 font-semibold"
                                : "text-zinc-500 hover:text-zinc-300"
                            }`}
                          >
                            Upload Avulso
                          </button>
                        </div>
                      </div>

                      {item.dtfMode === "catalog" && dtfPrints.length > 0 ? (
                        <div className="space-y-2">
                          <select
                            value={item.dtfPrintId}
                            onChange={(e) => handleDtfSelect(item.id, e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-zinc-700 font-medium"
                          >
                            {dtfPrints.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.dtfCode ? `[${d.dtfCode}] ` : ""}{d.name} — {d.dtfPrintSize || "A3"} ({formatCurrency(d.costPrice)})
                              </option>
                            ))}
                          </select>

                          {item.artUrl && (
                            <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-3">
                              <SafeImage
                                src={item.artUrl}
                                alt="Estampa selecionada"
                                className="w-10 h-10 object-cover rounded-lg border border-zinc-800 shrink-0"
                                containerClassName="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 shrink-0"
                                iconSize={16}
                              />
                              <div className="min-w-0 flex-1">
                                <span className="text-xs font-semibold text-zinc-200 block truncate">
                                  {item.artTitle}
                                </span>
                                <span className="text-[10px] text-zinc-500 font-mono">
                                  Tamanho: {item.printSize} • Custo: {formatCurrency(Number(item.dtfCost) || 0)}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <input
                            type="text"
                            required
                            value={item.artTitle}
                            onChange={(e) => {
                              const val = e.target.value;
                              setItems((prev) =>
                                prev.map((it) => (it.id === item.id ? { ...it, artTitle: val } : it))
                              );
                            }}
                            placeholder="ex: Dragão Oriental Neon Costas"
                            className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
                          />

                          {/* Upload Area */}
                          {item.artUrl ? (
                            <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <SafeImage
                                  src={item.artUrl}
                                  alt="Mockup do cliente"
                                  className="w-10 h-10 object-cover rounded-lg border border-zinc-800 shrink-0"
                                  containerClassName="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 shrink-0"
                                  iconSize={16}
                                />
                                <span className="text-xs text-emerald-400 font-medium truncate">
                                  Arte anexada com sucesso
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  setItems((prev) =>
                                    prev.map((it) => (it.id === item.id ? { ...it, artUrl: "" } : it))
                                  )
                                }
                                className="p-1 text-zinc-500 hover:text-red-400 transition cursor-pointer"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ) : (
                            <label className="p-3 rounded-xl border border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-950/60 hover:bg-zinc-950 transition flex items-center justify-center gap-2 cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(item.id, e)}
                                className="hidden"
                              />
                              {uploadingItemId === item.id ? (
                                <>
                                  <Loader2 size={14} className="animate-spin text-amber-400" />
                                  <span className="text-zinc-400">Enviando arte...</span>
                                </>
                              ) : (
                                <>
                                  <Upload size={14} className="text-zinc-500" />
                                  <span className="text-zinc-400 text-[11px]">
                                    Anexar arte/print do WhatsApp
                                  </span>
                                </>
                              )}
                            </label>
                          )}

                          {/* Tamanhos DTF */}
                          <div className="grid grid-cols-3 gap-1.5 pt-1">
                            {[
                              { label: "A3 (Costas)", size: "A3 (30x42cm)", cost: 13.90 },
                              { label: "A4 (Frente)", size: "A4 (21x30cm)", cost: 9.50 },
                              { label: "Bolso (Peito)", size: "Bolso (10x10cm)", cost: 4.50 },
                            ].map((sz) => (
                              <button
                                type="button"
                                key={sz.size}
                                onClick={() => handlePrintSizeChange(item.id, sz.size)}
                                className={`py-1.5 px-1 rounded-lg border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                                  item.printSize === sz.size
                                    ? "bg-amber-500/10 border-amber-500/40 text-amber-300 font-semibold"
                                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                                }`}
                              >
                                <span className="text-[11px]">{sz.label}</span>
                                <span className="text-[9px] font-mono text-zinc-500">
                                  R$ {sz.cost.toFixed(2)}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Preço Unitário & Quantidade deste Item */}
                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-zinc-800/60">
                      <div>
                        <label className="block text-zinc-400 mb-1 text-[11px]">Quantidade</label>
                        <input
                          type="number"
                          min={1}
                          step={1}
                          value={item.quantity}
                          onChange={(e) => {
                            const val = Math.max(1, parseInt(e.target.value) || 1);
                            setItems((prev) =>
                              prev.map((it) => (it.id === item.id ? { ...it, quantity: val } : it))
                            );
                          }}
                          className="w-full px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono text-xs focus:outline-none focus:border-zinc-700"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-zinc-300 font-semibold mb-1 text-[11px]">
                          Preço Cobrado por Peça (R$) *
                        </label>
                        <CurrencyInput
                          value={item.unitPrice}
                          onChange={(val) => {
                            setItems((prev) =>
                              prev.map((it) => (it.id === item.id ? { ...it, unitPrice: val } : it))
                            );
                          }}
                          placeholder="99,90"
                          className="w-full px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono font-bold text-xs focus:outline-none focus:border-zinc-700"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 4. Entrega & Frete */}
            <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Endereço de Destino / Entrega
                </label>
                <input
                  type="text"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="ex: Av. Paulista, 1000 - Bela Vista, São Paulo - SP"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
                />
              </div>

              <ShippingCalculator
                quantity={totalQuantity}
                selectedOption={selectedShipping}
                onSelectOption={setSelectedShipping}
                variant="admin"
                initialCep={destinationCep}
                onCepChange={setDestinationCep}
              />
            </div>

            {/* 5. Pagamento & Status Financeiro */}
            <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      ✓ Pago
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

              {/* Live Consolidated Financial Margin Box */}
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-850 flex flex-col gap-2 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase">
                      Total Produtos ({totalQuantity} un)
                    </span>
                    <span className="text-zinc-100 font-bold text-sm">
                      {formatCurrency(totalProducts)}
                    </span>
                    <span className="text-[10px] text-zinc-500 block">
                      CMV Estimado: {formatCurrency(totalCMV)}
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

                {selectedShipping && (
                  <div className="pt-2 border-t border-zinc-850 flex items-center justify-between text-[11px]">
                    <span className="text-zinc-400">
                      Frete ({selectedShipping.service}):
                    </span>
                    <span className="text-amber-400 font-bold">
                      +{formatCurrency(selectedShipping.price)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sticky Pinned Footer Action */}
          <div className="p-3 sm:p-4 border-t border-zinc-800 bg-zinc-950 shrink-0 flex items-center justify-between gap-2.5">
            <span className="text-xs font-mono text-zinc-400">
              Total: <strong className="text-zinc-100">{formatCurrency(totalProducts + (selectedShipping?.price || 0))}</strong>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition cursor-pointer text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending || uploadingItemId !== null}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold transition shadow-sm flex items-center gap-2 cursor-pointer text-xs"
              >
                {isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Salvando Pedido...
                  </>
                ) : (
                  <>
                    <Flame size={15} />
                    Criar Pedido ({items.length} peça{items.length > 1 ? "s" : ""})
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
