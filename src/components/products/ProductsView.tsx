"use client";

import { useState } from "react";
import { Shirt, Calculator, Sparkles } from "lucide-react";
import { ProductsCatalog } from "./ProductsCatalog";
import { PricingCalculator } from "../pricing/PricingCalculator";

interface ProductsViewProps {
  products: any[];
}

export function ProductsView({ products }: ProductsViewProps) {
  const [activeTab, setActiveTab] = useState<"CATALOG" | "CALCULATOR">("CALCULATOR");

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800 w-fit">
        <button
          onClick={() => setActiveTab("CALCULATOR")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
            activeTab === "CALCULATOR"
              ? "bg-amber-500 text-zinc-950 shadow-sm"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Calculator size={15} />
          <span>Calculadora de Precificação Interativa</span>
        </button>

        <button
          onClick={() => setActiveTab("CATALOG")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
            activeTab === "CATALOG"
              ? "bg-amber-500 text-zinc-950 shadow-sm"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Shirt size={15} />
          <span>Catálogo de Produtos & Ficha Técnica BOM ({products.length})</span>
        </button>
      </div>

      {activeTab === "CALCULATOR" ? (
        <PricingCalculator />
      ) : (
        <ProductsCatalog products={products} />
      )}
    </div>
  );
}
