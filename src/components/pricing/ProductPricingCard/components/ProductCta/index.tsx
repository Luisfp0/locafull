import Link from "next/link";

import { Button } from "@/components/ui/button";
import { buildOrderHref } from "@/components/pricing/utils";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import { buildWaLink } from "@/lib/utils";

import type { ProductCtaProps } from "../../types";

export function ProductCta({ product, defaultPlanId }: ProductCtaProps) {
  if (!product.orderEnabled || !defaultPlanId) {
    return (
      <Button className="w-full sm:w-auto" variant="whatsapp" asChild>
        <a
          href={buildWaLink(
            WHATSAPP_NUMBER,
            `Olá! Gostaria de um orçamento para ${product.name}.`,
          )}
          target="_blank"
          rel="noopener noreferrer"
        >
          {product.ctaLabel}
        </a>
      </Button>
    );
  }

  return (
    <Button className="w-full sm:w-auto" asChild>
      <Link href={buildOrderHref(product.id, defaultPlanId)}>
        {product.ctaLabel}
      </Link>
    </Button>
  );
}
