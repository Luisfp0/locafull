import type Stripe from "stripe";
import { describe, expect, it } from "vitest";

import { buildOrderRowFromCheckoutSession } from "./utils";

function session(
  overrides: Partial<Stripe.Checkout.Session> = {},
): Stripe.Checkout.Session {
  return {
    id: "cs_test_123",
    amount_total: 18000,
    customer_details: { email: "cliente@exemplo.com" },
    metadata: {
      productId: "mini-dumpster",
      planId: "48h",
      customerName: "Maria Silva",
      phone: "62999999999",
      postalCode: "74000000",
      street: "Rua A",
      number: "10",
      complement: "",
      neighborhood: "Centro",
      city: "Goiânia",
      notes: "",
      deliveryAddress: "Rua A, 10 · Centro · Goiânia — CEP 74000000",
    },
    ...overrides,
  } as Stripe.Checkout.Session;
}

describe("buildOrderRowFromCheckoutSession", () => {
  it("monta linha do pedido a partir da sessão", () => {
    const result = buildOrderRowFromCheckoutSession(session());

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.row.stripe_session_id).toBe("cs_test_123");
    expect(result.row.product_id).toBe("mini-dumpster");
    expect(result.row.amount_cents).toBe(18000);
    expect(result.row.customer_email).toBe("cliente@exemplo.com");
  });

  it("falha sem metadados de produto", () => {
    const result = buildOrderRowFromCheckoutSession(
      session({ metadata: { planId: "48h" } as Stripe.Metadata }),
    );

    expect(result.success).toBe(false);
  });
});
