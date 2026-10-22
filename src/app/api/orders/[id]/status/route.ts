import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Endpoint leve para consulta em tempo real do status de um pedido.
 * Utilizado para polling de confirmação instantânea de Pix / Cartão no frontend.
 * Rota: GET /api/orders/[id]/status
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Identificador do pedido não informado." },
        { status: 400 }
      );
    }

    const decodedId = decodeURIComponent(id).trim();

    // Busca o pedido por id uuid ou pelo orderNumber (#WPP-..., #CI-...)
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: decodedId },
          { orderNumber: decodedId },
          { orderNumber: decodedId.startsWith("#") ? decodedId : `#${decodedId}` },
        ],
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentMethod: true,
        totalProducts: true,
        shippingCost: true,
        paidAt: true,
        updatedAt: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Pedido não encontrado." },
        { status: 404 }
      );
    }

    // Status considerados pagos/aprovados no fluxo da confecção
    const isPaid = [
      "PAID",
      "WAITING_PRODUCTION",
      "IN_PRODUCTION",
      "READY",
      "SHIPPED",
      "DELIVERED",
    ].includes(order.status);

    return NextResponse.json(
      {
        success: true,
        status: order.status,
        orderNumber: order.orderNumber,
        isPaid,
        paidAt: order.paidAt,
        paymentMethod: order.paymentMethod,
        total: order.totalProducts + order.shippingCost,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error("[Order Status API Error]:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno ao consultar status do pedido." },
      { status: 500 }
    );
  }
}
