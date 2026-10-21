import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { prisma } from "@/lib/prisma";
import { OrderStatus, TransactionType, TransactionCategory } from "@prisma/client";

/**
 * Webhook oficial do Mercado Pago para notificações de pagamento.
 * Endpoint: POST /api/webhooks/mercadopago
 */
export async function POST(req: NextRequest) {
  try {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

    if (!accessToken) {
      console.warn("[MercadoPago Webhook] MERCADO_PAGO_ACCESS_TOKEN não configurado no ambiente.");
      return NextResponse.json({ received: true, warning: "Missing access token" }, { status: 200 });
    }

    // Leitura dos parâmetros da query string e do body JSON
    const searchParams = req.nextUrl.searchParams;
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Alguns webhooks vêm apenas com query parameters
      body = {};
    }

    // Identificação do evento e do ID do pagamento
    // O Mercado Pago pode enviar { action: 'payment.updated', type: 'payment', data: { id: '...' } }
    // ou { topic: 'payment', id: '...' } ou via query string ?topic=payment&id=...
    const eventType = body?.type || body?.topic || searchParams.get("topic") || searchParams.get("type");
    const paymentId =
      body?.data?.id ||
      body?.id ||
      searchParams.get("data.id") ||
      searchParams.get("id");

    const action = body?.action || "";

    // Filtra apenas eventos do tipo 'payment'
    const isPaymentEvent =
      eventType === "payment" ||
      action.startsWith("payment.") ||
      (!eventType && paymentId);

    if (!isPaymentEvent || !paymentId) {
      // Notificação recebida de outro tópico (ex: merchant_order, chargeback) - confirma recebimento
      return NextResponse.json({ received: true, ignored: true }, { status: 200 });
    }

    // Inicialização do SDK Mercado Pago
    const client = new MercadoPagoConfig({
      accessToken,
      options: { timeout: 10000 },
    });

    const payment = new Payment(client);

    // Consulta os detalhes atualizados do pagamento na API do Mercado Pago
    const paymentData = await payment.get({ id: String(paymentId) });

    if (!paymentData || !paymentData.id) {
      console.warn(`[MercadoPago Webhook] Transação ${paymentId} não foi encontrada na API.`);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const { status, status_detail, payment_method_id, transaction_amount } = paymentData;
    const orderIdentifier =
      paymentData.external_reference ||
      (paymentData.metadata as any)?.order_id ||
      (paymentData.metadata as any)?.order_number;

    console.log(
      `[MercadoPago Webhook] Notificação recebida: Payment ${paymentData.id} | Status: ${status} (${status_detail}) | Ref: ${orderIdentifier}`
    );

    if (orderIdentifier) {
      // Localiza o pedido pelo ID ou pelo OrderNumber (#WPP-..., #CI-...)
      const order = await prisma.order.findFirst({
        where: {
          OR: [
            { id: String(orderIdentifier) },
            { orderNumber: String(orderIdentifier) },
          ],
        },
      });

      if (order) {
        if (status === "approved") {
          // 1. Atualiza o status do pedido para PAGO
          const updatedOrder = await prisma.order.update({
            where: { id: order.id },
            data: {
              status: OrderStatus.PAID,
              paidAt: order.paidAt || new Date(),
              paymentMethod:
                payment_method_id?.toUpperCase() === "PIX"
                  ? "PIX"
                  : payment_method_id?.toUpperCase() || order.paymentMethod,
              notes: `${order.notes ? `${order.notes} | ` : ""}Pago via Mercado Pago (ID: ${paymentData.id})`,
            },
          });

          // 2. Registra a transação financeira de receita se ainda não existir
          const existingTx = await prisma.financialTransaction.findFirst({
            where: { orderId: order.id, type: TransactionType.INCOME },
          });

          if (!existingTx) {
            await prisma.financialTransaction.create({
              data: {
                type: TransactionType.INCOME,
                category: TransactionCategory.SALES_ORDER,
                amount: Number(transaction_amount) || order.totalProducts + order.shippingCost,
                description: `Venda Online ${order.orderNumber} - Mercado Pago (${payment_method_id?.toUpperCase() || "PIX"})`,
                orderId: order.id,
                date: new Date(),
              },
            });
          }

          // 3. Registra na trilha de auditoria
          await prisma.auditLog.create({
            data: {
              action: "WEBHOOK_PAYMENT_APPROVED",
              entity: "ORDER",
              entityId: order.id,
              orderId: order.id,
              details: `Pagamento de R$ ${Number(transaction_amount || 0).toFixed(2)} aprovado via Webhook Mercado Pago (ID: ${paymentData.id}, Status: ${status})`,
            },
          });

          console.log(`[MercadoPago Webhook] Pedido ${order.orderNumber} atualizado com sucesso para PAID.`);
        } else if (status === "cancelled" || status === "refunded" || status === "charged_back") {
          // Atualiza para cancelado se tiver sido cancelado/estornado
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: OrderStatus.CANCELLED,
              cancelledAt: new Date(),
              cancelReason: `Mercado Pago: ${status} (${status_detail})`,
            },
          });

          await prisma.auditLog.create({
            data: {
              action: "WEBHOOK_PAYMENT_CANCELLED",
              entity: "ORDER",
              entityId: order.id,
              orderId: order.id,
              details: `Pedido marcado como cancelado via Webhook Mercado Pago (Status: ${status})`,
            },
          });
        }
      } else {
        console.warn(`[MercadoPago Webhook] Pedido correspondente à ref '${orderIdentifier}' não foi encontrado.`);
      }
    }

    // Sempre responde HTTP 200 com sucesso para o Mercado Pago não reenviar a requisição
    return NextResponse.json({ received: true, status: "processed" }, { status: 200 });
  } catch (error: any) {
    console.error("[MercadoPago Webhook Error]:", error);
    // Retorna 200 mesmo em caso de erro interno para evitar retry storm de webhooks
    return NextResponse.json(
      { received: true, error: error.message || "Erro interno ao processar webhook" },
      { status: 200 }
    );
  }
}

/**
 * Health check para verificação do webhook na plataforma do Mercado Pago.
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "Cordeiro Ink Mercado Pago Webhook",
    timestamp: new Date().toISOString(),
  });
}
