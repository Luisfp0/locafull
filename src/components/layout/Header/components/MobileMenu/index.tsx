"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { Button } from "@/components/ui/button";
import {
  INSTAGRAM_URL,
  NAV_LINKS,
  WHATSAPP_DISPLAY,
  WHATSAPP_NUMBER,
} from "@/lib/constants";
import { buildWaLink, cn } from "@/lib/utils";

import type { MobileMenuProps } from "./types";

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 md:hidden",
        !open && "pointer-events-none",
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        className={cn(
          "bg-overlay absolute inset-0 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
        aria-label="Fechar menu"
        tabIndex={open ? 0 : -1}
      />
      <div
        className={cn(
          "shadow-brand relative ml-auto flex h-full w-[min(100%,20rem)] flex-col bg-white transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
        role="dialog"
        aria-modal={open}
        aria-label="Menu de navegação"
      >
        <div className="border-border flex items-center justify-between border-b px-4 py-4">
          <span className="text-primary font-bold">Menu</span>
          <button
            type="button"
            onClick={onClose}
            className="text-primary rounded-lg p-2 hover:bg-gray-50"
            aria-label="Fechar menu"
          >
            <X className="size-6" />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-4 py-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="text-primary rounded-lg px-3 py-3 text-base font-medium hover:bg-gray-50"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="border-border flex flex-col gap-3 border-t p-4">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary inline-flex items-center gap-2"
          >
            <InstagramIcon className="size-5" />
            Instagram
          </a>
          <Button variant="whatsapp" className="w-full" asChild>
            <a
              href={buildWaLink(WHATSAPP_NUMBER)}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp {WHATSAPP_DISPLAY}
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
