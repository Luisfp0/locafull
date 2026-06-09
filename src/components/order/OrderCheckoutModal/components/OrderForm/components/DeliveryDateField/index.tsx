"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { Field } from "../Field";
import type {
  DeliveryDateFieldProps,
  DeliveryDateOption,
  DeliveryDatesApiResponse,
} from "./types";

export function DeliveryDateField({
  value,
  onChange,
  disabled = false,
}: DeliveryDateFieldProps) {
  const [options, setOptions] = useState<DeliveryDateOption[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasSelectedInitial = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function loadDates() {
      setStatus("loading");
      setErrorMessage(null);

      try {
        const response = await fetch("/api/availability/delivery-dates");
        const data = (await response.json()) as DeliveryDatesApiResponse;

        if (cancelled) {
          return;
        }

        if (!response.ok || "error" in data) {
          setStatus("error");
          setErrorMessage(
            ("error" in data && data.error) ||
              "Não foi possível carregar as datas disponíveis.",
          );
          return;
        }

        setOptions(data.dates);
        setStatus("ready");

        if (!hasSelectedInitial.current && data.dates[0]) {
          hasSelectedInitial.current = true;
          onChange(data.dates[0].date);
        }
      } catch {
        if (!cancelled) {
          setStatus("error");
          setErrorMessage("Erro de conexão ao carregar datas disponíveis.");
        }
      }
    }

    void loadDates();

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
