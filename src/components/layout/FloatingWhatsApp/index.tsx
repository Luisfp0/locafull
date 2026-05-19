import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import { buildWaLink } from "@/lib/utils";

import type { FloatingWhatsAppProps } from "./types";

export function FloatingWhatsApp({ className }: FloatingWhatsAppProps) {
  return (
    <a
      href={buildWaLink(WHATSAPP_NUMBER)}
      target="_blank"
      rel="noopener noreferrer"
      className={`bg-success shadow-brand fixed right-6 bottom-6 z-40 flex size-14 items-center justify-center rounded-full text-white transition-transform hover:scale-105 ${className ?? ""}`}
      aria-label="Falar no WhatsApp"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
