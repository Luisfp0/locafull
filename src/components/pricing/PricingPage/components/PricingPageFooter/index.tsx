import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import { buildWaLink } from "@/lib/utils";

export function PricingPageFooter() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <h2 className="text-lg font-bold">Dúvidas ?</h2>
      <a
        href={buildWaLink(WHATSAPP_NUMBER)}
        target="_blank"
        rel="noopener noreferrer"
        role="button"
        className="bg-success flex items-center gap-2 rounded-md p-3 text-xs text-white hover:opacity-90"
      >
        <WhatsAppIcon className="size-4" />
        Falar no WhatsApp
      </a>
    </div>
  );
}
