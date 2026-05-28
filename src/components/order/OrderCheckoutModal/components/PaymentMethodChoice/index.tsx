"use client";

import { cn } from "@/lib/utils";

import { PAYMENT_METHOD_OPTIONS } from "./constants";
import type { PaymentMethodChoiceProps } from "./types";

export function PaymentMethodChoice({
  value,
  onChange,
  disabled,
}: PaymentMethodChoiceProps) {
  return (
    <fieldset className="flex flex-col gap-2" disabled={disabled}>
      <legend className="text-black-1 text-sm font-medium">
        Forma de pagamento
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {PAYMENT_METHOD_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            aria-pressed={value === option.id}
            className={cn(
              "flex flex-col gap-0.5 rounded-xl border px-4 py-3 text-left transition-colors",
              value === option.id
                ? "border-primary bg-primary/5"
                : "border-input hover:border-primary/50",
            )}
          >
            <span className="text-black-1 text-sm font-semibold">
              {option.label}
            </span>
            <span className="text-xs text-gray-500">{option.hint}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
