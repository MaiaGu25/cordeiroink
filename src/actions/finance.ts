"use server";

import { prisma } from "@/lib/prisma";
import { TransactionCategory, TransactionType } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getFinancialData() {
  const transactions = await prisma.financialTransaction.findMany({
    orderBy: { date: "desc" },
    take: 50,
  });

  const orders = await prisma.order.findMany({
    where: {
      status: { not: "CANCELLED" },
    },
  });

  // Cálculos do DRE
  const grossSales = orders.reduce((acc, o) => acc + o.totalProducts, 0);
  const platformFees = orders.reduce((acc, o) => acc + o.platformFee, 0);
  const shippingRevenue = orders.reduce((acc, o) => acc + o.shippingCost, 0);
  const totalCMV = orders.reduce((acc, o) => acc + o.estimatedCMV, 0);

  // Despesas operacionais diretas das transações
  const operationalExpenses = transactions
    .filter((t) => t.type === TransactionType.EXPENSE && t.category === TransactionCategory.OPERATIONAL)
    .reduce((acc, t) => acc + t.amount, 0);

  const marketingExpenses = transactions
    .filter((t) => t.type === TransactionType.EXPENSE && t.category === TransactionCategory.MARKETING)
    .reduce((acc, t) => acc + t.amount, 0);

  const rawMaterialPurchases = transactions
    .filter((t) => t.type === TransactionType.EXPENSE && t.category === TransactionCategory.RAW_MATERIALS)
    .reduce((acc, t) => acc + t.amount, 0);

  const netRevenue = grossSales - platformFees; // Receita Líquida pós taxas de marketplace
  const grossProfit = netRevenue - totalCMV; // Lucro Bruto após CMV
  const totalExpenses = platformFees + totalCMV + operationalExpenses + marketingExpenses;
  const realNetProfit = grossSales - totalExpenses; // Lucro Líquido Real

  return {
    transactions,
    dre: {
      grossSales,
      platformFees,
      shippingRevenue,
      netRevenue,
      totalCMV,
      grossProfit,
      operationalExpenses,
      marketingExpenses,
      rawMaterialPurchases,
      realNetProfit,
      marginPercent: grossSales > 0 ? (realNetProfit / grossSales) * 100 : 0,
    },
  };
}

export async function addTransaction(data: {
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
}) {
  const tx = await prisma.financialTransaction.create({
    data: {
      type: data.type,
      category: data.category,
      amount: data.amount,
      description: data.description,
      date: new Date(),
    },
  });

  revalidatePath("/financeiro");
  revalidatePath("/");
  return tx;
}
