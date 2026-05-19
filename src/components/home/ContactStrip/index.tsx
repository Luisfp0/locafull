import { Mail, MapPin, Phone } from "lucide-react";

import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import {
  ADDRESS,
  EMAIL,
  PHONE_DISPLAY,
  WHATSAPP_DISPLAY,
  WHATSAPP_NUMBER,
} from "@/lib/constants";
import { buildWaLink } from "@/lib/utils";

import type { IContactStrip } from "./types";

const CONTACT_ITEMS = [
  {
    label: "Telefone",
    value: PHONE_DISPLAY,
    href: `tel:+${WHATSAPP_NUMBER}`,
    icon: Phone,
  },
  {
    label: "WhatsApp",
    value: WHATSAPP_DISPLAY,
    href: buildWaLink(WHATSAPP_NUMBER),
    icon: WhatsAppIcon,
    external: true,
  },
  {
    label: "E-mail",
    value: EMAIL,
    href: `mailto:${EMAIL}`,
    icon: Mail,
  },
  {
    label: "Onde estamos",
    value: ADDRESS,
    icon: MapPin,
  },
] as const;

export function ContactStrip({ className }: IContactStrip) {
  return (
    <section
      className={`bg-white py-12 ${className ?? ""}`}
      aria-labelledby="contact-strip-heading"
    >
      <h2 id="contact-strip-heading" className="text-foreground sr-only">
        Contato
      </h2>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {CONTACT_ITEMS.map((item) => {
          const Icon = item.icon;
          const content = (
            <>
              <Icon className="text-primary size-5 shrink-0" />
              <div>
                <p className="text-black-1 text-xs font-bold tracking-wide uppercase">
                  {item.label}
                </p>
                <p className="text-warning mt-1 text-base font-medium">
                  {item.value}
                </p>
              </div>
            </>
          );

          if ("href" in item && item.href) {
            return (
              <a
                key={item.label}
                href={item.href}
                {...("external" in item && item.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="flex gap-3 transition-opacity hover:opacity-80"
              >
                {content}
              </a>
            );
          }

          return (
            <div key={item.label} className="flex gap-3">
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}
