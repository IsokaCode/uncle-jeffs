"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/components/CartContext";
import { imageUrlFor, isShopifyImage } from "@/lib/images";
import type { Product } from "@/lib/products";

export function ProductDetails({ product }: { product: Product }) {
  const [selectedImage, setSelectedImage] = useState(product.images[0] ?? "");
  const { addItem } = useCart();

  return (
    <div className="product-layout">
      <section className="product-gallery" aria-label={`${product.title} images`}>
        <div className="product-main-image">
          {selectedImage ? (
            <Image
              src={imageUrlFor(selectedImage, 1600)}
              alt={product.title}
              fill
              priority
              unoptimized={isShopifyImage(selectedImage)}
              sizes="(max-width: 1023px) 100vw, 58vw"
            />
          ) : (
            <div className="image-placeholder">Image pending</div>
          )}
        </div>
        {product.images.length > 1 && (
          <div className="thumbnail-strip">
            {product.images.map((image, index) => (
              <button
                type="button"
                key={image}
                onClick={() => setSelectedImage(image)}
                aria-label={`View image ${index + 1}`}
                aria-pressed={selectedImage === image}
              >
                <Image
                  src={imageUrlFor(image, 240)}
                  alt=""
                  fill
                  unoptimized={isShopifyImage(image)}
                  sizes="90px"
                />
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="product-info">
        <h1>{product.title}</h1>
        <p className="product-page-price">{product.price}</p>
        <p className={`availability ${product.available ? "" : "sold"}`}>
          <Image
            src={
              product.available
                ? "/icons/Availabledot.png"
                : "/icons/Unavailabledot.png"
            }
            alt=""
            width={13}
            height={13}
          />
          {product.available
            ? "Worldwide Shipping available"
            : "Sold/Unavailable"}
        </p>

        <div className="size-guide">
          <div>
            <span>Recommended size for Men</span>
            <strong>{product.sizingMen}</strong>
          </div>
          <div>
            <span>Recommended size for Women</span>
            <strong>{product.sizingWomen}</strong>
          </div>
        </div>

        <button
          type="button"
          className="add-to-cart"
          disabled={!product.available}
          onClick={() => addItem(product)}
        >
          {product.available ? "ADD TO CART" : "SOLD OUT"}
        </button>

        {(product.description || product.measurements) && (
          <div className="product-copy">
            {product.description && (
              <section>
                <h2>Description</h2>
                <p>{product.description}</p>
              </section>
            )}
            {product.measurements && (
              <section>
                <h2>Measurements</h2>
                <p>{product.measurements}</p>
              </section>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
