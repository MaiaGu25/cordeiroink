import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { prisma } from "@/lib/prisma";
import { OrderStatus, TransactionType, TransactionCategory } from "@prisma/client";
import { z } from "zod";

/**
 * Esquema de validação Zod para proteção e integridade do payload de pagamento.
 */
const checkoutSchema = z.object({
  formData: z.object({
    token: z.string().optional(),
    issuer_id: z.union([z.string(), z.number()]).optional(),
    payment_method_id: z.string().min(1, "Método de pagamento (payment_method_id) não selecionado."),
    transaction_amount: z.number().positive("Valor da transação inválido (deve ser maior que zero)."),
    installments: z.number().int().min(1).max(12).optional(),
    payer: z
      .object({
        email: z.string().email("E-mail do pagador inválido.").optional().or(z.literal("")),
        first_name: z.string().optional(),
        last_name: z.string().optional(),
        identification: z
          .object({
            type: z.string().optional(),
            number: z.string().optional(),
          })
          .optional(),
      })
      .optional(),
  }),
  orderId: z.string().optional(),
  orderNumber: z.string().optional(),
  description: z.string().max(255).optional(),
});

type CheckoutRequestBody = z.infer<typeof checkoutSchema>;

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

    let rawBody: any;
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Formato de requisição inválido. Esperava JSON.",
        },
        { status: 400 }
      );
    }

    // 1. Validação estrita via Zod
    const validationResult = checkoutSchema.safeParse(rawBody);
    if (!validationResult.success) {
      const issue = validationResult.error.issues[0];
      return NextResponse.json(
        {
          success: false,
          error: issue ? `${issue.path.join(".")}: ${issue.message}` : "Dados de pagamento inválidos.",
        },
        { status: 400 }
      );
    }

    const body: CheckoutRequestBody = validationResult.data;
    const { formData, orderId, orderNumber, description } = body;
    const { transaction_amount, payment_method_id, payer, token, installments, issuer_id } =
      formData;

    // 2. Proteção Anti-Fraude de Preço: Calcula o valor a ser cobrado diretamente no servidor
    let secureAmount: number;
    let existingOrder: any = null;

    if (orderId) {
      existingOrder = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!existingOrder) {
        return NextResponse.json(
          {
            success: false,
            error: `Pedido não encontrado com o ID informado (${orderId}).`,
          },
          { status: 404 }
        );
      }

      // O valor cobrado é rigorosamente o total real registrado no banco de dados do pedido
      const dbTotal =
        (Number(existingOrder.totalProducts) || 0) +
        (Number(existingOrder.shippingCost) || 0);

      if (dbTotal <= 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Valor do pedido registrado no sistema é inválido.",
          },
          { status: 400 }
        );
      }

      secureAmount = Number(dbTotal.toFixed(2));
    } else {
      // Se não há orderId registrado previamente, usa o valor com 2 casas decimais
      secureAmount = Number(Number(transaction_amount).toFixed(2));
    }

    // 3. Inicialização segura do SDK Mercado Pago
    const client = new MercadoPagoConfig({
      accessToken,
      options: { timeout: 10000 },
    });

    const payment = new Payment(client);

    // 4. Montagem segura dos dados do pagador
    const cleanPayerEmail =
      payer?.email?.trim() || existingOrder?.customerEmail?.trim() || "cliente@cordeiroink.com.br";

    const customerFullName =
      (payer?.first_name ? `${payer.first_name} ${payer.last_name || ""}` : "").trim() ||
      existingOrder?.customerName?.trim() ||
      "Cliente Cordeiro Ink";

    const nameParts = customerFullName.split(" ");
    const firstName = nameParts[0] || "Cliente";
    const lastName = nameParts.slice(1).join(" ") || "Cordeiro";

    // 5. Montagem do payload oficial para o Mercado Pago
    const paymentData: any = {
      transaction_amount: secureAmount,
      description:
        description ||
        `Cordeiro Ink - Pedido ${existingOrder?.orderNumber || orderNumber || "Online"}`.trim(),
      payment_method_id,
      payer: {
        email: cleanPayerEmail,
        first_name: firstName,
        last_name: lastName,
      },
      metadata: {
        order_id: orderId || null,
        order_number: existingOrder?.orderNumber || orderNumber || null,
        store: "Cordeiro Ink",
      },
    };

    // Dados específicos para Cartão de Crédito ou Débito
    if (token) {
      paymentData.token = token;
      paymentData.installments = Number(installments) || 1;

      if (issuer_id !== undefined && issuer_id !== null && issuer_id !== "") {
        paymentData.issuer_id = String(issuer_id);
      }

      // Se houver dados de identificação (CPF/CNPJ) enviados pelo Brick
      if (payer?.identification?.number) {
        paymentData.payer.identification = {
          type: payer.identification.type || "CPF",
          number: payer.identification.number.replace(/\D/g, ""),
        };
      }
    }

    // 6. Chamada à API de Pagamentos do Mercado Pago
    const response = await payment.create({ body: paymentData });

    const paymentId = response.id;
    const status = response.status;
    const statusDetail = response.status_detail;
    const pointOfInteraction = response.point_of_interaction;

    // Atualização em cascata do pedido no banco de dados
    if (orderId) {
      try {
        const isApproved = status === "approved";
        const isPending = status === "pending" || status === "in_process";

        let newStatus: OrderStatus = OrderStatus.PENDING;
        if (isApproved) {
          newStatus = OrderStatus.PAID;
        } else if (isPending) {
          newStatus = OrderStatus.PENDING;
        }

        const methodUpper = payment_method_id?.toUpperCase() || "CARTAO";

        const order = await prisma.order.update({
          where: { id: orderId },
          data: {
            status: newStatus,
            paymentMethod: methodUpper,
            paidAt: isApproved ? new Date() : undefined,
          },
        });

        // Se o pagamento com cartão foi aprovado instantaneamente, registra a transação financeira
        if (isApproved) {
          const existingTx = await prisma.financialTransaction.findFirst({
            where: { orderId: order.id, type: TransactionType.INCOME },
          });

          if (!existingTx) {
            await prisma.financialTransaction.create({
              data: {
                type: TransactionType.INCOME,
                category: TransactionCategory.SALES_ORDER,
                amount: secureAmount,
                description: `Recebimento Pedido ${order.orderNumber} via Mercado Pago (${methodUpper || "CARTAO"})`,
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
              details: `Pagamento com cartão aprovado instantaneamente via Mercado Pago (ID: ${paymentId}, Status: ${status})`,
            },
          });
        }
      } catch (dbError) {
        console.error("[MercadoPago Checkout] Erro ao sincronizar pedido no banco:", dbError);
      }
    }

    // 7. Retorno estruturado para o frontend
    return NextResponse.json({
      success: true,
      id: paymentId,
      status,
      status_detail: statusDetail,
      payment_method_id,
      transaction_amount: secureAmount,
      point_of_interaction: pointOfInteraction,
      orderId: orderId || null,
      orderNumber: existingOrder?.orderNumber || orderNumber || null,
    });
  } catch (error: any) {
    console.error("[MercadoPago API Checkout Error]:", error);

    // Tratamento seguro de erros do Mercado Pago sem vazar stack trace
    const statusCode = error.status || 500;
    const errorMessage =
      error.cause?.[0]?.description ||
      error.message ||
      "Ocorreu um erro ao processar o pagamento com o Mercado Pago.";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: statusCode }
    );
  }
}
