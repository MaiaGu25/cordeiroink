"use client";

import { useState } from "react";
import { Plus, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { NewOrderModal } from "@/components/orders/NewOrderModal";

interface RawOption {
  id: string;
  name: string;
  costPrice: number;
  stockQuantity: number;
  shirtModel?: string | null;
  shirtColor?: string | null;
  shirtSize?: string | null;
}

interface DashboardHeaderActionProps {
  blankShirts: RawOption[];
}

export function DashboardHeaderAction({ blankShirts }: DashboardHeaderActionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs tracking-tight transition-all duration-150 flex items-center justify-center gap-2 shadow-sm hover:shadow-amber-500/20 active:scale-[0.98]"
      >
        <Zap size={14} className="fill-zinc-950" />
        <span>+ Novo Pedido Express</span>
      </button>

      <NewOrderModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        blankShirts={blankShirts}
        onOrderCreated={() => {
          router.refresh();
        }}
      />
    </>
  );
}
