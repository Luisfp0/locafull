import { HowItWorks } from "@/components/pricing/HowItWorks";
import { PaymentNotice } from "@/components/pricing/PaymentNotice";
import { ProductPricingCard } from "@/components/pricing/ProductPricingCard";
import { PRICING_PRODUCTS } from "@/components/pricing/constants";

import { PricingPageClient } from "./components/PricingPageClient";
import { PricingPageFooter } from "./components/PricingPageFooter";
import type { PricingPageProps } from "./types";

export function PricingPage({
  className,
  productId,
  planId,
}: PricingPageProps) {
  return (
    <PricingPageClient productId={productId} planId={planId}>
      <section className="bg-gray-50 pb-6">
        <div
          className={`mx-auto flex max-w-7xl flex-col gap-16 px-4 sm:px-6 lg:px-8 ${className ?? ""}`}
        >
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-8">
              <header className="flex flex-col gap-4 text-center">
                <h1 className="text-primary text-headline-4 sm:text-headline-3 font-bold">
                  Valores e equipamentos
                </h1>
                <p className="text-foreground mx-auto max-w-2xl text-base leading-relaxed">
                  Confira preços, combos e condições de locação em Goiânia e
                  região. Entrega e retirada no local.
                </p>
              </header>
              <PaymentNotice />
            </div>
            <div className="flex flex-col gap-10">
              {PRICING_PRODUCTS.map((product) => (
                <ProductPricingCard key={product.id} product={product} />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-12">
            <HowItWorks />
            <PricingPageFooter />
          </div>
        </div>
      </section>
    </PricingPageClient>
  );
}
