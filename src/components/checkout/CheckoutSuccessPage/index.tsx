import { CheckoutResultLayout } from "@/components/checkout/components/CheckoutResultLayout";

import { CheckoutSuccessActions } from "./components/CheckoutSuccessActions";

export function CheckoutSuccessPage() {
  return (
    <CheckoutResultLayout
      title="Pagamento recebido"
      description="Obrigado pelo seu pedido! Assim que o pagamento for confirmado, nossa equipe entrará em contato para combinar a entrega."
      actions={<CheckoutSuccessActions />}
    />
  );
}
