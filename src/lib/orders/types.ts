export type OrderInsertRow = {
  stripe_session_id: string;
  status: "paid";
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
};
