import { describe, expect, it } from "vitest";

import { parseConfirmedOrderFromWebhook } from "./webhook-utils";

describe("parseConfirmedOrderFromWebhook", () => {
  it("extrai orderId e paymentId de transparent.completed (Pix)", () => {
    const result = parseConfirmedOrderFromWebhook({
      event: "transparent.completed",
      data: {
        transparent: { id: "char_1", externalId: "order-1", status: "PAID" },
      },
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.orderId).toBe("order-1");
    expect(result.paymentId).toBe("char_1");
  });

  it("extrai orderId e paymentId de checkout.completed (cartão)", () => {
    const result = parseConfirmedOrderFromWebhook({
      event: "checkout.completed",
      data: {
        checkout: { id: "bill_1", externalId: "order-2", status: "PAID" },
      },
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.orderId).toBe("order-2");
    expect(result.paymentId).toBe("bill_1");
  });

  it("ignora eventos não suportados", () => {
    const result = parseConfirmedOrderFromWebhook({
      event: "checkout.refunded",
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.ignored).toBe(true);
  });

  it("falha quando faltam id/externalId", () => {
    const result = parseConfirmedOrderFromWebhook({
      event: "checkout.completed",
      data: { checkout: { status: "PAID" } },
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.ignored).toBe(false);
  });
});
