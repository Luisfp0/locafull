import { Button } from "@/components/ui/button";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import { buildWaLink } from "@/lib/utils";

export function PricingPageFooter() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <h2 className="text-lg font-bold">Dúvidas ?</h2>
      <Button variant="whatsapp" size="lg" asChild>
        <a
          href={buildWaLink(WHATSAPP_NUMBER)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Falar no WhatsApp
        </a>
      </Button>
    </div>
  );
}
