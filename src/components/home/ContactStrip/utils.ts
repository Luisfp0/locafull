import {
  ADDRESS,
  EMAIL,
  PHONE_DISPLAY,
  WHATSAPP_DISPLAY,
  WHATSAPP_NUMBER,
} from "@/lib/constants";
import { Mail, MapPin, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { buildWaLink } from "@/lib/utils";

export const CONTACT_ITEMS = [
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
