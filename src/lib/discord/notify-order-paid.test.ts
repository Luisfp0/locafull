import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { OrderInsertRow } from "@/lib/orders/types";

import { buildOrderPaidDiscordEmbed } from "./build-message";
import { notifyOrderPaidOnDiscord } from "./notify-order-paid";

const baseRow: OrderInsertRow = {
  id: "order-1",
  payment_provider: "abacatepay",
  payment_method: "pix",
  payment_id: "pix_char_test",
  status: "paid",
  product_id: "mini-dumpster",
  plan_id: "48h",
  amount_cents: 18000,
  customer_name: "Maria Silva",
  customer_email: "maria@test.com",
  customer_phone: "62999999999",
  postal_code: "74000000",
  street: "Rua A",
  number: "10",
  complement: null,
  neighborhood: "Centro",
  city: "Goiânia",
  notes: null,
  delivery_address: "Rua A, 10 — Centro · Goiânia",
  scheduled_date: "2026-07-09",
};

describe("buildOrderPaidDiscordEmbed", () => {
  it("includes customer and delivery details", () => {
    const embed = buildOrderPaidDiscordEmbed(baseRow);

    expect(embed.title).toBe("Nova venda aprovada");
    expect(
      embed.fields.some((field) => field.value.includes("Maria Silva")),
    ).toBe(true);
    expect(embed.fields.some((field) => field.name === "Data de entrega")).toBe(
      true,
    );
  });
});

describe("notifyOrderPaidOnDiscord", () => {
  beforeEach(() => {
    vi.stubEnv(
      "DISCORD_WEBHOOK_URL",
      "https://discord.com/api/webhooks/123/abc-token",
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("posts embed to Discord webhook", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    const result = await notifyOrderPaidOnDiscord(baseRow);

    expect(result).toEqual({ sent: true });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://discord.com/api/webhooks/123/abc-token",
      expect.objectContaining({ method: "POST" }),
    );

    const body = JSON.parse(
      (fetchMock.mock.calls[0]?.[1] as RequestInit).body as string,
    );
    expect(body.embeds[0].title).toBe("Nova venda aprovada");
  });

  it("skips when webhook URL is missing", async () => {
    vi.stubEnv("DISCORD_WEBHOOK_URL", "");

    const result = await notifyOrderPaidOnDiscord(baseRow);

    expect(result).toEqual({ sent: false, skipped: true });
  });
});
