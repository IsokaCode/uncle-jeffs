import { NextResponse } from "next/server";
import { createCheckout, isShopifyConfigured } from "@/lib/shopify";

export async function POST(request: Request) {
  if (!isShopifyConfigured()) {
    return NextResponse.json(
      { error: "Shopify is not configured on this deployment." },
      { status: 500 },
    );
  }

  try {
    const body = (await request.json()) as {
      lines?: {
        merchandiseId?: string;
        quantity?: number;
      }[];
    };

    const lines = (body.lines ?? [])
      .filter((line) => line.merchandiseId)
      .map((line) => ({
        merchandiseId: String(line.merchandiseId),
        quantity: Math.max(1, Number(line.quantity ?? 1)),
      }));

    if (!lines.length) {
      return NextResponse.json(
        { error: "No Shopify merchandise lines were provided." },
        { status: 400 },
      );
    }

    const cart = await createCheckout(lines);
    return NextResponse.json({ checkoutUrl: cart.checkoutUrl });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create checkout.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
