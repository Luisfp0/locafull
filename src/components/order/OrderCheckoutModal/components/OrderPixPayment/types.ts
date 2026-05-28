export type OrderPixPaymentProps = {
  orderId: string;
  brCode: string;
  brCodeBase64: string;
  expiresAt: string | null;
  onConfirmed: () => void;
};
