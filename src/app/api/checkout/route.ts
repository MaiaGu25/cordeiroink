import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { prisma } from "@/lib/prisma";
import { OrderStatus, TransactionType, TransactionCategory } from "@prisma/client";

/**
 * Interface do payload enviado pelo componente Payment Brick do frontend.
 */
interface CheckoutRequestBody {
  formData: {
    token?: string;
    issuer_id?: string | number;
    payment_method_id: string;
    transaction_amount: number;
    installments?: number;
    payer: {
      email: string;
      first_name?: string;
      last_name?: string;
      identification?: {
        type: string;
        number: string;
      };
    };
  };
  orderId?: string;
  orderNumber?: string;
  description?: string;
}

export async function POST(req: NextRequest) {
  try {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

    if (!accessToken) {
      console.error("[MercadoPago] MERCADO_PAGO_ACCESS_TOKEN não está definido no .env");
      return NextResponse.json(
        {
          success: false,
          error: "Credenciais do Mercado Pago não configuradas no servidor.",
        },
        { status: 500 }
      );
    }

    const body: CheckoutRequestBody = await req.json();

    // 1. Validação estrita do payload recebido do Brick
    if (!body || !body.formData) {
      return NextResponse.json(
        {
          success: false,
          error: "Dados do formulário de pagamento (formData) não informados.",
        },
        { status: 400 }
      );
    }

    const { formData, orderId, orderNumber, description } = body;
    const { transaction_amount, payment_method_id, payer, token, installments, issuer_id } =
      formData;

    if (!transaction_amount || Number(transaction_amount) <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Valor da transação inválido (deve ser maior que zero).",
        },
        { status: 400 }
      );
    }

    if (!payment_method_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Método de pagamento (payment_method_id) não selecionado.",
        },
        { status: 400 }
      );
    }

    if (!payer?.email) {
      return NextResponse.json(
        {
          success: false,
          error: "E-mail do pagador é obrigatório para processar o pagamento.",
        },
        { status: 400 }
      );
    }

    // 2. Inicialização do SDK do Mercado Pago
    const client = new MercadoPagoConfig({
      accessToken,
      options: {
        timeout: 10000,
      },
    });

    const payment = new Payment(client);

    // 3. Montagem do payload oficial para payment.create()
    const paymentDescription =
      description ||
      `Cordeiro Ink - Pedido ${orderNumber || orderId || "Ateliê"}`.trim();

    const paymentPayload: any = {
      transaction_amount: Number(transaction_amount),
      description: paymentDescription,
      payment_method_id,
      payer: {
        email: payer.email,
        first_name: payer.first_name,
        last_name: payer.last_name,
        identification: payer.identification?.number
          ? {
              type: payer.identification.type || "CPF",
              number: payer.identification.number.replace(/\D/g, ""),
            }
          : undefined,
      },
      external_reference: orderId || orderNumber || undefined,
      metadata: {
        order_id: orderId || null,
        order_number: orderNumber || null,
      },
    };

    // Campos específicos para Cartão de Crédito / Débito
    if (token) {
      paymentPayload.token = token;
      paymentPayload.installments = installments ? Number(installments) : 1;
      if (issuer_id) {
        paymentPayload.issuer_id = Number(issuer_id);
      }
    }

    // Adiciona webhook notification_url se configurado
    if (process.env.MERCADO_PAGO_WEBHOOK_URL) {
      paymentPayload.notification_url = process.env.MERCADO_PAGO_WEBHOOK_URL;
    }

    // 4. Executa a criação do pagamento no Mercado Pago
    const response = await payment.create({
      body: paymentPayload,
    });

    const status = response.status; // 'approved' | 'pending' | 'in_process' | 'rejected'
    const statusDetail = response.status_detail;
    const paymentId = response.id;
    const pointOfInteraction = response.point_of_interaction;

    // 5. Se o pedido já existir no banco, atualiza status e método de pagamento
    if (orderId) {
      try {
        const order = await prisma.order.findUnique({
          where: { id: orderId },
        });

        if (order) {
          const isApproved = status === "approved";
          const methodUpper = payment_method_id.toUpperCase();

          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: isApproved ? OrderStatus.PAID : OrderStatus.PENDING,
              paidAt: isApproved ? new Date() : null,
              paymentMethod:
                payment_method_id === "pix"
                  ? "PIX"
                  : methodUpper.includes("DEBIT")
                  ? "CARTAO_DEBITO"
                  : "CARTAO_CREDITO",
              notes: `${order.notes ? `${order.notes} | ` : ""}Mercado Pago ID: ${paymentId} (${status})`,
            },
          });

          // Se o pagamento foi aprovado imediatamente (ex: cartão), registra a transação financeira
          if (isApproved) {
            const existingTx = await prisma.financialTransaction.findFirst({
              where: { orderId: order.id, type: TransactionType.INCOME },
            });

            if (!existingTx) {
              await prisma.financialTransaction.create({
                data: {
                  type: TransactionType.INCOME,
                  category: TransactionCategory.SALES_ORDER,
                  amount: Number(transaction_amount),
                  description: `Recebimento Pedido ${order.orderNumber} via Mercado Pago (${methodUpper})`,
                  orderId: order.id,
                  date: new Date(),
                },
              });
            }

            await prisma.auditLog.create({
              data: {
                action: "ORDER_PAID_MERCADOPAGO",
                entity: "ORDER",
                entityId: order.id,
                orderId: order.id,
                details: `Pagamento aprovado instantaneamente via Mercado Pago (ID: ${paymentId}, Status: ${status})`,
              },
            });
          }
        }
      } catch (dbError) {
        console.error("[MercadoPago Checkout] Erro ao sincronizar pedido no banco:", dbError);
        // Não quebra a resposta para o cliente se o pagamento no MP funcionou
      }
    }

    // 6. Retorno estruturado para o frontend
    return NextResponse.json({
      success: true,
      id: paymentId,
      status,
      status_detail: statusDetail,
      payment_method_id,
      transaction_amount: Number(transaction_amount),
      point_of_interaction: pointOfInteraction,
      orderId: orderId || null,
      orderNumber: orderNumber || null,
    });
  } catch (error: any) {
    console.error("[MercadoPago API Checkout Error]:", error);

    // Tratamento de erros HTTP do Mercado Pago
    const statusCode = error.status || 500;
    const errorMessage =
      error.message ||
      error.cause?.[0]?.description ||
      "Ocorreu um erro ao processar o pagamento com o Mercado Pago.";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        cause: error.cause || null,
      },
      { status: statusCode }
    );
  }
}
