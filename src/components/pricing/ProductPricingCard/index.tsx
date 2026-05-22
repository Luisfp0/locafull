import { ChevronDown } from "lucide-react";
import Image from "next/image";

import { formatBRL } from "@/lib/utils";

import { ProductCombos } from "./components/ProductCombos";
import { ProductCta } from "./components/ProductCta";
import type { ProductPricingCardProps } from "./types";

export function ProductPricingCard({ product }: ProductPricingCardProps) {
  const defaultPlanId = product.plans[0]?.id ?? product.combos?.[0]?.id;

  return (
    <article
      id={`product-${product.id}`}
      className="shadow-brand border-border overflow-hidden rounded-2xl border bg-white"
    >
      <div className="md:grid md:grid-cols-2">
        <div className="relative aspect-[4/3] w-full md:aspect-auto md:min-h-full">
          <Image
            src={product.imageSrc}
            alt={product.imageAlt}
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        <div className="flex flex-col gap-6 p-6 sm:p-8">
          <div className="flex flex-col gap-1">
            <h2 className="text-primary text-2xl font-bold">{product.name}</h2>
            <p className="text-foreground text-sm">{product.capacity}</p>
          </div>

          {product.plans.length > 0 && (
            <ul className="flex flex-col gap-3">
              {product.plans.map((plan) => (
                <li
                  key={plan.id}
                  className="border-border flex items-baseline justify-between gap-4 border-b pb-3 last:border-0"
                >
                  <span className="text-foreground text-sm sm:text-base">
                    {plan.label}
                    {plan.note ? (
                      <span className="text-gray-500"> ({plan.note})</span>
                    ) : null}
                  </span>
                  <span className="text-warning shrink-0 text-base font-bold sm:text-lg">
                    {formatBRL(plan.priceCents)}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {product.combos && product.combos.length > 0 && (
            <ProductCombos product={product} />
          )}

          {product.rules.length > 0 && (
            <details className="group flex flex-col gap-3">
              <summary className="text-primary flex cursor-pointer list-none items-center gap-2 text-sm font-semibold marker:content-none [&::-webkit-details-marker]:hidden">
                <ChevronDown
                  className="size-4 shrink-0 transition-transform duration-200 group-open:rotate-180"
                  aria-hidden
                />
                Ver condições e observações
              </summary>
              <ul className="text-foreground flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed">
                {product.rules.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </details>
          )}

          <ProductCta product={product} defaultPlanId={defaultPlanId} />
        </div>
      </div>
    </article>
  );
}
