"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/CartContext";
import { imageUrlFor, isShopifyImage } from "@/lib/images";

export function CartDrawer() {
  const [checkoutState, setCheckoutState] = useState<
    "idle" | "loading" | "error"
  >("idle");
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    total,
  } = useCart();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    if (isOpen) {
      setCheckoutState("idle");
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeCart]);

  async function proceedToCheckout() {
    setCheckoutState("loading");

    try {
      const response = await fetch("/api/shopify/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: items.map(({ product, quantity }) => ({
            merchandiseId: product.variantId,
            quantity,
          })),
        }),
      });
      const data = (await response.json()) as {
        checkoutUrl?: string;
        error?: string;
      };

      if (!response.ok || !data.checkoutUrl) {
        throw new Error(data.error ?? "Checkout failed.");
      }

      window.location.href = data.checkoutUrl;
    } catch (error) {
      console.error(error);
      setCheckoutState("error");
    }
  }

  return (
    <div className={`cart-layer ${isOpen ? "is-open" : ""}`} aria-hidden={!isOpen}>
      <button
        type="button"
        className="cart-overlay"
        onClick={closeCart}
        aria-label="Close cart"
        tabIndex={isOpen ? 0 : -1}
      />
      <aside className="cart-drawer" aria-label="Shopping cart">
        <header className="cart-header">
          <div>
            <h2>Cart</h2>
            <p>All Orders Are Processed Within 24/48 Hours</p>
          </div>
          <button type="button" onClick={closeCart} aria-label="Close cart">
            x
          </button>
        </header>

        <div className="cart-content">
          {items.length === 0 ? (
            <p className="empty-cart">Your cart is empty</p>
          ) : (
            items.map(({ product, quantity }) => (
              <article className="cart-item" key={product.handle}>
                <div className="cart-item-image">
                  {product.images[0] ? (
                    <Image
                      src={imageUrlFor(product.images[0], 240)}
                      alt={product.title}
                      fill
                      unoptimized={isShopifyImage(product.images[0])}
                      sizes="88px"
                    />
                  ) : (
                    <div className="image-placeholder">Image pending</div>
                  )}
                </div>
                <div className="cart-item-info">
                  <Link href={`/shop/${product.handle}`} onClick={closeCart}>
                    {product.title}
                  </Link>
                  <p>{product.price}</p>
                  <div className="quantity-control">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(product.handle, quantity - 1)
                      }
                      aria-label={`Decrease ${product.title} quantity`}
                    >
                      -
                    </button>
                    <span>{quantity}</span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(product.handle, quantity + 1)
                      }
                      aria-label={`Increase ${product.title} quantity`}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    className="remove-item"
                    onClick={() => removeItem(product.handle)}
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))
          )}
        </div>

        {items.length > 0 && (
          <footer className="cart-footer">
            <div>
              <span>Total</span>
              <span>${total.toFixed(2)} USD</span>
            </div>
            <button
              type="button"
              onClick={proceedToCheckout}
              disabled={checkoutState === "loading"}
            >
              {checkoutState === "loading"
                ? "CREATING CHECKOUT..."
                : "PROCEED TO CHECKOUT"}
            </button>
            {checkoutState === "error" && (
              <p className="checkout-error">
                Checkout is not available. Check Shopify product variants and
                environment variables.
              </p>
            )}
          </footer>
        )}
      </aside>
    </div>
  );
}
