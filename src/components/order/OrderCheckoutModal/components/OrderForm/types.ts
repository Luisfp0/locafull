export type OrderFormProps = {
  productId: string;
  planId: string;
  onPaid: (orderId: string) => void;
};
