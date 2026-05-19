import Link from "next/link";

import { PlaceholderPage } from "@/components/layout/PlaceholderPage";
import { SiteShell } from "@/components/layout/SiteShell";
import {
  findPricingPlanLabel,
  findPricingProduct,
} from "@/components/pricing/utils";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

import { OrderActions } from "./components/OrderActions";
import { OrderSummaryRow } from "./components/OrderSummaryRow";
import type { OrderPageProps } from "./types";

export function OrderPage({ productId, planId }: OrderPageProps) {
  const product = productId ? findPricingProduct(productId) : undefined;
  const planLabel =
    productId && planId ? findPricingPlanLabel(productId, planId) : undefined;

  if (product && planLabel) {
    return (
      <SiteShell>
        <section className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-headline-4 text-primary font-bold">Pedido</h1>
          <div className="flex flex-col gap-6">
            <p className="text-foreground text-base">Você selecionou:</p>
            <dl className="border-border flex flex-col gap-3 rounded-xl border bg-white p-6">
              <OrderSummaryRow label="Equipamento" value={product.name} />
              <OrderSummaryRow label="Plano" value={planLabel} />
            </dl>
            <p className="text-foreground text-sm leading-relaxed">
              Em breve você poderá concluir o pedido e o pagamento (PIX ou
              dinheiro) por aqui. Por enquanto, confirme pelo WhatsApp ou
              aguarde a próxima etapa do checkout.
            </p>
            <OrderActions />
          </div>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <PlaceholderPage
        title="Pedido"
        description="Escolha um equipamento e plano na página de valores antes de solicitar."
      />
      {/* overlap intencional com PlaceholderPage */}
      <div className="mx-auto -mt-8 flex justify-center pb-16">
        <Button asChild>
          <Link href={ROUTES.pricing}>Ver valores e equipamentos</Link>
        </Button>
      </div>
    </SiteShell>
  );
}
