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
  CreditCard,
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
  amount: number;
  orderId?: string;
  orderNumber?: string;
  payerEmail?: string;
  customerEmail?: string;
  payerName?: string;
  description?: string;
  onSuccess?: (result: MercadoPagoPaymentResult) => void;
  onError?: (error: any) => void;
  onCancel?: () => void;
}

function getCardErrorMessage(statusDetail?: string): string {
  switch (statusDetail) {
    case "cc_rejected_bad_filled_security_code":
      return "O código de segurança (CVV) do cartão está incorreto.";
    case "cc_rejected_bad_filled_date":
      return "A data de validade do cartão está incorreta ou vencida.";
    case "cc_rejected_bad_filled_other":
      return "Os dados do cartão estão incorretos. Revise o número e o nome do titular.";
    case "cc_rejected_insufficient_amount":
      return "Saldo ou limite insuficiente no cartão para completar esta compra.";
    case "cc_rejected_call_for_authorize":
      return "Pagamento não autorizado pelo banco emissor. Ligue para a administradora do seu cartão para liberar compras online.";
    case "cc_rejected_card_disabled":
      return "O cartão utilizado está bloqueado ou inativo. Use outro cartão ou finalize via Pix.";
    case "cc_rejected_duplicated_payment":
      return "Pagamento duplicado detectado para esta operação.";
    case "cc_rejected_high_risk":
      return "A operadora do cartão recusou a transação por políticas de segurança. Recomendamos pagar instantaneamente via Pix.";
    case "cc_rejected_max_attempts":
      return "Você atingiu o limite de tentativas com este cartão. Tente outro cartão ou Pix.";
    default:
      return "O pagamento com cartão não foi autorizado pelo banco ou operadora. Verifique os dados digitados ou tente outro meio de pagamento.";
  }
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
  const [isPixPaid, setIsPixPaid] = useState(false);
  const [paidOrderNumber, setPaidOrderNumber] = useState<string | null>(orderNumber || null);
  const [isCheckingManual, setIsCheckingManual] = useState(false);

  const effectiveEmail = (payerEmail || customerEmail || "").trim();

  // Carrega estritamente a chave pública oficial do ambiente
  const publicKey = process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY?.trim();

  // 1. Inicializa o SDK oficial do Mercado Pago no cliente
  useEffect(() => {
    if (!publicKey) {
      console.error(
        "[MercadoPagoPayment] Chave pública NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY não está definida no ambiente."
      );
      setErrorMessage(
        "Chave pública do Mercado Pago não configurada no ambiente. Não é possível iniciar o pagamento."
      );
      return;
    }

    if (typeof window !== "undefined") {
      try {
        initMercadoPago(publicKey, { locale: "pt-BR" });
        setIsSdkInitialized(true);
      } catch (err) {
        console.error("[MercadoPagoPayment] Falha ao inicializar SDK:", err);
        setErrorMessage("Falha ao inicializar o gateway de pagamento Mercado Pago.");
      }
    }
  }, [publicKey]);

  // Polling em tempo real checando status do pedido quando pendente (ex: Pix)
  useEffect(() => {
    const targetId = orderId || paymentResult?.orderId || orderNumber || paymentResult?.orderNumber;
    if (!paymentResult || paymentResult.status !== "pending" || !targetId || isPixPaid) {
      return;
    }

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(targetId)}/status`, {
          cache: "no-store",
        });
        if (!res.ok) return;

        const data = await res.json();
        if (data.success && data.isPaid && isMounted) {
          clearInterval(interval);
          setIsPixPaid(true);
          if (data.orderNumber) setPaidOrderNumber(data.orderNumber);
          toast.success("Pagamento confirmado com sucesso!");
          onSuccess?.({
            id: paymentResult?.id || targetId,
            status: "approved",
            status_detail: "accredited",
            point_of_interaction: paymentResult?.point_of_interaction,
            orderId: orderId || paymentResult?.orderId || null,
            orderNumber: data.orderNumber || orderNumber || paymentResult?.orderNumber || null,
            transaction_amount: paymentResult?.transaction_amount || amount,
          });
        }
      } catch {
        // Polling silencioso
      }
    }, 3500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [orderId, orderNumber, paymentResult, isPixPaid, amount, onSuccess]);

  // Verificação manual de status
  const handleManualCheckStatus = async () => {
    const targetId = orderId || paymentResult?.orderId || orderNumber || paymentResult?.orderNumber;
    if (!targetId) return;

    setIsCheckingManual(true);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(targetId)}/status`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.success && data.isPaid) {
        setIsPixPaid(true);
        if (data.orderNumber) setPaidOrderNumber(data.orderNumber);
        toast.success("Pagamento confirmado com sucesso!");
        onSuccess?.({
          id: paymentResult?.id || targetId,
          status: "approved",
          status_detail: "accredited",
          point_of_interaction: paymentResult?.point_of_interaction,
          orderId: orderId || paymentResult?.orderId || null,
          orderNumber: data.orderNumber || orderNumber || paymentResult?.orderNumber || null,
          transaction_amount: paymentResult?.transaction_amount || amount,
        });
      } else {
        toast.info("Aguardando confirmação bancária. O sistema está verificando automaticamente.");
      }
    } catch {
      toast.error("Erro ao verificar status. Tente novamente.");
    } finally {
      setIsCheckingManual(false);
    }
  };

  // Copiar código Pix Copia e Cola
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

  // Callback de envio do Payment Brick para o backend
  const handleSubmit = async (param: any) => {
    if (isSubmitting) return;
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
        onSuccess?.(data);
      } else if (data.status === "pending") {
        toast.info("Código Pix gerado! Escaneie o QR Code ou utilize o código Copia e Cola.");
      } else if (data.status === "in_process") {
        toast.info("Pagamento em análise pelo Mercado Pago.");
      } else if (data.status === "rejected") {
        const errorReason = getCardErrorMessage(data.status_detail);
        toast.error(`Pagamento não aprovado: ${errorReason}`);
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
  // 1. TELA DE SUCESSO IMEDIATO (CARTÃO DE CRÉDITO APROVADO)
  // =========================================================================
  if (paymentResult && paymentResult.status === "approved") {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-zinc-950 p-6 text-zinc-100 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
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
              {paymentResult.payment_method_id || "Cartão de Crédito"}
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
  // 2. TELA DE RECUSA DE PAGAMENTO (CARTÃO RECUSADO) COM OPÇÃO DE RETENTATIVA
  // =========================================================================
  if (paymentResult && paymentResult.status === "rejected") {
    const errorExplanation = getCardErrorMessage(paymentResult.status_detail);

    return (
      <div className="rounded-2xl border border-red-500/30 bg-zinc-950 p-6 text-zinc-100 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mx-auto">
            <AlertCircle size={36} />
          </div>
          <h3 className="font-serif text-2xl font-bold tracking-tight text-white">
            Pagamento não Aprovado
          </h3>
          <p className="text-sm text-red-300/90 max-w-sm mx-auto leading-relaxed">
            {errorExplanation}
          </p>
        </div>

        <div className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800/80 space-y-2.5 text-xs">
          <div className="flex justify-between items-center text-zinc-400">
            <span>Motivo Informado</span>
            <span className="font-mono text-red-400 uppercase text-[11px]">
              {paymentResult.status_detail || "Operação Recusada"}
            </span>
          </div>
          <div className="flex justify-between items-center text-zinc-400">
            <span>Valor da Tentativa</span>
            <span className="font-mono text-zinc-200">
              {formatCurrency(paymentResult.transaction_amount || amount)}
            </span>
          </div>
          <div className="pt-2 border-t border-zinc-800 text-zinc-400 text-[11px] leading-relaxed">
            💡 <strong>Dica:</strong> Você pode conferir os números digitados, usar outro cartão ou pagar via <strong>Pix</strong> com aprovação imediata.
          </div>
        </div>

        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            onClick={() => {
              setPaymentResult(null);
              setErrorMessage(null);
            }}
            className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-sans text-xs uppercase tracking-widest font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-950/30"
          >
            <RefreshCw size={14} />
            <span>Tentar Novamente ou Trocar Cartão / Pix</span>
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white font-sans text-xs uppercase tracking-wider transition cursor-pointer"
            >
              Cancelar
            </button>
          )}
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
          <ShieldCheck size={14} className="text-zinc-500" />
          <span>Nenhuma cobrança foi efetuada no seu cartão.</span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. TELA DE PAGAMENTO EM ANÁLISE (CARTÃO EM VERIFICAÇÃO ANTIFRAUDE)
  // =========================================================================
  if (paymentResult && paymentResult.status === "in_process") {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-zinc-950 p-6 text-zinc-100 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto">
            <Loader2 size={36} className="animate-spin" />
          </div>
          <h3 className="font-serif text-2xl font-bold tracking-tight text-white">
            Pagamento em Análise
          </h3>
          <p className="text-sm text-zinc-300 max-w-sm mx-auto leading-relaxed">
            Seu cartão está passando pela verificação de segurança do Mercado Pago. Seu pedido já está reservado no ateliê.
          </p>
        </div>

        <div className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800/80 space-y-2.5 text-xs">
          <div className="flex justify-between items-center text-zinc-400">
            <span>Status</span>
            <span className="font-mono text-amber-400 font-bold">EM PROCESSAMENTO</span>
          </div>
          {orderNumber && (
            <div className="flex justify-between items-center text-zinc-400">
              <span>Número do Pedido</span>
              <span className="font-mono text-white font-bold">{orderNumber}</span>
            </div>
          )}
          <div className="flex justify-between items-center text-zinc-400">
            <span>Total da Operação</span>
            <span className="font-mono text-zinc-200">
              {formatCurrency(paymentResult.transaction_amount || amount)}
            </span>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-3.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-sans text-xs uppercase tracking-widest font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            <span>Concluir e Acompanhar Pedido</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. TELA DE SUCESSO PIX CONFIRMADO EM TEMPO REAL
  // =========================================================================
  if (isPixPaid) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-zinc-950 p-6 text-zinc-100 shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto shadow-lg shadow-emerald-500/10">
            <CheckCircle2 size={36} className="text-emerald-400 animate-in zoom-in duration-300" />
          </div>
          <h3 className="font-serif text-2xl font-bold tracking-tight text-white">
            Pagamento Confirmado!
          </h3>
          <p className="text-sm text-zinc-300 max-w-sm mx-auto font-light">
            Seu Pix foi compensado com sucesso. O pedido já entrou na <strong className="text-emerald-400 font-semibold">fila de produção artesanal</strong> do ateliê!
          </p>
        </div>

        <div className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800/80 space-y-2.5 text-xs">
          <div className="flex justify-between items-center text-zinc-400">
            <span>Status da Operação</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold uppercase tracking-wider text-[10px] border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Aprovado / Pago
            </span>
          </div>

          {(paidOrderNumber || orderNumber) && (
            <div className="flex justify-between items-center text-zinc-400">
              <span>Número do Pedido</span>
              <span className="font-mono font-bold text-white text-sm">
                {paidOrderNumber || orderNumber}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center text-zinc-400">
            <span>Método de Pagamento</span>
            <span className="font-semibold text-emerald-400">
              Pix (Mercado Pago)
            </span>
          </div>

          <div className="pt-2 border-t border-zinc-800 flex justify-between items-center font-bold text-sm">
            <span className="text-zinc-300">Total Pago</span>
            <span className="font-mono text-emerald-400 text-base">
              {formatCurrency(paymentResult?.transaction_amount || amount)}
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
  // 5. TELA DE PAGAMENTO PENDENTE (PIX QR CODE & COPIA E COLA)
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
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
              <span>Código Copia e Cola</span>
              {copiedPix && (
                <span className="text-emerald-400 text-[11px] flex items-center gap-1">
                  <Check size={12} /> Copiado!
                </span>
              )}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={qrCode}
                className="flex-1 px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 truncate focus:outline-none select-all"
              />
              <button
                type="button"
                onClick={() => handleCopyPix(qrCode)}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
              >
                {copiedPix ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedPix ? "Copiado" : "Copiar"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Informações de Pedido */}
        <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1 text-xs">
          <div className="flex justify-between text-zinc-400">
            <span>Valor Total</span>
            <span className="font-mono text-white font-bold">
              {formatCurrency(paymentResult.transaction_amount || amount)}
            </span>
          </div>
          {orderNumber && (
            <div className="flex justify-between text-zinc-400">
              <span>Número do Pedido</span>
              <span className="font-mono text-white">{orderNumber}</span>
            </div>
          )}
          {ticketUrl && (
            <div className="pt-1 flex justify-end">
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
            onClick={handleManualCheckStatus}
            disabled={isCheckingManual}
            className="py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-sans text-xs uppercase tracking-wider font-semibold transition cursor-pointer border border-zinc-700 flex items-center gap-1.5 disabled:opacity-50"
            title="Atualizar Status"
          >
            <RefreshCw size={14} className={isCheckingManual ? "animate-spin" : ""} />
            <span>{isCheckingManual ? "Checando..." : "Já paguei"}</span>
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
  // 6. RENDERIZAÇÃO DO FORMULÁRIO DO PAYMENT BRICK OFICIAL (CARTÃO + PIX)
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
            Pague com Cartão ou Pix
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
      {(!isSdkInitialized || !isBrickReady) && !errorMessage && (
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
                creditCard: "all",   // Cartão de Crédito Totalmente Ativo
                debitCard: "all",    // Cartão de Débito
                maxInstallments: 12,
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
