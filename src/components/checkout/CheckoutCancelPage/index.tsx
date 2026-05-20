import { CheckoutResultLayout } from "@/components/checkout/components/CheckoutResultLayout";

import { CheckoutCancelActions } from "./components/CheckoutCancelActions";

export function CheckoutCancelPage() {
  return (
    <CheckoutResultLayout
      title="Pagamento cancelado"
      description="O pagamento não foi concluído. Você pode voltar ao pedido e tentar novamente quando quiser."
      actions={<CheckoutCancelActions />}
    />
  );
}
