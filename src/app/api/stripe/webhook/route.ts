import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { insertOrderFromCheckoutSession } from "@/lib/orders/insert-order";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[stripe webhook] STRIPE_WEBHOOK_SECRET is not configured.");
    return NextResponse.json(
      { error: "Webhook secret not configured." },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header." },
      { status: 400 },
    );
  }

  const payload = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid signature.";
    console.error("[stripe webhook]", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const result = await insertOrderFromCheckoutSession(session);

    if ("error" in result) {
      console.error("[stripe webhook] order persist failed", {
        sessionId: session.id,
        error: result.error,
      });
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    console.info("[stripe webhook] checkout.session.completed", {
      sessionId: session.id,
      orderInserted: result.inserted,
    });
  }

  return NextResponse.json({ received: true });
}
