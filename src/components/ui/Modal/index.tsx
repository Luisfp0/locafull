"use client";

import { X } from "lucide-react";
import { useEffect, useId } from "react";

import { cn } from "@/lib/utils";

import type { ModalProps } from "./types";

export function Modal({
  open,
  onClose,
  title,
  children,
  ariaLabel,
}: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5 sm:p-6">
      <button
        type="button"
        className="bg-overlay absolute inset-0"
        onClick={onClose}
        aria-label="Fechar"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-label={ariaLabel}
        className={cn(
          "shadow-brand relative flex max-h-[88vh] w-full max-w-xs flex-col overflow-hidden rounded-2xl bg-white sm:max-w-md",
        )}
      >
        <div className="border-border flex shrink-0 items-center justify-between gap-3 border-b px-5 py-4">
          <h2 id={titleId} className="text-primary text-lg font-semibold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
            aria-label="Fechar"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="flex flex-col gap-5 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          {children}
        </div>
      </div>
    </div>
  );
}
