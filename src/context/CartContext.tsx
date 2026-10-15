"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { CartItem, Product, ProductVariant } from "@/types/product";

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotalLKR: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  lastAddedItem: CartItem | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "local_brand_scent_cart_v1";
const MAX_QUANTITY_PER_ITEM = 10;

function getInitialCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (it) =>
            it &&
            typeof it.id === "string" &&
            typeof it.priceLKR === "number" &&
            typeof it.quantity === "number"
        );
      }
    }
  } catch {
    // In case of parsing error or disabled storage, ignore gracefully
  }
  return [];
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(getInitialCart);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage unavailable or full
    }
  }, [items]);

  const addItem = (product: Product, variant: ProductVariant, quantity: number = 1) => {
    const validQty = Math.max(1, Math.min(quantity, MAX_QUANTITY_PER_ITEM));
    const compositeId = `${product.id}-${variant.id}`;

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === compositeId);

      if (existingIndex > -1) {
        const updated = [...prevItems];
        const newQty = Math.min(
          updated[existingIndex].quantity + validQty,
          MAX_QUANTITY_PER_ITEM
        );
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
        };
        setLastAddedItem(updated[existingIndex]);
        return updated;
      } else {
        const newItem: CartItem = {
          id: compositeId,
          productId: product.id,
          productSlug: product.slug,
          productName: product.name,
          variantId: variant.id,
          variantName: variant.name,
          priceLKR: variant.priceLKR,
          quantity: validQty,
          image: product.images[0] || "",
          category: product.category,
          sku: variant.sku,
          selectedAttributes: Object.entries(variant.attributes).reduce(
            (acc, [k, v]) => ({ ...acc, [k]: String(v) }),
            {}
          ),
        };
        setLastAddedItem(newItem);
        return [...prevItems, newItem];
      }
    });

    setIsCartOpen(true);
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    const safeQty = Math.min(quantity, MAX_QUANTITY_PER_ITEM);
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity: safeQty } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items]
  );

  const subtotalLKR = useMemo(
    () => items.reduce((total, item) => total + item.priceLKR * item.quantity, 0),
    [items]
  );

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    itemCount,
    subtotalLKR,
    isCartOpen,
    setIsCartOpen,
    openCart: () => setIsCartOpen(true),
    closeCart: () => setIsCartOpen(false),
    lastAddedItem,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
