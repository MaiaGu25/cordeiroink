"use server";

import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getProductionJobs() {
  return await prisma.productionJob.findMany({
    include: {
      order: {
        include: {
          items: {
            include: {
              blankShirt: true,
              dtfPrint: true,
              packaging: true,
              variant: {
                include: {
                  product: true,
                  bom: {
                    include: {
                      rawItem: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: [
      { priority: "desc" },
      { createdAt: "asc" },
    ],
  });
}

export async function updateProductionStep(
  jobId: string,
  stepKey:
    | "stepBlankPicked"
    | "stepDtfPicked"
    | "stepPressed"
    | "stepQcPassed"
    | "stepPacked",
  value: boolean
) {
  const job = await prisma.productionJob.findUnique({
    where: { id: jobId },
    include: { order: true },
  });

  if (!job) throw new Error("Ordem de produção não encontrada");

  // Se marcar o primeiro passo, atualiza status do pedido para IN_PRODUCTION se ainda não estiver
  if (value && job.order.status === OrderStatus.WAITING_PRODUCTION) {
    await prisma.order.update({
      where: { id: job.orderId },
      data: { status: OrderStatus.IN_PRODUCTION },
    });
  }

  const updated = await prisma.productionJob.update({
    where: { id: jobId },
    data: {
      [stepKey]: value,
      startedAt: job.startedAt || new Date(),
    },
  });

  revalidatePath("/producao");
  revalidatePath("/pedidos");
  revalidatePath("/");
  return updated;
}

export async function completeProductionJob(jobId: string) {
  const job = await prisma.productionJob.findUnique({
    where: { id: jobId },
    include: {
      order: {
        include: {
          items: {
            include: {
              blankShirt: true,
              dtfPrint: true,
              packaging: true,
              variant: {
                include: {
                  bom: {
                    include: {
                      rawItem: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!job) throw new Error("Ordem de produção não encontrada");

  // Gatilho de Baixa Automática dos Insumos no Estoque (apenas se ainda não baixado)
  if (!job.stockDeducted) {
    for (const item of job.order.items) {
      // 1. Baixa da Camiseta Lisa utilizada
      if (item.blankShirtId) {
        await prisma.rawItem.update({
          where: { id: item.blankShirtId },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      // 2. Baixa da Folha/Estampa DTF utilizada
      if (item.dtfPrintId) {
        await prisma.rawItem.update({
          where: { id: item.dtfPrintId },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      // 3. Baixa da Embalagem/Tag utilizada
      if (item.packagingId) {
        await prisma.rawItem.update({
          where: { id: item.packagingId },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      // 4. Se tiver BOM vinculado por variante legada
      if (item.variant?.bom) {
        for (const bomItem of item.variant.bom) {
          const quantityToDeduct = bomItem.quantity * item.quantity;
          await prisma.rawItem.update({
            where: { id: bomItem.rawItemId },
            data: {
              stockQuantity: {
                decrement: quantityToDeduct,
              },
            },
          });
        }
      }
    }
  }

  // Atualiza o job para 100% concluído e baixa registrada
  const updatedJob = await prisma.productionJob.update({
    where: { id: jobId },
    data: {
      stepBlankPicked: true,
      stepDtfPicked: true,
      stepPressed: true,
      stepQcPassed: true,
      stepPacked: true,
      stepCompleted: true,
      stockDeducted: true,
      completedAt: new Date(),
    },
  });

  // Atualiza o Pedido para READY (Pronto para Expedição)
  await prisma.order.update({
    where: { id: job.orderId },
    data: {
      status: OrderStatus.READY,
    },
  });

  // Registra no Audit Log
  await prisma.auditLog.create({
    data: {
      action: "PRODUCTION_COMPLETED_STOCK_DEDUCTED",
      entity: "ProductionJob",
      entityId: jobId,
      newPayload: JSON.stringify({
        orderNumber: job.order.orderNumber,
        stockDeducted: true,
        completedAt: new Date(),
      }),
    },
  });

  revalidatePath("/producao");
  revalidatePath("/pedidos");
  revalidatePath("/estoque");
  revalidatePath("/");

  return updatedJob;
}
