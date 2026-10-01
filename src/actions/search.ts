"use server";

import { prisma } from "@/lib/prisma";

export async function globalSearch(query: string) {
  if (!query || query.trim().length < 2) {
    return { orders: [], products: [], rawItems: [] };
  }

  const q = query.trim().toLowerCase();

  const [orders, products, rawItems] = await Promise.all([
    prisma.order.findMany({
      where: {
        OR: [
          { orderNumber: { contains: q } },
          { customerName: { contains: q } },
          { customerEmail: { contains: q } },
        ],
      },
      take: 6,
    }),
    prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { skuBase: { contains: q } },
          { collection: { contains: q } },
        ],
      },
      include: { variants: true },
      take: 6,
    }),
    prisma.rawItem.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { sku: { contains: q } },
          { dtfCode: { contains: q } },
        ],
      },
      take: 6,
    }),
  ]);

  return { orders, products, rawItems };
}
