"use client";

import { createContext, useContext, useMemo, useReducer } from "react";
import type { Product } from "@/lib/products";

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
};

type CartAction =
  | { type: "ADD_ITEM"; product: Product }
  | { type: "REMOVE_ITEM"; handle: string }
  | { type: "UPDATE_QTY"; handle: string; quantity: number }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" };

type CartContextValue = CartState & {
  addItem: (product: Product) => void;
  removeItem: (handle: string) => void;
  updateQuantity: (handle: string, quantity: number) => void;
  openCart: () => void;
  closeCart: () => void;
  itemCount: number;
  total: number;
};

const CartContext = createContext<CartContextValue | null>(null);

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find(
        (item) => item.product.handle === action.product.handle,
      );
      const items = existing
        ? state.items.map((item) =>
            item.product.handle === action.product.handle
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          )
        : [...state.items, { product: action.product, quantity: 1 }];
      return { items, isOpen: true };
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter(
          (item) => item.product.handle !== action.handle,
        ),
      };
    case "UPDATE_QTY":
      return {
        ...state,
        items:
          action.quantity <= 0
            ? state.items.filter(
                (item) => item.product.handle !== action.handle,
              )
            : state.items.map((item) =>
                item.product.handle === action.handle
                  ? { ...item, quantity: action.quantity }
                  : item,
              ),
      };
    case "OPEN_CART":
      return { ...state, isOpen: true };
    case "CLOSE_CART":
      return { ...state, isOpen: false };
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [], isOpen: false });

  const value = useMemo<CartContextValue>(() => {
    const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
    const total = state.items.reduce(
      (sum, item) =>
        sum +
        Number.parseFloat(item.product.price.replace(/[^0-9.]/g, "")) *
          item.quantity,
      0,
    );

    return {
      ...state,
      itemCount,
      total,
      addItem: (product) => dispatch({ type: "ADD_ITEM", product }),
      removeItem: (handle) => dispatch({ type: "REMOVE_ITEM", handle }),
      updateQuantity: (handle, quantity) =>
        dispatch({ type: "UPDATE_QTY", handle, quantity }),
      openCart: () => dispatch({ type: "OPEN_CART" }),
      closeCart: () => dispatch({ type: "CLOSE_CART" }),
    };
  }, [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}
