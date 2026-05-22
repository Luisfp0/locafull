import {
  findPricingPlanLabel,
  findPricingPlanPrice,
  findPricingProduct,
} from "@/components/pricing/utils";
import { formatBRL } from "@/lib/utils";

import { OrderActions } from "./components/OrderActions";
import { OrderForm } from "./components/OrderForm";
import type { OrderCheckoutModalProps } from "./types";

export function OrderCheckoutModal({
  productId,
  planId,
  onClose,
}: OrderCheckoutModalProps) {
  const product = findPricingProduct(productId);
  const planLabel = findPricingPlanLabel(productId, planId);
  const priceCents = findPricingPlanPrice(productId, planId);

  if (!product || !planLabel || priceCents === undefined) {
    return null;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-baseline justify-between gap-3 rounded-xl bg-gray-50 px-4 py-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="text-primary truncate text-sm font-semibold">
            {product.name}
          </p>
          <p className="truncate text-sm text-gray-500">{planLabel}</p>
        </div>
        <p className="text-primary shrink-0 text-base font-bold">
          {formatBRL(priceCents)}
        </p>
      </div>

      <OrderForm productId={productId} planId={planId} />

      <OrderActions onClose={onClose} />
    </div>
  );
}
