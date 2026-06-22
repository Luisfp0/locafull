"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

import { OrderCheckoutModal } from "@/components/order/OrderCheckoutModal";
import {
  findPricingPlanPrice,
  findPricingProduct,
} from "@/components/pricing/utils";
import { Modal } from "@/components/ui/Modal";
import { ROUTES } from "@/lib/routes";

import type { PricingPageClientProps } from "./types";

export function PricingPageClient({
  productId,
  planId,
  children,
}: PricingPageClientProps) {
  const router = useRouter();

  const product = productId ? findPricingProduct(productId) : undefined;
  const priceCents =
    productId && planId ? findPricingPlanPrice(productId, planId) : undefined;
  const isOpen = Boolean(product && planId && priceCents !== undefined);

  useEffect(() => {
    if (productId || planId) return;
    window.scrollTo(0, 0);
  }, [productId, planId]);

  const handleClose = useCallback(() => {
    window.history.replaceState(window.history.state, "", ROUTES.pricing);
    router.replace(ROUTES.pricing, { scroll: false });
  }, [router]);

  return (
    <>
      {children}
      <Modal open={isOpen} onClose={handleClose} title="Finalizar pedido">
        {isOpen && productId && planId ? (
          <OrderCheckoutModal
            productId={productId}
            planId={planId}
            onClose={handleClose}
          />
        ) : null}
      </Modal>
    </>
  );
}
