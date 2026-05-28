import type { OrderPaymentMethod } from "@/components/order/types";

export const PAYMENT_METHOD_OPTIONS: {
  id: OrderPaymentMethod;
  label: string;
  hint: string;
}[] = [
  { id: "pix", label: "Pix", hint: "Na hora, sem sair do site" },
  { id: "card", label: "Cartão de crédito", hint: "Parcelamento disponível" },
];
