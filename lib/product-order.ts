import type { Product } from "@/lib/products";

const productOrderSeed = "uncle-jeffs-product-order-2026-07";

function hashString(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

export function getDisplayProducts(products: Product[]) {
  return [...products].sort((first, second) => {
    const firstOrder = hashString(`${productOrderSeed}:${first.handle}`);
    const secondOrder = hashString(`${productOrderSeed}:${second.handle}`);

    return firstOrder - secondOrder || first.title.localeCompare(second.title);
  });
}
