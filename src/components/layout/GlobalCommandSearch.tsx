"use client";

import { useEffect, useState, useTransition } from "react";
import { Search, ShoppingBag, Shirt, Package, X, ArrowRight, Loader2 } from "lucide-react";
import { globalSearch } from "@/actions/search";
import Link from "next/link";
import { formatCurrency, CHANNEL_CONFIG, STATUS_CONFIG } from "@/lib/utils";

interface GlobalCommandSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalCommandSearch({ isOpen, onClose }: GlobalCommandSearchProps) {
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState<{
    orders: any[];
    products: any[];
    rawItems: any[];
  }>({ orders: [], products: [], rawItems: [] });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent can toggle
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.trim().length >= 2) {
      startTransition(async () => {
        const data = await globalSearch(value);
        setResults(data);
      });
    } else {
      setResults({ orders: [], products: [], rawItems: [] });
    }
  };

  if (!isOpen) return null;

  const hasResults =
    results.orders.length > 0 ||
    results.products.length > 0 ||
    results.rawItems.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-2 sm:px-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-[96%] sm:w-full max-w-2xl bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-zinc-800 gap-3">
          <Search size={18} className="text-zinc-400 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar por Pedido (#CI-...), Cliente, SKU, Estampa DTF ou Insumo..."
            className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
          />
          {isPending ? (
            <Loader2 size={16} className="text-amber-400 animate-spin shrink-0" />
          ) : query ? (
            <button
              onClick={() => handleSearch("")}
              className="text-zinc-500 hover:text-zinc-300"
            >
              <X size={16} />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] text-zinc-400 bg-zinc-800 border border-zinc-700 rounded font-mono">
              ESC
            </kbd>
          )}
        </div>

        {/* Search Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {!query && (
            <div className="p-6 text-center text-xs text-zinc-500">
              Digite pelo menos 2 caracteres para buscar em tempo real na base do Cordeiro Ink Hub.
            </div>
          )}

          {query && !isPending && !hasResults && (
            <div className="p-8 text-center text-xs text-zinc-400">
              Nenhum resultado encontrado para &ldquo;<span className="text-zinc-200">{query}</span>&rdquo;.
            </div>
          )}

          {/* Orders Section */}
          {results.orders.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5">
                <ShoppingBag size={12} className="text-blue-400" />
                Pedidos ({results.orders.length})
              </div>
              <div className="space-y-1">
                {results.orders.map((o) => {
                  const channel = CHANNEL_CONFIG[o.channel] || { label: o.channel };
                  const status = STATUS_CONFIG[o.status] || { label: o.status };
                  return (
                    <Link
                      key={o.id}
                      href={`/pedidos`}
                      onClick={onClose}
                      className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800/80 transition group border border-transparent hover:border-zinc-700/60"
                    >
                      <div className="flex items-center gap-3">
                        <div className="font-mono text-xs font-bold text-amber-400">
                          {o.orderNumber}
                        </div>
                        <div className="text-xs text-zinc-200">
                          {o.customerName}
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                          {channel.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-zinc-300">
                          {formatCurrency(o.totalProducts)}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-zinc-700 text-zinc-300">
                          {status.label}
                        </span>
                        <ArrowRight size={12} className="text-zinc-500 group-hover:text-zinc-200 group-hover:translate-x-0.5 transition" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Products Section */}
          {results.products.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5">
                <Shirt size={12} className="text-emerald-400" />
                Catálogo de Produtos ({results.products.length})
              </div>
              <div className="space-y-1">
                {results.products.map((p) => (
                  <Link
                    key={p.id}
                    href={`/produtos`}
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800/80 transition group border border-transparent hover:border-zinc-700/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="font-mono text-[11px] text-zinc-400">
                        {p.skuBase}
                      </div>
                      <div className="text-xs font-medium text-zinc-200">
                        {p.name}
                      </div>
                      <span className="text-[10px] text-zinc-400">
                        {p.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-zinc-400">
                        {p.variants?.length || 0} variantes
                      </span>
                      <ArrowRight size={12} className="text-zinc-500 group-hover:text-zinc-200 group-hover:translate-x-0.5 transition" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Raw Items Section */}
          {results.rawItems.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5">
                <Package size={12} className="text-amber-400" />
                Insumos & Matéria-Prima ({results.rawItems.length})
              </div>
              <div className="space-y-1">
                {results.rawItems.map((r) => (
                  <Link
                    key={r.id}
                    href={`/estoque`}
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800/80 transition group border border-transparent hover:border-zinc-700/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="font-mono text-[11px] text-zinc-400">
                        {r.sku}
                      </div>
                      <div className="text-xs font-medium text-zinc-200">
                        {r.name}
                      </div>
                      {r.dtfCode && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-amber-300 border border-zinc-700">
                          {r.dtfCode}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold ${
                          r.stockQuantity <= r.minStock
                            ? "text-red-400"
                            : "text-zinc-300"
                        }`}
                      >
                        Estoque: {r.stockQuantity} un
                      </span>
                      <ArrowRight size={12} className="text-zinc-500 group-hover:text-zinc-200 group-hover:translate-x-0.5 transition" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-zinc-950 border-t border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>Navegue com setas</span>
            <span>•</span>
            <span>ENTER para abrir</span>
          </div>
          <span>Cordeiro Ink Hub Search</span>
        </div>
      </div>
    </div>
  );
}
