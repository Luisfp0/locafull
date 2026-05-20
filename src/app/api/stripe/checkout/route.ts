import { NextResponse } from "next/server";

import {
  formatDeliveryAddress,
  validateOrderCheckoutPayload,
} from "@/components/order/utils";
import {
  buildPricingLineItemName,
  findPricingPlanPrice,
  findPricingProduct,
} from "@/components/pricing/utils";
import { SITE_URL } from "@/lib/constants";
import { ROUTES } from "@/lib/routes";
import { getStripe } from "@/lib/stripe";
import { getStripePaymentMethodTypes } from "@/lib/stripe-payment-methods";

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

  try {
    const stripe = getStripe();
    const baseUrl = SITE_URL.replace(/\/$/, "");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: getStripePaymentMethodTypes(),
      customer_email: data.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "brl",
            unit_amount: priceCents,
            product_data: {
              name: lineItemName,
            },
          },
        },
      ],
      success_url: `${baseUrl}${ROUTES.checkoutSuccess}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}${ROUTES.checkoutCancel}`,
      metadata: {
        productId: data.productId,
        planId: data.planId,
        customerName: data.name,
        phone: data.phone,
        postalCode: data.postalCode,
        street: data.street,
        number: data.number,
        complement: data.complement ?? "",
        neighborhood: data.neighborhood,
        city: data.city,
        notes: data.notes ?? "",
        deliveryAddress: formatDeliveryAddress(data),
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Não foi possível iniciar o pagamento. Tente novamente." },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[stripe checkout]", error);
    return NextResponse.json(
      { error: "Erro ao criar sessão de pagamento. Tente novamente." },
      { status: 500 },
    );
  }
}
