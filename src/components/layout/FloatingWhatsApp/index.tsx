import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import { buildWaLink } from "@/lib/utils";

import type { IFloatingWhatsApp } from "./types";

export function FloatingWhatsApp({ className }: IFloatingWhatsApp) {
  return (
    <a
      href={buildWaLink(WHATSAPP_NUMBER)}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-6 right-6 z-40 flex size-14 items-center justify-center rounded-full bg-[var(--success)] text-[var(--white)] shadow-[var(--box-shadow-1)] transition-transform hover:scale-105 ${className ?? ""}`}
      aria-label="Falar no WhatsApp"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
