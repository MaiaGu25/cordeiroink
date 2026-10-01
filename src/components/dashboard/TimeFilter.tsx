"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const FILTERS = [
  { label: "Hoje", value: "today" },
  { label: "Últimos 7 dias", value: "7d" },
  { label: "Últimos 30 dias", value: "30d" },
  { label: "Mês Atual", value: "month" },
];

export function TimeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPeriod = searchParams.get("period") || "month";

  const handleSelect = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", val);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
      <div className="px-2 py-1 text-zinc-500 hidden sm:flex items-center gap-1 text-xs">
        <Calendar size={13} />
        <span>Período:</span>
      </div>
      {FILTERS.map((f) => {
        const isActive = currentPeriod === f.value;
        return (
          <button
            key={f.value}
            onClick={() => handleSelect(f.value)}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer",
              isActive
                ? "bg-amber-500 text-zinc-950 font-bold shadow-sm"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
            )}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
