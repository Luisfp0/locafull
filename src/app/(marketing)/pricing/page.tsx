import { PricingPage } from "@/components/pricing/PricingPage";
import { SiteShell } from "@/components/layout/SiteShell";

export const metadata = {
  title: "Valores e equipamentos",
  description:
    "Tabela de preços de mini caçambas, tambores e barris Locafull em Goiânia. Pagamento via PIX ou dinheiro.",
};

export default function Page() {
  return (
    <SiteShell>
      <PricingPage />
    </SiteShell>
  );
}
