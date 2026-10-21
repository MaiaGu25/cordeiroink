"use client";

import { useState, useTransition, useRef } from "react";
import {
  Upload,
  MessageCircle,
  Loader2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  X,
  ShoppingBag,
  Users,
  User,
  Truck,
} from "lucide-react";
import { uploadStorefrontFile, createLeadQuote } from "@/actions/storefront";
import { SafeImage } from "@/components/ui/SafeImage";
import { useCart } from "@/components/storefront/CartContext";
import { toast } from "sonner";

export function CustomOrderSection() {
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addItem, openCart } = useCart();

  // Tipo de Pedido: Individual (1 peça) vs Lote (Conferências / Igrejas)
  const [orderType, setOrderType] = useState<"INDIVIDUAL" | "BULK">("INDIVIDUAL");

  const [customerName, setCustomerName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [shirtModel, setShirtModel] = useState("Camiseta Oversized Heavyweight 26.1");
  const [size, setSize] = useState("G");
  const [color, setColor] = useState("Preto");
  const [bulkQuantity, setBulkQuantity] = useState("20");
  const [customDesignUrl, setCustomDesignUrl] = useState("");
  const [designFileName, setDesignFileName] = useState("");
  const [notes, setNotes] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "leads");

    try {
      const res = await uploadStorefrontFile(formData);
      if (res.success && res.url) {
        setCustomDesignUrl(res.url);
        setDesignFileName(file.name);
        toast.success("Arte enviada com sucesso!");
      } else {
        toast.error(res.error || "Erro ao subir arquivo");
      }
    } catch (err: any) {
      toast.error("Erro no upload da estampa: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleIndividualCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !whatsapp.trim()) {
      toast.error("Por favor, preencha seu nome e WhatsApp.");
      return;
    }

    startTransition(async () => {
      try {
        // Registra lead no banco de dados para rastreabilidade
        await createLeadQuote({
          customerName,
          whatsapp,
          shirtModel: `${shirtModel} (Cor: ${color})`,
          size,
          customDesignUrl,
          notes: notes ? `[Pedido Varejo 1 un] ${notes}` : "[Pedido Varejo 1 un]",
        });

        // Adiciona a peça personalizada ao Carrinho com a arte enviada
        addItem({
          productId: `custom-${Date.now()}`,
          title: `Camiseta Personalizada (${shirtModel})`,
          colorName: color,
          size,
          price: 99.90,
          quantity: 1,
          imageUrl:
            customDesignUrl ||
            "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop",
        });

        toast.success("Peça adicionada ao carrinho! Calcule o frete para finalizar.");
        openCart();
      } catch (err: any) {
        toast.error("Erro ao processar pedido: " + err.message);
      }
    });
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !whatsapp.trim()) {
      toast.error("Por favor, preencha seu nome e WhatsApp.");
      return;
    }

    startTransition(async () => {
      try {
        const fullNotes = `[Lote Evento: ~${bulkQuantity} unidades] ${notes}`.trim();
        const res = await createLeadQuote({
          customerName,
          whatsapp,
          shirtModel,
          size: `${size} (Lote: ${bulkQuantity} un)`,
          customDesignUrl,
          notes: fullNotes,
        });

        setIsSuccess(true);
        toast.success("Orçamento gerado! Redirecionando para o WhatsApp do ateliê...");

        setTimeout(() => {
          if (res.whatsappUrl) {
            window.location.href = res.whatsappUrl;
          }
        }, 1200);
      } catch (err: any) {
        toast.error("Erro ao enviar pedido de orçamento: " + err.message);
      }
    });
  };

  return (
    <section id="personalizadas" className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-[#F7F4EE] border-t border-[#E6DED2]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Visual Briefing & Process */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E6DED2] text-[#0A0A0A] text-[10px] font-sans font-semibold uppercase tracking-widest">
                <Sparkles size={11} />
                <span>Sob Encomenda • Varejo & Lotes para Igrejas</span>
              </div>

              <h2 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-[#0A0A0A] leading-[1.08]">
                A Identidade <br />
                <span className="italic font-normal">do seu propósito.</span>
              </h2>

              <p className="font-sans text-sm sm:text-base text-[#666666] leading-relaxed font-light">
                {orderType === "INDIVIDUAL"
                  ? "Crie uma peça exclusiva para você! Produzimos sua camiseta personalizada em modelagem streetwear heavyweight e estampa DTF em alta definição a partir de 1 unidade."
                  : "Que tal deixar a conferência da sua igreja ainda mais especial? Criamos camisetas personalizadas que transformam a identidade do seu evento em algo que todo mundo vai querer vestir."}
              </p>
            </div>

            {/* Steps in 3 bullet cards */}
            <div className="space-y-4 pt-4 border-t border-[#E6DED2]">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#FAF9F6] border border-[#E6DED2]">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#0A0A0A] text-[#F7F4EE] font-serif font-bold text-xs shrink-0">
                  1
                </span>
                <div>
                  <h4 className="font-sans text-xs uppercase tracking-wider font-bold text-[#0A0A0A]">
                    {orderType === "INDIVIDUAL" ? "Envie sua Arte ou Ideia" : "Envie o Tema da Conferência"}
                  </h4>
                  <p className="font-sans text-xs text-[#737373] mt-0.5 font-light">
                    {orderType === "INDIVIDUAL"
                      ? "Logos, versículos, artes autorais ou referências visuais que deseja estampar."
                      : "Identidade visual do evento, logo do congresso ou frase temática da igreja."}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#FAF9F6] border border-[#E6DED2]">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#0A0A0A] text-[#F7F4EE] font-serif font-bold text-xs shrink-0">
                  2
                </span>
                <div>
                  <h4 className="font-sans text-xs uppercase tracking-wider font-bold text-[#0A0A0A]">
                    Escolha a Malha, Cor & Modelagem
                  </h4>
                  <p className="font-sans text-xs text-[#737373] mt-0.5 font-light">
                    Malha heavyweight 260g/m² ou 30.1 penteada, do tamanho P ao XG, nas cores Preto ou Off-White.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#FAF9F6] border border-[#E6DED2]">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#0A0A0A] text-[#F7F4EE] font-serif font-bold text-xs shrink-0">
                  3
                </span>
                <div>
                  <h4 className="font-sans text-xs uppercase tracking-wider font-bold text-[#0A0A0A]">
                    {orderType === "INDIVIDUAL" ? "Cálculo de Frete & Checkout" : "Orçamento Rápido em Lote"}
                  </h4>
                  <p className="font-sans text-xs text-[#737373] mt-0.5 font-light">
                    {orderType === "INDIVIDUAL"
                      ? "Avance direto para o cálculo de frete (Correios/Melhor Envio) e finalize seu pedido com total agilidade."
                      : "Montamos a prévia digital, definimos a tabela de preços regressivos por quantidade e entregamos no endereço da igreja."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Custom Order Form */}
          <div className="lg:col-span-7 bg-[#FAF9F6] border border-[#E6DED2] rounded-3xl p-6 sm:p-10 shadow-lg shadow-black/[0.03]">
            {isSuccess ? (
              <div className="py-12 text-center space-y-4">
                <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A]">
                  Solicitação Enviada com Sucesso!
                </h3>
                <p className="font-sans text-xs sm:text-sm text-[#737373] max-w-md mx-auto">
                  Você está sendo redirecionado para o WhatsApp da Cordeiro Ink para concluir os detalhes com nosso impressor.
                </p>
                <div className="pt-4 flex items-center justify-center gap-2 text-xs font-mono text-[#0A0A0A]">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Abrindo conversa...</span>
                </div>
              </div>
            ) : (
              <form
                onSubmit={orderType === "INDIVIDUAL" ? handleIndividualCheckout : handleBulkSubmit}
                className="space-y-6"
              >
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#0A0A0A]">
                    Monte sua Peça Sob Encomenda
                  </h3>
                  <p className="font-sans text-xs text-[#737373] mt-1 font-light">
                    Selecione o formato de pedido que melhor atende à sua necessidade:
                  </p>
                </div>

                {/* Seletor Varejo Individual (1 un) vs Lote Eventos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1.5 rounded-2xl bg-[#F7F4EE] border border-[#E6DED2]">
                  <button
                    type="button"
                    onClick={() => setOrderType("INDIVIDUAL")}
                    className={`p-3 rounded-xl flex items-center gap-3 transition cursor-pointer text-left ${
                      orderType === "INDIVIDUAL"
                        ? "bg-[#0A0A0A] text-[#FAF9F6] shadow-md"
                        : "text-[#666666] hover:text-[#0A0A0A]"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        orderType === "INDIVIDUAL" ? "bg-white/15 text-white" : "bg-[#E6DED2] text-[#0A0A0A]"
                      }`}
                    >
                      <User size={16} />
                    </div>
                    <div>
                      <span className="font-sans text-xs font-bold block">
                        Pedido Individual
                      </span>
                      <span className="text-[10px] font-mono opacity-80">
                        1 unidade • R$ 99,90
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderType("BULK")}
                    className={`p-3 rounded-xl flex items-center gap-3 transition cursor-pointer text-left ${
                      orderType === "BULK"
                        ? "bg-[#0A0A0A] text-[#FAF9F6] shadow-md"
                        : "text-[#666666] hover:text-[#0A0A0A]"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        orderType === "BULK" ? "bg-white/15 text-white" : "bg-[#E6DED2] text-[#0A0A0A]"
                      }`}
                    >
                      <Users size={16} />
                    </div>
                    <div>
                      <span className="font-sans text-xs font-bold block">
                        Lote / Evento
                      </span>
                      <span className="text-[10px] font-mono opacity-80">
                        Igrejas & Conferências
                      </span>
                    </div>
                  </button>
                </div>

                {/* Nome & WhatsApp */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-[#0A0A0A] mb-1.5">
                      Seu Nome *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ex: Matheus Cordeiro"
                      className="w-full px-4 py-3 rounded-xl bg-[#F7F4EE] border border-[#E6DED2] text-xs font-sans text-[#0A0A0A] placeholder:text-[#999999] focus:outline-none focus:border-[#0A0A0A] transition"
                    />
                  </div>

                  <div>
                    <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-[#0A0A0A] mb-1.5">
                      WhatsApp com DDD *
                    </label>
                    <input
                      type="tel"
                      required
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="w-full px-4 py-3 rounded-xl bg-[#F7F4EE] border border-[#E6DED2] text-xs font-sans text-[#0A0A0A] placeholder:text-[#999999] focus:outline-none focus:border-[#0A0A0A] transition"
                    />
                  </div>
                </div>

                {/* Modelagem, Cor & Tamanho / Quantidade de Lote */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-[#0A0A0A] mb-1.5">
                      Modelagem *
                    </label>
                    <select
                      value={shirtModel}
                      onChange={(e) => setShirtModel(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-xl bg-[#F7F4EE] border border-[#E6DED2] text-xs font-sans text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] transition cursor-pointer"
                    >
                      <option value="Camiseta Oversized Heavyweight 26.1">Oversized 26.1</option>
                      <option value="Camiseta Tradicional 30.1">Tradicional 30.1</option>
                      <option value="Regata Streetwear">Regata Streetwear</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-[#0A0A0A] mb-1.5">
                      Cor da Camiseta *
                    </label>
                    <select
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-xl bg-[#F7F4EE] border border-[#E6DED2] text-xs font-sans text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] transition cursor-pointer"
                    >
                      <option value="Preto">Preto</option>
                      <option value="Off-White">Off-White</option>
                      <option value="Marrom Cacau">Marrom Cacau</option>
                    </select>
                  </div>

                  {orderType === "INDIVIDUAL" ? (
                    <div>
                      <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-[#0A0A0A] mb-1.5">
                        Tamanho *
                      </label>
                      <select
                        value={size}
                        onChange={(e) => setSize(e.target.value)}
                        className="w-full px-3.5 py-3 rounded-xl bg-[#F7F4EE] border border-[#E6DED2] text-xs font-sans text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] transition cursor-pointer"
                      >
                        <option value="P">P — Pequeno</option>
                        <option value="M">M — Médio</option>
                        <option value="G">G — Street Fit</option>
                        <option value="GG">GG — Extra Grande</option>
                        <option value="XG">XG — Big Size</option>
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-[#0A0A0A] mb-1.5">
                        Qtd. Estimada *
                      </label>
                      <select
                        value={bulkQuantity}
                        onChange={(e) => setBulkQuantity(e.target.value)}
                        className="w-full px-3.5 py-3 rounded-xl bg-[#F7F4EE] border border-[#E6DED2] text-xs font-sans text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] transition cursor-pointer"
                      >
                        <option value="20 a 50">20 a 50 peças</option>
                        <option value="50 a 100">50 a 100 peças</option>
                        <option value="100 a 200">100 a 200 peças</option>
                        <option value="200+">Acima de 200 peças</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Upload da Arte do Cliente */}
                <div>
                  <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-[#0A0A0A] mb-1.5">
                    Envie sua Arte ou Referência (Opcional)
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {customDesignUrl ? (
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F7F4EE] border border-[#E6DED2]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#D5CABE] bg-white shrink-0">
                          <SafeImage
                            src={customDesignUrl}
                            alt="Arte do cliente"
                            className="w-full h-full object-cover"
                            containerClassName="w-full h-full bg-zinc-100 flex items-center justify-center text-zinc-500"
                            iconSize={16}
                          />
                        </div>
                        <div>
                          <p className="font-sans text-xs font-medium text-[#0A0A0A] truncate max-w-[200px]">
                            {designFileName || "Arte enviada"}
                          </p>
                          <span className="text-[10px] text-emerald-600 font-mono flex items-center gap-1">
                            <CheckCircle2 size={11} /> Salvo no Ateliê Cordeiro Ink
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setCustomDesignUrl("");
                          setDesignFileName("");
                        }}
                        className="p-1 rounded-lg text-[#737373] hover:text-[#0A0A0A] transition"
                        title="Remover arquivo"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-[#D5CABE] hover:border-[#0A0A0A] rounded-2xl p-6 text-center cursor-pointer transition-all bg-[#F7F4EE] flex flex-col items-center justify-center gap-2 group"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 size={24} className="animate-spin text-[#0A0A0A]" />
                          <span className="font-sans text-xs text-[#737373] font-mono">
                            Fazendo upload da arte para o ateliê...
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="p-2.5 rounded-full bg-[#E6DED2] text-[#0A0A0A] group-hover:scale-105 transition-transform">
                            <Upload size={18} />
                          </div>
                          <div>
                            <p className="font-sans text-xs font-semibold text-[#0A0A0A]">
                              Clique para anexar sua arte (PNG, JPG, PDF)
                            </p>
                            <p className="font-sans text-[11px] text-[#737373] mt-0.5 font-light">
                              Ou envie depois diretamente pelo WhatsApp
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Observações */}
                <div>
                  <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-[#0A0A0A] mb-1.5">
                    Observações Adicionais (Posição da estampa, detalhes, etc.)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={
                      orderType === "INDIVIDUAL"
                        ? "Ex: Estampa grande nas costas e um logo pequeno no peito esquerdo."
                        : "Ex: Tema da conferência: 'Inabaláveis 2026'. Data prevista do evento: 15 de Novembro."
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F7F4EE] border border-[#E6DED2] text-xs font-sans text-[#0A0A0A] placeholder:text-[#999999] focus:outline-none focus:border-[#0A0A0A] transition"
                  />
                </div>

                {/* Botão de Ação Conforme o Tipo de Pedido */}
                {orderType === "INDIVIDUAL" ? (
                  <div className="space-y-3">
                    <button
                      type="submit"
                      disabled={isPending || isUploading}
                      className="w-full py-4 rounded-full bg-[#0A0A0A] hover:bg-[#222222] text-[#F7F4EE] font-sans text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-xl cursor-pointer disabled:opacity-50"
                    >
                      {isPending ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Preparando Peça...</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={16} />
                          <span>Adicionar ao Carrinho & Calcular Frete (R$ 99,90)</span>
                        </>
                      )}
                    </button>
                    <p className="text-center font-mono text-[11px] text-[#737373]">
                      ✓ Produzida sob demanda em até 2 dias úteis no ateliê.
                    </p>
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={isPending || isUploading}
                    className="w-full py-4 rounded-full bg-[#0A0A0A] hover:bg-[#222222] text-[#F7F4EE] font-sans text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-xl cursor-pointer disabled:opacity-50"
                  >
                    {isPending ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Enviando Orçamento...</span>
                      </>
                    ) : (
                      <>
                        <MessageCircle size={16} />
                        <span>Fazer Orçamento de Lote para Evento</span>
                      </>
                    )}
                  </button>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
