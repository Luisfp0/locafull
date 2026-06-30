import { PricingPage } from "@/components/pricing/PricingPage";
import { SiteShell } from "@/components/layout/SiteShell";

export const metadata = {
  title: "Valores e equipamentos",
  description:
    "Tabela de preços de mini caçambas e tambores Locafull em Goiânia. Pagamento via Pix e cartão.",
};

type PricingRouteProps = {
  searchParams: Promise<{
    product?: string;
    plan?: string;
  }>;
};

export default async function Page({ searchParams }: PricingRouteProps) {
  const { product: productId, plan: planId } = await searchParams;

  return (
    <SiteShell>
      <PricingPage productId={productId} planId={planId} />
    </SiteShell>
  );
}
