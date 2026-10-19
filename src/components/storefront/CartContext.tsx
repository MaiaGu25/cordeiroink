"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { ShippingOption } from "@/actions/shipping";

export interface CartItem {
  id: string;
  productId: string;
  title: string;
  colorName: string;
  size: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  totalItemsCount: number;
  subtotal: number;
  selectedShipping: ShippingOption | null;
  setSelectedShipping: (option: ShippingOption | null) => void;
  destinationCep: string;
  setDestinationCep: (cep: string) => void;
  grandTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [destinationCep, setDestinationCep] = useState("");

  // Carrega do localStorage se disponível no browser
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cordeiroink_cart");
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {
      // Ignora falhas de parsing
    }
  }, []);

  // Salva no localStorage quando os itens mudam
  useEffect(() => {
    try {
      localStorage.setItem("cordeiroink_cart", JSON.stringify(items));
    } catch {
      // Ignora erro de cota
    }
  }, [items]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const addItem = (item: Omit<CartItem, "id">) => {
    setItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) =>
          i.productId === item.productId &&
          i.colorName === item.colorName &&
          i.size === item.size
      );

      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx].quantity += item.quantity;
        return next;
      }

      const id = `${item.productId}-${item.colorName}-${item.size}-${Date.now()}`;
      return [...prev, { ...item, id }];
    });
    setIsOpen(true);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    setSelectedShipping(null);
  };

  const totalItemsCount = items.reduce((acc, i) => acc + i.quantity, 0);
  const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const shippingPrice = selectedShipping ? selectedShipping.price : 0;
  const grandTotal = subtotal + shippingPrice;

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItemsCount,
        subtotal,
        selectedShipping,
        setSelectedShipping,
        destinationCep,
        setDestinationCep,
        grandTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart deve ser usado dentro de um CartProvider");
  }
  return context;
}
