"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

export const Header = ({ className }: HeaderProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  function scrollToTopIfSameRoute(href: string) {
    if (pathname === href) {
      window.scrollTo(0, 0);
    }
  }

  return (
    <>
      <header
        className={`sticky top-0 z-1 mx-auto flex items-center justify-center bg-white/95 px-5 ${className ?? ""}`}
      >
        <div className="flex h-15 w-full max-w-7xl items-center justify-between">
          <div className="flex items-center gap-10">
            <Logo />
            <nav className="hidden gap-6 md:flex">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => scrollToTopIfSameRoute(link.href)}
                  className="text-primary hover:text-warning text-sm font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex gap-3">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hidden rounded-full p-2 hover:bg-gray-50 md:flex"
              aria-label="Instagram Locafull"
            >
              <InstagramIcon className="size-5" />
            </a>
            <Button
              variant="whatsapp"
              size="sm"
              className="hidden md:flex"
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
              className="text-primary hover:bg-gray-50 md:hidden"
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
};
