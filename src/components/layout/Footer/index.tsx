import { SITE_NAME } from "@/lib/constants";

import type { FooterProps } from "./types";

export function Footer({ className }: FooterProps) {
  return (
    <footer
      className={`border-border bg-secondary border-t text-white ${className ?? ""}`}
    >
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs text-gray-300">
          © {new Date().getFullYear()} {SITE_NAME}. Todos os direitos
          reservados.
        </p>
      </div>
    </footer>
  );
}
