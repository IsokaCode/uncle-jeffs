"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Product } from "@/lib/products";

const CART_STORAGE_KEY = "uncle-jeffs-shopify-cart-id";

type CartMoney = {
  amount: string;
  currencyCode: string;
};

type ShopifyCartApiLine = {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    selectedOptions: {
      name: string;
      value: string;
    }[];
    product: {
      id: string;
      handle: string;
      title: string;
      featuredImage: {
        url: string;
        altText: string | null;
      } | null;
    };
    price: CartMoney;
  };
  cost: {
    totalAmount: CartMoney;
  };
};

type ShopifyCartApi = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: CartMoney;
    totalAmount: CartMoney;
  };
  lines: {
    nodes: ShopifyCartApiLine[];
  };
};

export type CartItem = {
  id: string;
  product: Product;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  checkoutUrl: string | null;
  addItem: (product: Product) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
  itemCount: number;
  total: number;
};

const CartContext = createContext<CartContextValue | null>(null);

function formatPrice(money: CartMoney) {
  return (
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: money.currencyCode,
    }).format(Number(money.amount)) + ` ${money.currencyCode}`
  );
}

function cartToItems(cart: ShopifyCartApi): CartItem[] {
  return cart.lines.nodes.map((line) => {
    const selectedSize =
      line.merchandise.selectedOptions
        .map((option) => option.value)
        .filter((value) => value && value !== "Default Title")
        .join(" / ") || "M/L";

    return {
      id: line.id,
      quantity: line.quantity,
      product: {
        id: line.merchandise.product.id,
        handle: line.merchandise.product.handle,
        title: line.merchandise.product.title,
        price: formatPrice(line.merchandise.price),
        available: true,
        color: "",
        images: line.merchandise.product.featuredImage?.url
          ? [line.merchandise.product.featuredImage.url]
          : [],
        sizingMen: selectedSize,
        sizingWomen: "",
        variantId: line.merchandise.id,
      },
    };
  });
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartId, setCartId] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyCart = useCallback((cart: ShopifyCartApi | null) => {
    if (!cart) {
      setCartId(null);
      setCheckoutUrl(null);
      setItems([]);
      localStorage.removeItem(CART_STORAGE_KEY);
      return;
    }

    setCartId(cart.id);
    setCheckoutUrl(cart.checkoutUrl);
    setItems(cartToItems(cart));
    localStorage.setItem(CART_STORAGE_KEY, cart.id);
  }, []);

  useEffect(() => {
    const savedCartId = localStorage.getItem(CART_STORAGE_KEY);

    if (!savedCartId) {
      return;
    }

    setIsLoading(true);
    fetch(`/api/shopify/cart?cartId=${encodeURIComponent(savedCartId)}`)
      .then(async (response) => {
        const data = (await response.json()) as {
          cart?: ShopifyCartApi | null;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error ?? "Unable to restore cart.");
        }

        applyCart(data.cart ?? null);
      })
      .catch((caughtError) => {
        console.error(caughtError);
        localStorage.removeItem(CART_STORAGE_KEY);
        setCartId(null);
        setCheckoutUrl(null);
        setItems([]);
      })
      .finally(() => setIsLoading(false));
  }, [applyCart]);

  const postCartAction = useCallback(
    async (body: Record<string, unknown>) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/shopify/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = (await response.json()) as {
          cart?: ShopifyCartApi;
          error?: string;
        };

        if (!response.ok || !data.cart) {
          throw new Error(data.error ?? "Unable to update cart.");
        }

        applyCart(data.cart);
      } catch (caughtError) {
        const message =
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to update cart.";
        console.error(caughtError);
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [applyCart],
  );

  const addItem = useCallback(
    async (product: Product) => {
      if (!product.variantId) {
        setError("This product is missing a Shopify variant.");
        return;
      }

      setIsOpen(true);
      await postCartAction({
        action: "add",
        cartId,
        merchandiseId: product.variantId,
        quantity: 1,
      });
    },
    [cartId, postCartAction],
  );

  const removeItem = useCallback(
    async (lineId: string) => {
      if (!cartId) return;

      await postCartAction({
        action: "remove",
        cartId,
        lineId,
      });
    },
    [cartId, postCartAction],
  );

  const updateQuantity = useCallback(
    async (lineId: string, quantity: number) => {
      if (!cartId) return;

      await postCartAction({
        action: quantity <= 0 ? "remove" : "update",
        cartId,
        lineId,
        quantity,
      });
    },
    [cartId, postCartAction],
  );

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const total = items.reduce(
      (sum, item) =>
        sum +
        Number.parseFloat(item.product.price.replace(/[^0-9.]/g, "")) *
          item.quantity,
      0,
    );

    return {
      items,
      isOpen,
      isLoading,
      error,
      checkoutUrl,
      itemCount,
      total,
      addItem,
      removeItem,
      updateQuantity,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
    };
  }, [
    addItem,
    checkoutUrl,
    error,
    isLoading,
    isOpen,
    items,
    removeItem,
    updateQuantity,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}
