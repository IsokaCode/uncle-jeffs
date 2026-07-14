import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetails } from "@/components/ProductDetails";
import { getProductByHandle, getProducts } from "@/lib/shopify";

type ProductPageProps = {
  params: {
    handle: string;
  };
};

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ handle: product.handle }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductByHandle(params.handle);
  return {
    title: product?.title ?? "Product",
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductByHandle(params.handle);

  if (!product) {
    notFound();
  }

  return (
    <div className="product-page">
      <ProductDetails product={product} />
    </div>
  );
}
