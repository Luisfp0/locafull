import { NextResponse } from "next/server";

import type { AbacateWebhookEvent } from "@/lib/abacatepay/types";
import {
  isValidWebhookSecret,
  isValidWebhookSignature,
} from "@/lib/abacatepay/verify-webhook";
import { confirmOrderFromWebhook } from "@/lib/orders/confirm-order";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const url = new URL(request.url);

  if (!isValidWebhookSecret(url.searchParams.get("webhookSecret"))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-webhook-signature");

  if (!isValidWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let event: AbacateWebhookEvent;

  try {
    event = JSON.parse(rawBody) as AbacateWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const result = await confirmOrderFromWebhook(event);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
