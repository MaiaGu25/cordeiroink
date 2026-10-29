import { prisma } from "@/lib/prisma";
import { getProductTemplates } from "@/actions/templates";
import { ProductsView } from "@/components/products/ProductsView";

export const dynamic = "force-dynamic";

export default async function ProdutosPage() {
  const [products, templates] = await Promise.all([
    prisma.product.findMany({
      include: {
        template: true,
        variants: {
          include: {
            bom: {
              include: {
                rawItem: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    getProductTemplates(),
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Produtos & Engenharia de Custos
          </h1>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Streetwear On-Demand
          </span>
        </div>
        <p className="text-xs text-zinc-400 mt-1">
          Simulador de precificação com taxas de canais de venda (Shopee, Shein, TikTok, Whats) e fichas técnicas de montagem (BOM).
        </p>
      </div>

      <ProductsView products={products} templates={templates} />
    </div>
  );
}
