import {
  findPricingPlanLabel,
  findPricingPlanPrice,
  findPricingProduct,
} from "@/components/pricing/utils";
import { formatBRL } from "@/lib/utils";

import { OrderActions } from "./components/OrderActions";
import { OrderForm } from "./components/OrderForm";
import { OrderSummaryRow } from "./components/OrderSummaryRow";
import type { OrderPageProps } from "./types";

export function OrderPage({ productId, planId }: OrderPageProps) {
  const product = productId ? findPricingProduct(productId) : undefined;
  const planLabel =
    productId && planId ? findPricingPlanLabel(productId, planId) : undefined;
  const priceCents =
    productId && planId ? findPricingPlanPrice(productId, planId) : undefined;

  if (!product || !planLabel || priceCents === undefined) {
    return null;
  }

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-8 pb-12">
      <div className="flex flex-col gap-2 text-center">
        <h2 className="text-primary text-2xl font-bold">Finalizar pedido</h2>
        <p className="text-foreground text-base">
          Preencha seus dados de entrega e pague com cartão para confirmar.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <dl className="border-border flex flex-col gap-3 rounded-xl border bg-white p-6">
          <OrderSummaryRow label="Equipamento" value={product.name} />
          <OrderSummaryRow label="Plano" value={planLabel} />
          <OrderSummaryRow label="Total" value={formatBRL(priceCents)} />
        </dl>

        <OrderForm productId={productId!} planId={planId!} />

        <OrderActions />
      </div>
    </section>
  );
}
