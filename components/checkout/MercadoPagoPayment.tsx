"use client";

import React, { useEffect, useState } from "react";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";

interface MercadoPagoPaymentProps {
  amount: number;
  orderId?: string;
  orderNumber?: string;
  customerEmail?: string;
  onSuccess?: (paymentId: string | number) => void;
  onError?: (error: string) => void;
}

export default function MercadoPagoPayment({
  amount,
  orderId,
  orderNumber,
  customerEmail,
  onSuccess,
  onError,
}: MercadoPagoPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState<{
    qrCodeBase64?: string;
    qrCode?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY;
    if (publicKey) {
      initMercadoPago(publicKey, { locale: "pt-BR" });
    } else {
      console.error("[MercadoPago] NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY não configurada.");
    }
  }, []);

  const safeAmount = Number(parseFloat(String(amount || 0)).toFixed(2));

  const initialization = {
    amount: safeAmount > 0 ? safeAmount : 1.0,
    payer: {
      email: customerEmail || "",
    },
  };

  const customization = {
    paymentMethods: {
      ticket: "all",
      bankTransfer: ["pix"],
      creditCard: "all",
      debitCard: "all",
    },
    visual: {
      style: {
        theme: "dark" as const,
      },
    },
  };

  const handleCopyPix = () => {
    if (pixData?.qrCode) {
      navigator.clipboard.writeText(pixData.qrCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const onSubmit = async ({ formData }: any) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formData: {
            ...formData,
            transaction_amount: safeAmount,
          },
          orderId,
          orderNumber,
          description: `Pedido ${orderNumber || orderId || "Cordeiro Ink"}`,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Erro ao processar o pagamento.");
      }

      // Se for Pix, armazena os dados na tela e NÃO redireciona
      if (
        data.payment_method_id === "pix" &&
        data.point_of_interaction?.transaction_data
      ) {
        const txData = data.point_of_interaction.transaction_data;
        console.log("[Pix Debug] Dados recebidos com sucesso:", txData);

        setPixData({
          qrCodeBase64: txData.qr_code_base64,
          qrCode: txData.qr_code,
        });

        // Impede que onSuccess redirecione ou feche a tela antes do cliente pagar
        return;
      }

      // Para Cartão de Crédito/Débito, chama o callback de sucesso
      if (onSuccess) {
        onSuccess(data.id);
      }
    } catch (err: any) {
      const msg = err.message || "Falha na comunicação com o Mercado Pago.";
      setErrorMessage(msg);
      if (onError) onError(msg);
    } finally {
      setLoading(false);
    }
  };

  // TELA DO PIX (Renderiza assim que os dados chegam da API)
  if (pixData) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-zinc-950 border border-zinc-800 rounded-xl text-white space-y-5 my-4 shadow-xl">
        <div className="text-center space-y-1">
          <span className="inline-block px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-semibold rounded-full uppercase tracking-wider">
            Pix Gerado com Sucesso
          </span>
          <h3 className="text-xl font-bold pt-2">Escaneie o QR Code</h3>
          <p className="text-xs text-zinc-400 max-w-sm">
            Abra o aplicativo do seu banco, escolha pagar via Pix com QR Code e aponte a câmera.
          </p>
        </div>

        {pixData.qrCodeBase64 && (
          <div className="p-3 bg-white rounded-lg shadow-inner">
            <img
              src={`data:image/png;base64,${pixData.qrCodeBase64}`}
              alt="QR Code Pix"
              className="w-52 h-52 object-contain"
            />
          </div>
        )}

        {pixData.qrCode && (
          <div className="w-full space-y-2">
            <label className="text-xs text-zinc-400 font-medium">
              Ou utilize o código Copia e Cola:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={pixData.qrCode}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-xs font-mono text-zinc-300 focus:outline-none select-all"
              />
              <button
                type="button"
                onClick={handleCopyPix}
                className="bg-zinc-100 hover:bg-white text-zinc-900 font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap"
              >
                {copied ? "Copiado!" : "Copiar"}
              </button>
            </div>
          </div>
        )}

        <p className="text-[11px] text-zinc-500 text-center">
          Assim que o pagamento for detectado, o status do seu pedido será atualizado automaticamente.
        </p>
      </div>
    );
  }

  // TELA INICIAL (Formulário do Mercado Pago Brick)
  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      {errorMessage && (
        <div className="p-3 bg-red-950/50 border border-red-800 text-red-300 text-sm rounded-lg">
          {errorMessage}
        </div>
      )}

      {loading && (
        <div className="text-center py-3 text-sm text-zinc-400 animate-pulse font-medium">
          Processando pagamento com o Mercado Pago...
        </div>
      )}

      <Payment
        initialization={initialization}
        customization={customization}
        onSubmit={onSubmit}
        onError={(err) => {
          console.error("[Payment Brick Error]:", err);
          setErrorMessage("Erro ao carregar o meio de pagamento.");
        }}
      />
    </div>
  );
}