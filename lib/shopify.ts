import { getProduct, products as fallbackProducts, type Product } from "@/lib/products";
import { getDisplayProducts } from "@/lib/product-order";

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
  description: string;
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
    cart: ShopifyCart | null;
    userErrors: {
      field: string[] | null;
      message: string;
    }[];
  };
};

type ShopifyCartResponse = {
  cart: ShopifyCart | null;
};

type ShopifyCartLinesAddResponse = {
  cartLinesAdd: {
    cart: ShopifyCart | null;
    userErrors: {
      field: string[] | null;
      message: string;
    }[];
  };
};

type ShopifyCartLinesUpdateResponse = {
  cartLinesUpdate: {
    cart: ShopifyCart | null;
    userErrors: {
      field: string[] | null;
      message: string;
    }[];
  };
};

type ShopifyCartLinesRemoveResponse = {
  cartLinesRemove: {
    cart: ShopifyCart | null;
    userErrors: {
      field: string[] | null;
      message: string;
    }[];
  };
};

export type ShopifyCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: MoneyV2;
    totalAmount: MoneyV2;
  };
  lines: {
    nodes: ShopifyCartLine[];
  };
};

export type ShopifyCartLine = {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    selectedOptions: {
      name: string;
      value: string;
    }[];
    product: {
      id: string;
      handle: string;
      title: string;
      featuredImage: ShopifyImage | null;
    };
    price: MoneyV2;
  };
  cost: {
    totalAmount: MoneyV2;
  };
};

export type CheckoutLine = {
  merchandiseId: string;
  quantity: number;
};

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const SHOPIFY_FETCH_TIMEOUT_MS = 12_000;

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
    signal: AbortSignal.timeout(SHOPIFY_FETCH_TIMEOUT_MS),
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
  description
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

const cartFields = `
  id
  checkoutUrl
  totalQuantity
  cost {
    subtotalAmount {
      amount
      currencyCode
    }
    totalAmount {
      amount
      currencyCode
    }
  }
  lines(first: 100) {
    nodes {
      id
      quantity
      cost {
        totalAmount {
          amount
          currencyCode
        }
      }
      merchandise {
        ... on ProductVariant {
          id
          title
          price {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
          product {
            id
            handle
            title
            featuredImage {
              url
              altText
            }
          }
        }
      }
    }
  }
`;

const cartCreateMutation = `
  mutation CartCreate($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart {
        ${cartFields}
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const cartQuery = `
  query Cart($id: ID!) {
    cart(id: $id) {
      ${cartFields}
    }
  }
`;

const cartLinesAddMutation = `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ${cartFields}
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const cartLinesUpdateMutation = `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ${cartFields}
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const cartLinesRemoveMutation = `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ${cartFields}
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

function getDescriptionParts(product: ShopifyProductNode, fallback?: Product) {
  const description = product.description.replace(/\r\n/g, "\n").trim();

  if (!description) {
    return {
      description: fallback?.description ?? "",
      measurements: fallback?.measurements ?? "",
    };
  }

  const match = description.match(/\bMeasurements\s*:/i);

  if (!match || match.index === undefined) {
    return {
      description,
      measurements: fallback?.measurements ?? "",
    };
  }

  return {
    description: description.slice(0, match.index).trim(),
    measurements: description.slice(match.index + match[0].length).trim(),
  };
}

function mapShopifyProduct(product: ShopifyProductNode): Product {
  const fallback = getProduct(product.handle);
  const variant = product.variants.nodes[0];
  const descriptionParts = getDescriptionParts(product, fallback);
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
    description: descriptionParts.description,
    measurements: descriptionParts.measurements,
    variantId: variant?.id,
  };
}

export async function getProducts(): Promise<Product[]> {
  if (!isShopifyConfigured()) {
    return getDisplayProducts(fallbackProducts);
  }

  try {
    const data = await shopifyFetch<ShopifyProductsResponse>(productsQuery);
    if (!data.products.nodes.length) {
      console.warn("Shopify returned no products. Falling back to local products.");
      return getDisplayProducts(fallbackProducts);
    }

    return getDisplayProducts(data.products.nodes.map(mapShopifyProduct));
  } catch (error) {
    console.error(error);
    return getDisplayProducts(fallbackProducts);
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

function handleCartUserErrors(errors: { message: string }[]) {
  if (errors.length) {
    throw new Error(errors.map((error) => error.message).join(" "));
  }
}

function requireCart(cart: ShopifyCart | null) {
  if (!cart) {
    throw new Error("Shopify did not return a cart.");
  }

  return cart;
}

export async function getCart(cartId: string) {
  const data = await shopifyFetch<ShopifyCartResponse>(cartQuery, {
    id: cartId,
  });

  return data.cart;
}

export async function createCart(lines: CheckoutLine[]) {
  const data = await shopifyFetch<ShopifyCartCreateResponse>(
    cartCreateMutation,
    {
      lines: lines.map((line) => ({
        merchandiseId: line.merchandiseId,
        quantity: line.quantity,
      })),
    },
  );

  handleCartUserErrors(data.cartCreate.userErrors);

  return requireCart(data.cartCreate.cart);
}

export async function createCheckout(lines: CheckoutLine[]) {
  return createCart(lines);
}

export async function addCartLines(cartId: string, lines: CheckoutLine[]) {
  const data = await shopifyFetch<ShopifyCartLinesAddResponse>(
    cartLinesAddMutation,
    {
      cartId,
      lines: lines.map((line) => ({
        merchandiseId: line.merchandiseId,
        quantity: line.quantity,
      })),
    },
  );

  handleCartUserErrors(data.cartLinesAdd.userErrors);
  return requireCart(data.cartLinesAdd.cart);
}

export async function updateCartLines(
  cartId: string,
  lines: { id: string; quantity: number }[],
) {
  const data = await shopifyFetch<ShopifyCartLinesUpdateResponse>(
    cartLinesUpdateMutation,
    {
      cartId,
      lines,
    },
  );

  handleCartUserErrors(data.cartLinesUpdate.userErrors);
  return requireCart(data.cartLinesUpdate.cart);
}

export async function removeCartLines(cartId: string, lineIds: string[]) {
  const data = await shopifyFetch<ShopifyCartLinesRemoveResponse>(
    cartLinesRemoveMutation,
    {
      cartId,
      lineIds,
    },
  );

  handleCartUserErrors(data.cartLinesRemove.userErrors);
  return requireCart(data.cartLinesRemove.cart);
}
