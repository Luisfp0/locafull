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
      className={`border-t border-[var(--light-gray2)] bg-[var(--secondary)] text-[var(--white)] ${className ?? ""}`}
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="text-lg font-[var(--font-weight-bold)]">
              {SITE_NAME}
            </p>
            <p className="mt-2 text-[length:var(--font-body5)] text-[var(--gray-200)]">
              {SITE_TAGLINE}
            </p>
          </div>
          <nav className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[length:var(--font-body5)] text-[var(--gray-100)] hover:text-[var(--alert-2)]"
              >
                {link.label}asd
              </Link>
            ))}
          </nav>
          <div className="text-[length:var(--font-body5)] text-[var(--gray-200)]">
            <p>{EMAIL}</p>
            <p className="mt-1">{WHATSAPP_DISPLAY}</p>
          </div>
        </div>
        <p className="mt-8 border-t border-[var(--primary-light)] pt-6 text-center text-[length:var(--font-body6)] text-[var(--gray-300)]">
          © {new Date().getFullYear()} {SITE_NAME}. Todos os direitos
          reservados.
        </p>
      </div>
    </footer>
  );
}
