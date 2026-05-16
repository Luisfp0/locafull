import Link from "next/link";

import {
  EMAIL,
  NAV_LINKS,
  SITE_NAME,
  SITE_TAGLINE,
  WHATSAPP_DISPLAY,
} from "@/lib/constants";

import type { IFooter } from "./types";

export function Footer({ className }: IFooter) {
  return (
    <footer
      className={`border-border bg-secondary border-t text-white ${className ?? ""}`}
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="text-lg font-bold">{SITE_NAME}</p>
            <p className="mt-2 text-sm text-gray-200">{SITE_TAGLINE}</p>
          </div>
          <nav className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-warning text-sm text-gray-100 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="text-sm text-gray-200">
            <p>{EMAIL}</p>
            <p className="mt-1">{WHATSAPP_DISPLAY}</p>
          </div>
        </div>
        <p className="border-primary-light mt-8 border-t pt-6 text-center text-xs text-gray-300">
          © {new Date().getFullYear()} {SITE_NAME}. Todos os direitos
          reservados.
        </p>
      </div>
    </footer>
  );
}
