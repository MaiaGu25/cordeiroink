"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ArrowUpRight, Lock, ShoppingBag } from "lucide-react";
import { useCart } from "./CartContext";

export function StorefrontHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { openCart, totalItemsCount } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-[#F7F4EE]/90 backdrop-blur-md border-b border-[#E6DED2] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo in Serif */}
        <Link href="/" className="flex flex-col group">
          <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A] uppercase transition group-hover:opacity-80">
            Cordeiro Ink
          </span>
          <span className="font-sans text-[10px] tracking-[0.25em] text-[#737373] uppercase font-medium">
            Streetwear Cristão
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 font-sans text-xs uppercase tracking-widest font-semibold text-[#0A0A0A]">
          <a
            href="#catalogo"
            className="hover:text-[#737373] transition-colors"
          >
            Coleção
          </a>
          <a
            href="#sobre"
            className="hover:text-[#737373] transition-colors"
          >
            Quem Somos
          </a>
          <a
            href="#personalizadas"
            className="hover:text-[#737373] transition-colors flex items-center gap-1"
          >
            <span>Eventos & Igrejas</span>
            <span className="px-1.5 py-0.5 rounded-full bg-[#0A0A0A] text-[#F7F4EE] text-[9px] font-bold">
              B2B
            </span>
          </a>
        </nav>

        {/* Action Button: Cart, Team and Custom */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/admin"
            className="text-[11px] font-sans uppercase tracking-wider text-[#737373] hover:text-[#0A0A0A] flex items-center gap-1 transition"
            title="Acesso da Equipe"
          >
            <Lock size={12} />
            <span>Equipe</span>
          </Link>

          <button
            onClick={openCart}
            className="relative p-2.5 rounded-full bg-[#0A0A0A]/5 hover:bg-[#0A0A0A]/10 text-[#0A0A0A] transition cursor-pointer flex items-center justify-center"
            title="Abrir sacola de compras"
          >
            <ShoppingBag size={18} />
            {totalItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-[#0A0A0A] text-[#F7F4EE] text-[10px] font-mono font-bold leading-none animate-in zoom-in">
                {totalItemsCount}
              </span>
            )}
          </button>

          <a
            href="#personalizadas"
            className="px-5 py-2.5 rounded-full bg-[#0A0A0A] hover:bg-[#222222] text-[#F7F4EE] text-xs uppercase tracking-wider font-semibold transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <span>Orçamento Eventos</span>
            <ArrowUpRight size={14} />
          </a>
        </div>

        {/* Mobile Buttons */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={openCart}
            className="relative p-2 text-[#0A0A0A] hover:text-[#737373] transition"
            aria-label="Abrir sacola"
          >
            <ShoppingBag size={20} />
            {totalItemsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 px-1.5 py-0.2 rounded-full bg-[#0A0A0A] text-[#F7F4EE] text-[9px] font-mono font-bold leading-tight">
                {totalItemsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#0A0A0A] hover:text-[#737373] transition"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#F7F4EE] border-b border-[#E6DED2] px-6 py-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-4 font-sans text-sm uppercase tracking-widest font-semibold text-[#0A0A0A]">
            <a
              href="#catalogo"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#737373] transition-colors"
            >
              Coleção de Peças
            </a>
            <a
              href="#sobre"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#737373] transition-colors"
            >
              Quem Somos (Igor & Grazi)
            </a>
            <a
              href="#personalizadas"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#737373] transition-colors flex items-center justify-between"
            >
              <span>Camisetas para Eventos & Igrejas</span>
              <span className="px-2 py-0.5 rounded-full bg-[#0A0A0A] text-[#F7F4EE] text-[10px] font-bold">
                B2B
              </span>
            </a>
            <a
              href="#sobre"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#737373] transition-colors"
            >
              O Ateliê
            </a>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-[#737373] flex items-center gap-1.5 text-xs"
            >
              <Lock size={13} />
              <span>Painel Interno da Equipe</span>
            </Link>
          </nav>

          <div className="pt-4 border-t border-[#E6DED2]">
            <a
              href="#personalizadas"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center block px-6 py-3 rounded-full bg-[#0A0A0A] text-[#F7F4EE] text-xs uppercase tracking-widest font-semibold shadow-md"
            >
              Criar Peça Personalizada
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
