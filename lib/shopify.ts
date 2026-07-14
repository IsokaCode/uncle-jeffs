import { getProduct, products as fallbackProducts, type Product } from "@/lib/products";

const SHOPIFY_API_VERSION = "2026-07";

type MoneyV2 = {
  amount: string;
  currencyCode: string;
};

type ShopifyImage = {
  url: string;
  altText: string | null;
};

type ShopifyProductNode = {
  id: string;
  handle: string;
  title: string;
  availableForSale: boolean;
  featuredImage: ShopifyImage | null;
  images: {
    nodes: ShopifyImage[];
  };
  options: {
    name: string;
    values: string[];
  }[];
  variants: {
    nodes: {
      id: string;
      availableForSale: boolean;
      price: MoneyV2;
      selectedOptions: {
        name: string;
        value: string;
      }[];
    }[];
  };
  sizingMen: {
    value: string;
  } | null;
  sizingWomen: {
    value: string;
  } | null;
};

type ShopifyProductsResponse = {
  products: {
    nodes: ShopifyProductNode[];
  };
};

type ShopifyProductResponse = {
  product: ShopifyProductNode | null;
};

type ShopifyCartCreateResponse = {
  cartCreate: {
    cart: {
      id: string;
      checkoutUrl: string;
    } | null;
    userErrors: {
      field: string[] | null;
      message: string;
    }[];
  };
};

export type CheckoutLine = {
  merchandiseId: string;
  quantity: number;
};

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

export function isShopifyConfigured() {
  return Boolean(domain && token);
}

function getShopifyEndpoint() {
  if (!domain) {
    throw new Error("SHOPIFY_STORE_DOMAIN is not configured.");
  }

  const shopDomain = domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return `https://${shopDomain}/api/${SHOPIFY_API_VERSION}/graphql.json`;
}

async function shopifyFetch<TData>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<TData> {
  if (!token) {
    throw new Error("SHOPIFY_STOREFRONT_ACCESS_TOKEN is not configured.");
  }

  const response = await fetch(getShopifyEndpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`Shopify request failed with ${response.status}.`);
  }

  const payload = (await response.json()) as {
    data?: TData;
    errors?: { message: string }[];
  };

  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join(" "));
  }

  if (!payload.data) {
    throw new Error("Shopify response did not include data.");
  }

  return payload.data;
}

const productFields = `
  id
  handle
  title
  availableForSale
  featuredImage {
    url
    altText
  }
  images(first: 8) {
    nodes {
      url
      altText
    }
  }
  options {
    name
    values
  }
  variants(first: 1) {
    nodes {
      id
      availableForSale
      price {
        amount
        currencyCode
      }
      selectedOptions {
        name
        value
      }
    }
  }
  sizingMen: metafield(namespace: "custom", key: "sizing_men") {
    value
  }
  sizingWomen: metafield(namespace: "custom", key: "sizing_women") {
    value
  }
`;

const productsQuery = `
  query Products {
    products(first: 100, sortKey: CREATED_AT, reverse: false) {
      nodes {
        ${productFields}
      }
    }
  }
`;

const productByHandleQuery = `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      ${productFields}
    }
  }
`;

const cartCreateMutation = `
  mutation CartCreate($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

function formatPrice(price: MoneyV2 | undefined) {
  if (!price) return "$0.00 USD";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: price.currencyCode,
  }).format(Number(price.amount)) + ` ${price.currencyCode}`;
}

function getColor(product: ShopifyProductNode, fallback?: Product) {
  const colorOption = product.options.find(
    (option) => option.name.toLowerCase() === "color",
  );
  const variantColor = product.variants.nodes[0]?.selectedOptions.find(
    (option) => option.name.toLowerCase() === "color",
  );

  return (
    variantColor?.value ??
    colorOption?.values[0] ??
    fallback?.color ??
    ""
  );
}

function mapShopifyProduct(product: ShopifyProductNode): Product {
  const fallback = getProduct(product.handle);
  const variant = product.variants.nodes[0];
  const images = product.images.nodes.length
    ? product.images.nodes.map((image) => image.url)
    : product.featuredImage?.url
      ? [product.featuredImage.url]
      : fallback?.images ?? [];

  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    price: formatPrice(variant?.price),
    available: product.availableForSale && Boolean(variant?.availableForSale),
    color: getColor(product, fallback),
    images,
    sizingMen: product.sizingMen?.value ?? fallback?.sizingMen ?? "M/L",
    sizingWomen: product.sizingWomen?.value ?? fallback?.sizingWomen ?? "S/M",
    variantId: variant?.id,
  };
}

export async function getProducts(): Promise<Product[]> {
  if (!isShopifyConfigured()) {
    return fallbackProducts;
  }

  try {
    const data = await shopifyFetch<ShopifyProductsResponse>(productsQuery);
    if (!data.products.nodes.length) {
      console.warn("Shopify returned no products. Falling back to local products.");
      return fallbackProducts;
    }

    return data.products.nodes.map(mapShopifyProduct);
  } catch (error) {
    console.error(error);
    return fallbackProducts;
  }
}

export async function getProductByHandle(handle: string): Promise<Product | undefined> {
  if (!isShopifyConfigured()) {
    return getProduct(handle);
  }

  try {
    const data = await shopifyFetch<ShopifyProductResponse>(
      productByHandleQuery,
      { handle },
    );
    return data.product ? mapShopifyProduct(data.product) : getProduct(handle);
  } catch (error) {
    console.error(error);
    return getProduct(handle);
  }
}

export async function createCheckout(lines: CheckoutLine[]) {
  const data = await shopifyFetch<ShopifyCartCreateResponse>(
    cartCreateMutation,
    {
      lines: lines.map((line) => ({
        merchandiseId: line.merchandiseId,
        quantity: line.quantity,
      })),
    },
  );

  const errors = data.cartCreate.userErrors;
  if (errors.length) {
    throw new Error(errors.map((error) => error.message).join(" "));
  }

  if (!data.cartCreate.cart) {
    throw new Error("Shopify did not return a cart.");
  }

  return data.cartCreate.cart;
}
