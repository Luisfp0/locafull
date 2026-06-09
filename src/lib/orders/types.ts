export type OrderPaymentMethod = "pix" | "card";

export type OrderStatus = "pending" | "paid" | "expired" | "cancelled";

export type OrderInsertRow = {
  id: string;
  payment_provider: "abacatepay";
  payment_method: OrderPaymentMethod;
  payment_id: string | null;
  status: OrderStatus;
  product_id: string;
  plan_id: string;
  amount_cents: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  postal_code: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  notes: string | null;
  delivery_address: string;
  scheduled_date: string | null;
};
