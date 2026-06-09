export type OrderCheckoutPayload = {
  productId: string;
  planId: string;
  scheduledDate: string;
  name: string;
  email: string;
  phone: string;
  postalCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  notes?: string;
};

export type OrderFormFieldValues = Omit<
  OrderCheckoutPayload,
  "productId" | "planId"
>;

export type OrderPaymentMethod = "pix" | "card";
