"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { Logo } from "@/components/icons/Logo";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { Button } from "@/components/ui/button";
import {
  INSTAGRAM_URL,
  NAV_LINKS,
  WHATSAPP_DISPLAY,
  WHATSAPP_NUMBER,
} from "@/lib/constants";
import { buildWaLink } from "@/lib/utils";

import { MobileMenu } from "./components/MobileMenu";
import type { HeaderProps } from "./types";

export function Header({ className }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header
        className={`border-border sticky top-0 z-40 border-b bg-white/95 backdrop-blur ${className ?? ""}`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-primary hover:text-warning text-sm font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hidden rounded-full p-2 hover:bg-gray-50 sm:inline-flex"
              aria-label="Instagram Locafull"
            >
              <InstagramIcon className="size-5" />
            </a>
            <Button
              variant="whatsapp"
              size="sm"
              className="hidden sm:inline-flex"
              asChild
            >
              <a
                href={buildWaLink(WHATSAPP_NUMBER)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon className="size-4" />
                {WHATSAPP_DISPLAY}
              </a>
            </Button>
            <button
              type="button"
              className="text-primary inline-flex rounded-lg p-2 hover:bg-gray-50 md:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu className="size-6" />
            </button>
          </div>
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
