export type OrderFormProps = {
  productId: string;
  planId: string;
  cardPaymentEnabled: boolean;
  onPaid: (orderId: string) => void;
};

export type PixState = {
  orderId: string;
  brCode: string;
  brCodeBase64: string;
  expiresAt: string | null;
};

export type OrdersApiResponse =
  | {
      method: "pix";
      orderId: string;
      brCode: string;
      brCodeBase64: string;
      expiresAt: string | null;
    }
  | { method: "card"; orderId: string; url: string }
  | { error: string };
