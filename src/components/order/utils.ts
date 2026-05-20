import type { OrderCheckoutPayload } from "./types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function validateOrderCheckoutPayload(
  payload: unknown,
):
  | { success: true; data: OrderCheckoutPayload }
  | { success: false; error: string } {
  if (!payload || typeof payload !== "object") {
    return { success: false, error: "Dados inválidos." };
  }

  const input = payload as Record<string, unknown>;

  const productId = String(input.productId ?? "").trim();
  const planId = String(input.planId ?? "").trim();
  const name = String(input.name ?? "").trim();
  const email = String(input.email ?? "").trim();
  const phone = digitsOnly(String(input.phone ?? ""));
  const postalCode = digitsOnly(String(input.postalCode ?? ""));
  const street = String(input.street ?? "").trim();
  const number = String(input.number ?? "").trim();
  const complement = String(input.complement ?? "").trim();
  const neighborhood = String(input.neighborhood ?? "").trim();
  const city = String(input.city ?? "").trim();
  const notes = String(input.notes ?? "").trim();

  if (!productId || !planId) {
    return { success: false, error: "Produto ou plano inválido." };
  }

  if (name.length < 3) {
    return { success: false, error: "Informe seu nome completo." };
  }

  if (!EMAIL_PATTERN.test(email)) {
    return { success: false, error: "Informe um e-mail válido." };
  }

  if (phone.length < 10) {
    return { success: false, error: "Informe um telefone válido." };
  }

  if (postalCode.length !== 8) {
    return { success: false, error: "Informe um CEP válido (8 dígitos)." };
  }

  if (!street || !number || !neighborhood || !city) {
    return { success: false, error: "Preencha o endereço de entrega." };
  }

  return {
    success: true,
    data: {
      productId,
      planId,
      name,
      email,
      phone,
      postalCode,
      street,
      number,
      complement: complement || undefined,
      neighborhood,
      city,
      notes: notes || undefined,
    },
  };
}

export function formatDeliveryAddress(data: OrderCheckoutPayload): string {
  const parts = [
    `${data.street}, ${data.number}`,
    data.complement,
    data.neighborhood,
    `${data.city} — CEP ${data.postalCode}`,
  ].filter(Boolean);

  return parts.join(" · ");
}
