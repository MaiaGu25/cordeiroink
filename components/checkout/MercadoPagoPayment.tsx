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

      // Se for Pix, recupera os dados para renderizar QR Code e Copia e Cola
      if (
        data.payment_method_id === "pix" &&
        data.point_of_interaction?.transaction_data
      ) {
        const txData = data.point_of_interaction.transaction_data;
        setPixData({
          qrCodeBase64: txData.qr_code_base64,
          qrCode: txData.qr_code,
        });
      }

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

  if (pixData) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-zinc-900 border border-zinc-800 rounded-lg text-white space-y-4">
        <h3 className="text-xl font-bold text-green-400">Pague via Pix</h3>
        <p className="text-sm text-zinc-400 text-center">
          Escaneie o QR Code abaixo pelo aplicativo do seu banco:
        </p>

        {pixData.qrCodeBase64 && (
          <img
            src={`data:image/png;base64,${pixData.qrCodeBase64}`}
            alt="QR Code Pix"
            className="w-56 h-56 rounded-md border border-zinc-700 bg-white p-2"
          />
        )}

        {pixData.qrCode && (
          <div className="w-full space-y-2">
            <label className="text-xs text-zinc-400">Código Copia e Cola:</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={pixData.qrCode}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs font-mono text-zinc-300 select-all"
              />
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(pixData.qrCode!)}
                className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs px-3 py-2 rounded transition-colors whitespace-nowrap"
              >
                Copiar
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      {errorMessage && (
        <div className="p-3 bg-red-950/50 border border-red-800 text-red-300 text-sm rounded">
          {errorMessage}
        </div>
      )}

      {loading && (
        <div className="text-center py-2 text-sm text-zinc-400 animate-pulse">
          Processando pagamento...
        </div>
      )}

      <Payment
        initialization={initialization}
        customization={customization}
        onSubmit={onSubmit}
        onError={(err) => {
          console.error("[Payment Brick Error]:", err);
          setErrorMessage("Erro interno no formulário de pagamento.");
        }}
      />
    </div>
  );
}