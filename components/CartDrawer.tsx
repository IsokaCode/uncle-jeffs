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
    isLoading,
    error,
    checkoutUrl,
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

    if (!checkoutUrl) {
      setCheckoutState("error");
      return;
    }

    window.location.href = checkoutUrl;
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
            <p className="empty-cart">
              {isLoading ? "Loading cart..." : "Your cart is empty"}
            </p>
          ) : (
            items.map(({ id, product, quantity }) => (
              <article className="cart-item" key={id}>
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
                        updateQuantity(id, quantity - 1)
                      }
                      disabled={isLoading}
                      aria-label={`Decrease ${product.title} quantity`}
                    >
                      -
                    </button>
                    <span>{quantity}</span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(id, quantity + 1)
                      }
                      disabled={isLoading}
                      aria-label={`Increase ${product.title} quantity`}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    className="remove-item"
                    onClick={() => removeItem(id)}
                    disabled={isLoading}
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
              disabled={checkoutState === "loading" || isLoading}
            >
              {checkoutState === "loading"
                ? "CREATING CHECKOUT..."
                : "PROCEED TO CHECKOUT"}
            </button>
            {checkoutState === "error" && (
              <p className="checkout-error">
                Checkout is not available. Check Shopify cart and environment
                variables.
              </p>
            )}
            {error && <p className="checkout-error">{error}</p>}
          </footer>
        )}
      </aside>
    </div>
  );
}
