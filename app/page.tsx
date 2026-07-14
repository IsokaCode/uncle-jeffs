import Image from "next/image";
import { ProductCard } from "@/components/ProductCard";
import { getProducts } from "@/lib/shopify";

export default async function HomePage() {
  const products = await getProducts();

  return (
    <div className="home-page">
      <section className="home-banner">
        <Image
          src="/banner/UJB&W Banner.PNG"
          alt="Uncle Jeff's workwear archive"
          fill
          priority
          sizes="100vw"
        />
      </section>

      <section className="home-products" aria-label="Products">
        <div className="home-product-grid">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={index < 4}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
