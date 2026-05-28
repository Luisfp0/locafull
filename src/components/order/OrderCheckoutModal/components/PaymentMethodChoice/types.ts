import type { OrderPaymentMethod } from "@/components/order/types";

export type PaymentMethodChoiceProps = {
  value: OrderPaymentMethod;
  onChange: (method: OrderPaymentMethod) => void;
  disabled?: boolean;
};
