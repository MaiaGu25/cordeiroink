"use server";

import { prisma } from "@/lib/prisma";
import { OrderStatus, TransactionType, TransactionCategory } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";

export async function getProductionJobs() {
  return await prisma.productionJob.findMany({
    where: {
      stepCompleted: false,
      order: {
        status: {
          in: [
            OrderStatus.PAID,
            OrderStatus.WAITING_PRODUCTION,
            OrderStatus.IN_PRODUCTION,
          ],
        },
      },
    },
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
  const user = await getCurrentUser();
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      orderId: job.orderId,
      action: "PRODUCTION_COMPLETED_STOCK_DEDUCTED",
      entity: "ProductionJob",
      entityId: jobId,
      details: `Produção 100% concluída e insumos baixados do estoque por ${user.name}`,
      newPayload: JSON.stringify({
        orderNumber: job.order.orderNumber,
        stockDeducted: true,
        completedAt: new Date(),
        completedBy: user.name,
      }),
    },
  });

  revalidatePath("/producao");
  revalidatePath("/pedidos");
  revalidatePath("/estoque");
  revalidatePath("/historico");
  revalidatePath("/");

  return updatedJob;
}

export async function registerProductionLoss(jobId: string, reason: string) {
  if (!reason || !reason.trim()) {
    throw new Error("Informe o motivo da perda ou retrabalho para auditoria.");
  }

  const user = await getCurrentUser();
  const job = await prisma.productionJob.findUnique({
    where: { id: jobId },
    include: {
      order: {
        include: {
          items: {
            include: {
              blankShirt: true,
            },
          },
        },
      },
    },
  });

  if (!job) throw new Error("Ordem de produção não encontrada");

  // Localiza a camiseta usada no primeiro item do pedido
  const firstItem = job.order.items[0];
  const blankShirtId = firstItem?.blankShirtId;
  const blankShirt = firstItem?.blankShirt;

  // 1. Desconta imediatamente +1 camiseta do estoque físico
  if (blankShirtId) {
    await prisma.rawItem.update({
      where: { id: blankShirtId },
      data: {
        stockQuantity: {
          decrement: 1,
        },
      },
    });
  }

  // 2. Incrementa o contador de retrabalhos da OS
  const updatedJob = await prisma.productionJob.update({
    where: { id: jobId },
    data: {
      reworkCount: {
        increment: 1,
      },
      lossReason: reason.trim(),
    },
  });

  // 3. Registra transação financeira como despesa operacional da perda
  const lossCost = blankShirt?.costPrice || 25.0;
  await prisma.financialTransaction.create({
    data: {
      type: TransactionType.EXPENSE,
      category: TransactionCategory.OPERATIONAL,
      amount: lossCost,
      description: `Perda/Retrabalho na Prensa: Pedido ${job.order.orderNumber} - Motivo: ${reason.trim()}`,
      orderId: job.orderId,
    },
  });

  // 4. Registra no AuditLog
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      orderId: job.orderId,
      action: "REWORK_LOGGED",
      entity: "ProductionJob",
      entityId: jobId,
      details: `Perda/Retrabalho registrado por ${user.name}. Motivo: "${reason.trim()}". Descontada +1 camiseta (${
        blankShirt?.name || "Camiseta Lisa"
      }) do estoque físico.`,
      newPayload: JSON.stringify({
        orderNumber: job.order.orderNumber,
        lossReason: reason.trim(),
        reworkCount: job.reworkCount + 1,
        lossCost,
        loggedBy: user.name,
      }),
    },
  });

  revalidatePath("/producao");
  revalidatePath("/estoque");
  revalidatePath("/financeiro");
  revalidatePath("/pedidos");
  revalidatePath("/historico");
  revalidatePath("/");

  return updatedJob;
}
