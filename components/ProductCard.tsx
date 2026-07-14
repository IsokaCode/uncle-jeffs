import Image from "next/image";
import Link from "next/link";
import { imageUrlFor, isShopifyImage } from "@/lib/images";
import type { Product } from "@/lib/products";

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const primaryImage = product.images[0];

  return (
    <Link
      href={`/shop/${product.handle}`}
      className="product-card"
      prefetch={false}
    >
      <div className="product-card-image">
        {primaryImage ? (
          <Image
            src={imageUrlFor(primaryImage, 900)}
            alt={product.title}
            fill
            priority={priority}
            unoptimized={isShopifyImage(primaryImage)}
            sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw"
          />
        ) : (
          <div className="image-placeholder">Image pending</div>
        )}
      </div>
      <div className="product-card-copy">
        <h2>{product.title}</h2>
        <p className="product-color">{product.color}</p>
        <p className="product-price">{product.price}</p>
        <p className="availability">
          <Image
            src={
              product.available
                ? "/icons/Availabledot.png"
                : "/icons/Unavailabledot.png"
            }
            alt=""
            width={12}
            height={12}
          />
          {product.available ? "Worldwide Shipping available" : "Sold Out"}
        </p>
      </div>
    </Link>
  );
}
