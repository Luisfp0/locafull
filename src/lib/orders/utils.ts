import type Stripe from "stripe";

import type { OrderInsertRow } from "./types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readMetadataString(
  metadata: Stripe.Metadata | null,
  key: string,
): string {
  return String(metadata?.[key] ?? "").trim();
}

export function buildOrderRowFromCheckoutSession(
  session: Stripe.Checkout.Session,
): { success: true; row: OrderInsertRow } | { success: false; error: string } {
  if (!session.id) {
    return { success: false, error: "Sessão Stripe sem id." };
  }

  const amountCents = session.amount_total;

  if (amountCents == null || amountCents <= 0) {
    return { success: false, error: "Valor do pedido inválido na sessão." };
  }

  const metadata = session.metadata;
  const productId = readMetadataString(metadata, "productId");
  const planId = readMetadataString(metadata, "planId");
  const customerName = readMetadataString(metadata, "customerName");
  const customerPhone = readMetadataString(metadata, "phone");
  const postalCode = readMetadataString(metadata, "postalCode");
  const street = readMetadataString(metadata, "street");
  const number = readMetadataString(metadata, "number");
  const complement = readMetadataString(metadata, "complement");
  const neighborhood = readMetadataString(metadata, "neighborhood");
  const city = readMetadataString(metadata, "city");
  const notes = readMetadataString(metadata, "notes");
  const deliveryAddress = readMetadataString(metadata, "deliveryAddress");

  const customerEmail = (
    session.customer_details?.email ??
    session.customer_email ??
    ""
  ).trim();

  if (!productId || !planId) {
    return { success: false, error: "Metadados de produto ou plano ausentes." };
  }

  if (customerName.length < 3) {
    return { success: false, error: "Nome do cliente ausente nos metadados." };
  }

  if (!EMAIL_PATTERN.test(customerEmail)) {
    return { success: false, error: "E-mail do cliente inválido na sessão." };
  }

  if (customerPhone.length < 10) {
    return { success: false, error: "Telefone ausente nos metadados." };
  }

  if (!deliveryAddress || !street || !number || !neighborhood || !city) {
    return { success: false, error: "Endereço de entrega incompleto." };
  }

  return {
    success: true,
    row: {
      stripe_session_id: session.id,
      status: "paid",
      product_id: productId,
      plan_id: planId,
      amount_cents: amountCents,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      postal_code: postalCode,
      street,
      number,
      complement: complement || null,
      neighborhood,
      city,
      notes: notes || null,
      delivery_address: deliveryAddress,
    },
  };
}

export function isDuplicateOrderError(error: { code?: string }): boolean {
  return error.code === "23505";
}
