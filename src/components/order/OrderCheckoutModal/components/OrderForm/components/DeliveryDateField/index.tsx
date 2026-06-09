"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { Field } from "../Field";
import type { DeliveryDateFieldProps, DeliveryDateOption } from "./types";
import { getCachedDeliveryDateOptions, loadDeliveryDateOptions } from "./utils";

export function DeliveryDateField({
  value,
  onChange,
  disabled = false,
}: DeliveryDateFieldProps) {
  const cached = getCachedDeliveryDateOptions();
  const [options, setOptions] = useState<DeliveryDateOption[]>(cached ?? []);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    cached ? "ready" : "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const skipAutoSelect = useRef(value !== "");

  useEffect(() => {
    let cancelled = false;

    void loadDeliveryDateOptions().then((result) => {
      if (cancelled) {
        return;
      }

      if ("error" in result) {
        if (!getCachedDeliveryDateOptions()) {
          setStatus("error");
          setErrorMessage(result.error);
        }
        return;
      }

      setOptions(result);
      setStatus("ready");

      if (!skipAutoSelect.current && result[0]) {
        skipAutoSelect.current = true;
        onChange(result[0].date);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [onChange]);

  if (status === "loading") {
    return (
      <Field id="order-scheduled-date" label="Data da entrega" required>
        <p className="text-sm text-gray-600">Carregando datas disponíveis…</p>
      </Field>
    );
  }

  if (status === "error") {
    return (
      <Field id="order-scheduled-date" label="Data da entrega" required>
        <p className="text-destructive text-sm" role="alert">
          {errorMessage}
        </p>
      </Field>
    );
  }

  if (options.length === 0) {
    return (
      <Field id="order-scheduled-date" label="Data da entrega" required>
        <p className="text-sm text-gray-600">
          Nenhuma data disponível nos próximos dias. Fale conosco no WhatsApp.
        </p>
      </Field>
    );
  }

  return (
    <Field id="order-scheduled-date" label="Data da entrega" required>
      <select
        id="order-scheduled-date"
        name="scheduledDate"
        required
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "border-input bg-input-background text-black-1 focus-visible:ring-ring h-10 w-full rounded-lg border px-3 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        <option value="" disabled>
          Selecione uma data
        </option>
        {options.map((option) => (
          <option key={option.date} value={option.date}>
            {option.label} ({option.slotsRemaining}{" "}
            {option.slotsRemaining === 1 ? "vaga" : "vagas"})
          </option>
        ))}
      </select>
    </Field>
  );
}
