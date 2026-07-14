import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { getProducts } from "@/lib/shopify";

export const metadata: Metadata = {
  title: "Shop",
};

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <section className="shop-page">
      <div className="product-grid">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            priority={index < 4}
          />
        ))}
      </div>
    </section>
  );
}
