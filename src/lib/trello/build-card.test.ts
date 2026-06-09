import { describe, expect, it } from "vitest";

import type { OrderInsertRow } from "@/lib/orders/types";

import { buildTrelloCardFromOrder } from "./build-card";

const row: OrderInsertRow = {
  id: "11111111-1111-1111-1111-111111111111",
  payment_provider: "abacatepay",
  payment_method: "pix",
  payment_id: "pix_char_abc123xyz",
  status: "paid",
  product_id: "mini-dumpster",
  plan_id: "48h",
  amount_cents: 18000,
  customer_name: "Maria Silva",
  customer_email: "maria@exemplo.com",
  customer_phone: "62999999999",
  postal_code: "74000000",
  street: "Rua A",
  number: "10",
  complement: "casa 2",
  neighborhood: "Jardim América",
  city: "Goiânia",
  notes: "Entregar de manhã",
  delivery_address: "Rua A, 10 · Jardim América · Goiânia",
  scheduled_date: "2026-06-09",
};

describe("buildTrelloCardFromOrder", () => {
  it("monta título e descrição do card", () => {
    const card = buildTrelloCardFromOrder(row);

    expect(card.name).toBe("Mini caçamba — Jardim América");
    expect(card.desc).toContain("Nome: Maria Silva");
    expect(card.desc).toContain("Telefone: 62999999999");
    expect(card.desc).toContain("Rua A, 10 — casa 2");
    expect(card.desc).toContain("Plano: Aluguel 48h");
    expect(card.desc).toMatch(/Valor pago: R\$\s?180,00/);
    expect(card.desc).toContain("Observações: Entregar de manhã");
    expect(card.desc).toContain("Data de entrega:");
    expect(card.desc).toContain("pix_char_abc123xyz");
    expect(card.desc).toContain("Pix");
  });
});
