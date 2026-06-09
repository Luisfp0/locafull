import { describe, expect, it } from "vitest";

import { formatIsoDateLocal } from "@/lib/scheduling/list-name";

import { formatDeliveryAddress, validateOrderCheckoutPayload } from "./utils";

function nextDeliveryDateIso(): string {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + 1);

  while (date.getDay() === 0) {
    date.setDate(date.getDate() + 1);
  }

  return formatIsoDateLocal(date);
}

const validPayload = {
  productId: "mini-dumpster",
  planId: "48h",
  scheduledDate: nextDeliveryDateIso(),
  name: "Maria Silva",
  email: "maria@example.com",
  phone: "(62) 99999-8888",
  postalCode: "74000-000",
  street: "Rua das Flores",
  number: "123",
  complement: "Apto 4",
  neighborhood: "Setor Bueno",
  city: "Goiânia",
  notes: "Portão azul",
};

describe("validateOrderCheckoutPayload", () => {
  it("accepts valid payload", () => {
    const result = validateOrderCheckoutPayload(validPayload);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.phone).toBe("62999998888");
      expect(result.data.postalCode).toBe("74000000");
      expect(result.data.complement).toBe("Apto 4");
    }
  });

  it("rejects invalid email", () => {
    const result = validateOrderCheckoutPayload({
      ...validPayload,
      email: "invalid",
    });

    expect(result).toEqual({
      success: false,
      error: "Informe um e-mail válido.",
    });
  });

  it("rejects short phone", () => {
    const result = validateOrderCheckoutPayload({
      ...validPayload,
      phone: "123",
    });

    expect(result).toEqual({
      success: false,
      error: "Informe um telefone válido.",
    });
  });

  it("rejects invalid postal code", () => {
    const result = validateOrderCheckoutPayload({
      ...validPayload,
      postalCode: "7400",
    });

    expect(result).toEqual({
      success: false,
      error: "Informe um CEP válido (8 dígitos).",
    });
  });

  it("rejects missing scheduled date", () => {
    const result = validateOrderCheckoutPayload({
      ...validPayload,
      scheduledDate: "",
    });

    expect(result).toEqual({
      success: false,
      error: "Selecione uma data de entrega válida.",
    });
  });
});

describe("formatDeliveryAddress", () => {
  it("formats full address with complement", () => {
    const result = validateOrderCheckoutPayload(validPayload);
    expect(result.success).toBe(true);

    if (result.success) {
      expect(formatDeliveryAddress(result.data)).toBe(
        "Rua das Flores, 123 · Apto 4 · Setor Bueno · Goiânia — CEP 74000000",
      );
    }
  });
});
