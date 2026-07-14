export function isShopifyImage(src: string) {
  return (
    src.startsWith("https://cdn.shopify.com/") ||
    src.startsWith("https://cdn.shopifycdn.net/")
  );
}

export function imageUrlFor(src: string, width: number) {
  if (!isShopifyImage(src)) {
    return src;
  }

  try {
    const url = new URL(src);
    url.searchParams.set("width", String(width));
    return url.toString();
  } catch {
    const separator = src.includes("?") ? "&" : "?";
    return `${src}${separator}width=${width}`;
  }
}
