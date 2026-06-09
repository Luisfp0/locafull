import { NextResponse } from "next/server";

import type { OrderPaymentMethod } from "@/lib/orders/types";
import { validateOrderCheckoutPayload } from "@/components/order/utils";
import {
  buildPricingLineItemName,
  buildOrderHref,
  findAbacateProductId,
  findPricingPlanPrice,
  findPricingProduct,
} from "@/components/pricing/utils";
import { createCardCheckout } from "@/lib/abacatepay/create-card-checkout";
import { createPixCharge } from "@/lib/abacatepay/create-pix-charge";
import { SITE_URL } from "@/lib/constants";
import { insertPendingOrder } from "@/lib/orders/insert-pending-order";
import { ROUTES } from "@/lib/routes";
import { getSlotsRemainingForDate } from "@/lib/scheduling/get-delivery-date-availability";

export const runtime = "nodejs";

function readPaymentMethod(body: unknown): OrderPaymentMethod | null {
  const value = (body as { paymentMethod?: unknown } | null)?.paymentMethod;
  return value === "pix" || value === "card" ? value : null;
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corpo da requisição inválido." },
      { status: 400 },
    );
  }

  const validation = validateOrderCheckoutPayload(body);

  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const paymentMethod = readPaymentMethod(body);

  if (!paymentMethod) {
    return NextResponse.json(
      { error: "Selecione a forma de pagamento." },
      { status: 400 },
    );
  }

  const { data } = validation;
  const product = findPricingProduct(data.productId);

  if (!product?.orderEnabled) {
    return NextResponse.json(
      { error: "Este equipamento não está disponível para pedido online." },
      { status: 400 },
    );
  }

  const priceCents = findPricingPlanPrice(data.productId, data.planId);
  const lineItemName = buildPricingLineItemName(data.productId, data.planId);

  if (!priceCents || !lineItemName) {
    return NextResponse.json(
      { error: "Plano ou preço inválido para este equipamento." },
      { status: 400 },
    );
  }

  const slotsRemaining = await getSlotsRemainingForDate(data.scheduledDate);

  if (typeof slotsRemaining === "object") {
    return NextResponse.json({ error: slotsRemaining.error }, { status: 502 });
  }

  if (slotsRemaining < 1) {
    return NextResponse.json(
      { error: "Data indisponível, escolha outra." },
      { status: 400 },
    );
  }

  const pending = await insertPendingOrder({
    payload: data,
    amountCents: priceCents,
    paymentMethod,
  });

  if ("error" in pending) {
    return NextResponse.json({ error: pending.error }, { status: 500 });
  }

  const { orderId } = pending;
  const baseUrl = SITE_URL.replace(/\/$/, "");

  if (paymentMethod === "pix") {
    const result = await createPixCharge({
      amountCents: priceCents,
      description: lineItemName,
      externalId: orderId,
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }

    return NextResponse.json({
      method: "pix" as const,
      orderId,
      brCode: result.charge.brCode,
      brCodeBase64: result.charge.brCodeBase64,
      expiresAt: result.charge.expiresAt,
    });
  }

  const abacateProductId = findAbacateProductId(data.productId, data.planId);

  if (!abacateProductId) {
    return NextResponse.json(
      {
        error: "Pagamento com cartão indisponível para este plano. Tente Pix.",
      },
      { status: 400 },
    );
  }

  const checkout = await createCardCheckout({
    abacateProductId,
    externalId: orderId,
    completionUrl: `${baseUrl}${ROUTES.checkoutSuccess}?orderId=${orderId}`,
    returnUrl: `${baseUrl}${buildOrderHref(data.productId, data.planId)}`,
  });

  if ("error" in checkout) {
    return NextResponse.json({ error: checkout.error }, { status: 502 });
  }

  return NextResponse.json({
    method: "card" as const,
    orderId,
    url: checkout.checkout.url,
  });
}
