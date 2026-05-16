"use client";

import { X } from "lucide-react";

import { InstagramIcon } from "@/components/icons/InstagramIcon";
import Link from "next/link";

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
      className="fixed inset-0 z-50 bg-[var(--semi-transparent-black)] md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Menu de navegação"
    >
      <div className="ml-auto flex h-full w-[min(100%,20rem)] flex-col bg-[var(--white)] shadow-[var(--box-shadow-1)]">
        <div className="flex items-center justify-between border-b border-[var(--light-gray2)] px-4 py-4">
          <span className="font-[var(--font-weight-bold)] text-[var(--primary)]">
            Menu
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[var(--border-radius)] p-2 text-[var(--primary)] hover:bg-[var(--gray-50)]"
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
              className="rounded-[var(--border-radius)] px-3 py-3 text-[length:var(--font-body4)] font-[var(--font-weight-medium)] text-[var(--primary)] hover:bg-[var(--gray-50)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-col gap-3 border-t border-[var(--light-gray2)] p-4">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[var(--primary)]"
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
