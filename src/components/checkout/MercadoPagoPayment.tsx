"use client";

import { useEffect, useState } from "react";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";
import {
  CheckCircle2,
  Copy,
  Check,
  QrCode,
  ShieldCheck,
  AlertCircle,
  Loader2,
  ArrowRight,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

export interface MercadoPagoPaymentResult {
  id: string | number;
  status: string;
  status_detail?: string;
  payment_method_id?: string;
  transaction_amount?: number;
  point_of_interaction?: {
    transaction_data?: {
      qr_code?: string;
      qr_code_base64?: string;
      ticket_url?: string;
    };
  };
  orderId?: string | null;
  orderNumber?: string | null;
}

export interface MercadoPagoPaymentProps {
  /**
   * Valor total da transação em Reais (R$).
   */
  amount: number;
  /**
   * ID do pedido gerado no banco de dados (se houver).
   */
  orderId?: string;
  /**
   * Código legível do pedido (ex: #WPP-1049, #CI-1002).
   */
  orderNumber?: string;
  /**
   * E-mail do cliente (pré-preenchimento no Brick).
   */
  payerEmail?: string;
  /**
   * Alias para payerEmail
   */
  customerEmail?: string;
  /**
   * Nome do cliente.
   */
  payerName?: string;
  /**
   * Descrição opcional exibida no extrato do cartão.
   */
  description?: string;
  /**
   * Callback invocado quando o pagamento for aprovado (cartão).
   */
  onSuccess?: (result: MercadoPagoPaymentResult) => void;
  /**
   * Callback invocado em caso de erro na transação.
   */
  onError?: (error: any) => void;
  /**
   * Callback de cancelamento ou fechamento.
   */
  onCancel?: () => void;
}

export function MercadoPagoPayment({
  amount,
  orderId,
  orderNumber,
  payerEmail,
  customerEmail,
  payerName,
  description,
  onSuccess,
  onError,
  onCancel,
}: MercadoPagoPaymentProps) {
  const [isSdkInitialized, setIsSdkInitialized] = useState(false);
  const [isBrickReady, setIsBrickReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentResult, setPaymentResult] = useState<MercadoPagoPaymentResult | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const effectiveEmail = payerEmail || customerEmail || "";

  // Suporte a chaves de produção ou homologação sem fallback destrutivo
  const publicKey =
    process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY ||
    "TEST-4c19dc2d-884a-45ba-9a29-292ced213525";

  // 1. Inicializa o SDK oficial do Mercado Pago no cliente
  useEffect(() => {
    if (publicKey && typeof window !== "undefined") {
      try {
        initMercadoPago(publicKey, { locale: "pt-BR" });
        setIsSdkInitialized(true);
      } catch (err) {
        console.error("[MercadoPagoPayment] Falha ao inicializar SDK:", err);
      }
    }
  }, [publicKey]);

  // Função para copiar o código Pix Copia e Cola
  const handleCopyPix = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedPix(true);
      toast.success("Código Pix Copia e Cola copiado com sucesso!");
      setTimeout(() => setCopiedPix(false), 3000);
    } catch {
      toast.error("Não foi possível copiar o código Pix automaticamente.");
    }
  };

  // 2. Callback de envio do Payment Brick para o backend
  const handleSubmit = async (param: any) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formData: param.formData,
          orderId,
          orderNumber,
          description: description || `Cordeiro Ink - Pedido ${orderNumber || ""}`.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const errorText =
          data.error ||
          "Não foi possível processar o pagamento. Verifique os dados digitados e tente novamente.";
        setErrorMessage(errorText);
        toast.error(errorText);
        onError?.(data);
        return;
      }

      setPaymentResult(data);

      if (data.status === "approved") {
        toast.success("Pagamento aprovado com sucesso! Deus abençoe sua compra.");
        // Apenas chamamos onSuccess para pagamentos imediatamente aprovados (cartão)
        onSuccess?.(data);
      } else if (data.status === "pending") {
        toast.info("Código Pix gerado! Escaneie o QR Code ou utilize o código Copia e Cola.");
        // Pagamento Pix: NÃO executa redirecionamento automático ou fechamento
      }
    } catch (error: any) {
      console.error("[MercadoPagoPayment] Erro no envio:", error);
      const msg = error.message || "Erro de conexão ao processar o pagamento.";
      setErrorMessage(msg);
      toast.error(msg);
      onError?.(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // TELA DE SUCESSO / CONFIRMAÇÃO IMEDIATA (CARTÃO DE CRÉDITO OU DÉBITO APROVADO)
  // =========================================================================
  if (paymentResult && paymentResult.status === "approved") {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-zinc-950 p-6 text-zinc-100 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto">
            <CheckCircle2 size={36} className="animate-in zoom-in" />
          </div>
          <h3 className="font-serif text-2xl font-bold tracking-tight text-white">
            Pagamento Aprovado!
          </h3>
          <p className="text-sm text-zinc-400 max-w-sm mx-auto">
            Seu pedido foi confirmado com sucesso e já está pronto para a fila de confecção artesanal.
          </p>
        </div>

        <div className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800/80 space-y-2.5 text-xs">
          <div className="flex justify-between items-center text-zinc-400">
            <span>Identificador da Transação</span>
            <span className="font-mono text-zinc-200">#{paymentResult.id}</span>
          </div>
          {orderNumber && (
            <div className="flex justify-between items-center text-zinc-400">
              <span>Número do Pedido</span>
              <span className="font-mono font-bold text-white">{orderNumber}</span>
            </div>
          )}
          <div className="flex justify-between items-center text-zinc-400">
            <span>Método de Pagamento</span>
            <span className="uppercase font-semibold text-emerald-400">
              {paymentResult.payment_method_id || "Cartão"}
            </span>
          </div>
          <div className="pt-2 border-t border-zinc-800 flex justify-between items-center font-bold text-sm">
            <span className="text-zinc-300">Total Pago</span>
            <span className="font-mono text-emerald-400 text-base">
              {formatCurrency(paymentResult.transaction_amount || amount)}
            </span>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs uppercase tracking-widest font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/50"
          >
            <span>Concluir e Voltar à Loja</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>Ambiente Seguro Cordeiro Ink & Mercado Pago</span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // TELA DE PAGAMENTO PENDENTE (PIX QR CODE & COPIA E COLA)
  // =========================================================================
  if (paymentResult && paymentResult.status === "pending") {
    const transactionData = paymentResult.point_of_interaction?.transaction_data;
    const qrCode = transactionData?.qr_code;
    const qrCodeBase64 = transactionData?.qr_code_base64;
    const ticketUrl = transactionData?.ticket_url;

    return (
      <div className="rounded-2xl border border-amber-500/30 bg-zinc-950 p-6 text-zinc-100 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto">
            <QrCode size={28} />
          </div>
          <h3 className="font-serif text-2xl font-bold tracking-tight text-white">
            Pague via Pix
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Abra o app do seu banco, escolha a opção <strong className="text-zinc-200">Pix</strong> e escaneie o código abaixo ou copie o código Copia e Cola.
          </p>
        </div>

        {/* Imagem do QR Code Pix */}
        {qrCodeBase64 ? (
          <div className="flex flex-col items-center justify-center">
            <div className="p-3 bg-white rounded-2xl shadow-lg border border-zinc-300">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`data:image/png;base64,${qrCodeBase64}`}
                alt="QR Code Pix Mercado Pago"
                className="w-48 h-48 object-contain"
              />
            </div>
            <span className="text-[11px] text-zinc-400 mt-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Aguardando confirmação bancária em tempo real...
            </span>
          </div>
        ) : null}

        {/* Campo Copia e Cola */}
        {qrCode && (
          <div className="space-y-2">
            <label className="block text-[11px] font-sans font-semibold text-zinc-300 uppercase tracking-wider">
              Código Pix Copia e Cola
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={qrCode}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-zinc-300 focus:outline-none select-all truncate"
              />
              <button
                type="button"
                onClick={() => handleCopyPix(qrCode)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-sans text-xs font-semibold flex items-center gap-1.5 transition shrink-0 cursor-pointer border border-zinc-700"
              >
                {copiedPix ? (
                  <>
                    <Check size={14} className="text-emerald-400" />
                    <span className="text-emerald-400">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Resumo do Pedido */}
        <div className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800/80 space-y-2 text-xs">
          <div className="flex justify-between items-center text-zinc-400">
            <span>Valor a Pagar</span>
            <span className="font-mono font-bold text-white text-sm">
              {formatCurrency(paymentResult.transaction_amount || amount)}
            </span>
          </div>
          {orderNumber && (
            <div className="flex justify-between items-center text-zinc-400">
              <span>Pedido</span>
              <span className="font-mono text-zinc-300">{orderNumber}</span>
            </div>
          )}
          {ticketUrl && (
            <div className="pt-2 border-t border-zinc-800 flex justify-between items-center">
              <span className="text-zinc-400">Comprovante de pagamento</span>
              <a
                href={ticketUrl}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px]"
              >
                Ver comprovante <ExternalLink size={12} />
              </a>
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-sans text-xs uppercase tracking-wider font-semibold transition cursor-pointer border border-zinc-800 text-center"
          >
            Fechar Janela
          </button>
          <button
            type="button"
            onClick={() => {
              toast.info("Verificando compensação bancária...");
              window.location.reload();
            }}
            className="py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-sans text-xs uppercase tracking-wider font-semibold transition cursor-pointer border border-zinc-700 flex items-center gap-1.5"
            title="Atualizar Status"
          >
            <RefreshCw size={14} />
            <span>Já paguei</span>
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>Após o pagamento, o pedido entra em produção automaticamente.</span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDERIZAÇÃO DO FORMULÁRIO DO PAYMENT BRICK OFICIAL
  // =========================================================================
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6 text-zinc-100 shadow-xl space-y-4">
      {/* Cabeçalho do Bloco de Pagamento */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div>
          <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck size={13} />
            Checkout Transparente Seguro
          </span>
          <h4 className="font-serif text-lg font-bold text-white mt-0.5">
            Pague com Pix ou Cartão
          </h4>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-zinc-400 block">Total</span>
          <span className="font-mono text-base font-bold text-white">
            {formatCurrency(amount)}
          </span>
        </div>
      </div>

      {/* Alerta de Erro se houver */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-start gap-2.5">
          <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="block font-semibold">Atenção no pagamento:</strong>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Loader visual enquanto o Brick carrega */}
      {(!isSdkInitialized || !isBrickReady) && (
        <div className="py-12 flex flex-col items-center justify-center gap-3 text-zinc-400">
          <Loader2 size={24} className="animate-spin text-emerald-400" />
          <span className="text-xs font-sans tracking-wide">
            Carregando opções seguras de pagamento Mercado Pago...
          </span>
        </div>
      )}

      {/* Container do Brick Oficial */}
      {isSdkInitialized && (
        <div className={!isBrickReady ? "hidden" : "block transition-all"}>
          <Payment
            initialization={{
              amount: Number(amount) || 1,
              payer: {
                email: effectiveEmail || undefined,
              },
            }}
            customization={{
              paymentMethods: {
                bankTransfer: "all", // Pix
                creditCard: "all",
                debitCard: "all",
              },
              visual: {
                style: {
                  theme: "dark",
                  customVariables: {
                    baseColor: "#ffffff",
                    formBackgroundColor: "#09090b",
                    inputBackgroundColor: "#18181b",
                    textPrimaryColor: "#f4f4f5",
                    textSecondaryColor: "#a1a1aa",
                    errorColor: "#ef4444",
                    successColor: "#10b981",
                    borderRadiusSmall: "8px",
                    borderRadiusMedium: "12px",
                  },
                },
              },
            }}
            onSubmit={handleSubmit}
            onReady={() => setIsBrickReady(true)}
            onError={(error) => {
              console.error("[MercadoPago Brick Error]:", error);
              setIsBrickReady(true);
            }}
          />
        </div>
      )}

      {/* Indicador de processamento */}
      {isSubmitting && (
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center gap-3 text-zinc-300 text-xs">
          <Loader2 size={18} className="animate-spin text-emerald-400" />
          <span>Processando transação com segurança... Não feche a página.</span>
        </div>
      )}

      {/* Rodapé de Segurança */}
      <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-500 border-t border-zinc-900">
        <span className="flex items-center gap-1">
          <ShieldCheck size={13} className="text-emerald-500" />
          Criptografia SSL ponta a ponta
        </span>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="text-zinc-400 hover:text-white underline cursor-pointer disabled:opacity-50"
          >
            Cancelar ou voltar
          </button>
        )}
      </div>
    </div>
  );
}
