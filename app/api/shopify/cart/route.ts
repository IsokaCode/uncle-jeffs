import { NextResponse } from "next/server";
import {
  addCartLines,
  createCart,
  getCart,
  isShopifyConfigured,
  removeCartLines,
  updateCartLines,
} from "@/lib/shopify";

export async function GET(request: Request) {
  if (!isShopifyConfigured()) {
    return NextResponse.json(
      { error: "Shopify is not configured on this deployment." },
      { status: 500 },
    );
  }

  const cartId = new URL(request.url).searchParams.get("cartId");

  if (!cartId) {
    return NextResponse.json({ cart: null });
  }

  try {
    const cart = await getCart(cartId);
    return NextResponse.json({ cart });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load cart.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isShopifyConfigured()) {
    return NextResponse.json(
      { error: "Shopify is not configured on this deployment." },
      { status: 500 },
    );
  }

  try {
    const body = (await request.json()) as {
      action?: "add" | "update" | "remove";
      cartId?: string;
      merchandiseId?: string;
      lineId?: string;
      quantity?: number;
    };

    const action = body.action ?? "add";
    let cart;

    if (action === "add") {
      if (!body.merchandiseId) {
        return NextResponse.json(
          { error: "Missing merchandiseId." },
          { status: 400 },
        );
      }

      const line = {
        merchandiseId: body.merchandiseId,
        quantity: Math.max(1, Number(body.quantity ?? 1)),
      };

      cart = body.cartId
        ? await addCartLines(body.cartId, [line])
        : await createCart([line]);
    } else if (action === "update") {
      if (!body.cartId || !body.lineId) {
        return NextResponse.json(
          { error: "Missing cartId or lineId." },
          { status: 400 },
        );
      }

      cart = await updateCartLines(body.cartId, [
        {
          id: body.lineId,
          quantity: Math.max(0, Number(body.quantity ?? 1)),
        },
      ]);
    } else if (action === "remove") {
      if (!body.cartId || !body.lineId) {
        return NextResponse.json(
          { error: "Missing cartId or lineId." },
          { status: 400 },
        );
      }

      cart = await removeCartLines(body.cartId, [body.lineId]);
    } else {
      return NextResponse.json(
        { error: "Unsupported cart action." },
        { status: 400 },
      );
    }

    return NextResponse.json({ cart });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update cart.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
