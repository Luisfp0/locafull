"use client";

import { X } from "lucide-react";
import Link from "next/link";

import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { Button } from "@/components/ui/button";
import {
  INSTAGRAM_URL,
  NAV_LINKS,
  WHATSAPP_DISPLAY,
  WHATSAPP_NUMBER,
} from "@/lib/constants";
import { buildWaLink } from "@/lib/utils";

import type { IMobileMenu } from "./types";

export function MobileMenu({ open, onClose }: IMobileMenu) {
  if (!open) return null;

  return (
    <div
      className="bg-overlay fixed inset-0 z-50 md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Menu de navegação"
    >
      <div className="shadow-brand ml-auto flex h-full w-[min(100%,20rem)] flex-col bg-white">
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
