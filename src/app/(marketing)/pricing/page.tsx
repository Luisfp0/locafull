import { PricingPage } from "@/components/pricing/PricingPage";
import { SiteShell } from "@/components/layout/SiteShell";

export const metadata = {
  title: "Valores e equipamentos",
  description:
    "Tabela de preços de mini caçambas, tambores e barris Locafull em Goiânia. Pagamento via PIX ou dinheiro.",
};

export default function PricingRoutePage() {
  return (
    <SiteShell>
      <div className="bg-gray-50 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PricingPage />
        </div>
      </div>
    </SiteShell>
  );
}
