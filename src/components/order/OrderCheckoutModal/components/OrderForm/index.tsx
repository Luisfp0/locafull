"use client";

import { useCallback, useState } from "react";

import type {
  OrderFormFieldValues,
  OrderPaymentMethod,
} from "@/components/order/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { Field } from "./components/Field";
import { DeliveryDateField } from "./components/DeliveryDateField";
import { ORDER_FORM_DEFAULT_VALUES } from "./constants";
import type { OrderFormProps, OrdersApiResponse, PixState } from "./types";
import { OrderPixPayment } from "../OrderPixPayment";
import { PaymentMethodChoice } from "../PaymentMethodChoice";

export function OrderForm({ productId, planId, onPaid }: OrderFormProps) {
  const [values, setValues] = useState<OrderFormFieldValues>(
    ORDER_FORM_DEFAULT_VALUES,
  );
  const [paymentMethod, setPaymentMethod] = useState<OrderPaymentMethod>("pix");
  const [pix, setPix] = useState<PixState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof OrderFormFieldValues>(
    key: K,
    value: OrderFormFieldValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  const setScheduledDate = useCallback((scheduledDate: string) => {
    setValues((current) => ({ ...current, scheduledDate }));
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/abacatepay/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, planId, paymentMethod, ...values }),
      });

      const data = (await response.json()) as OrdersApiResponse;

      if (!response.ok || "error" in data) {
        setError(
          ("error" in data && data.error) ||
            "Não foi possível iniciar o pagamento.",
        );
        return;
      }

      if (data.method === "card") {
        window.location.href = data.url;
        return;
      }

      setPix({
        orderId: data.orderId,
        brCode: data.brCode,
        brCodeBase64: data.brCodeBase64,
        expiresAt: data.expiresAt,
      });
    } catch {
      setError("Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (pix) {
    return (
      <OrderPixPayment
        orderId={pix.orderId}
        brCode={pix.brCode}
        brCodeBase64={pix.brCodeBase64}
        expiresAt={pix.expiresAt}
        onConfirmed={() => onPaid(pix.orderId)}
      />
    );
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-3">
        <Field id="order-name" label="Nome completo" required>
          <Input
            id="order-name"
            name="name"
            autoComplete="name"
            required
            value={values.name}
            onChange={(event) => updateField("name", event.target.value)}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="order-email" label="E-mail" required>
            <Input
              id="order-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={values.email}
              onChange={(event) => updateField("email", event.target.value)}
            />
          </Field>

          <Field id="order-phone" label="Telefone" required>
            <Input
              id="order-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              placeholder="(62) 99999-9999"
              value={values.phone}
              onChange={(event) => updateField("phone", event.target.value)}
            />
          </Field>
        </div>

        <Field id="order-postal-code" label="CEP" required>
          <Input
            id="order-postal-code"
            name="postalCode"
            autoComplete="postal-code"
            required
            placeholder="74000-000"
            value={values.postalCode}
            onChange={(event) => updateField("postalCode", event.target.value)}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <Field id="order-street" label="Endereço" required>
            <Input
              id="order-street"
              name="street"
              autoComplete="street-address"
              required
              value={values.street}
              onChange={(event) => updateField("street", event.target.value)}
            />
          </Field>

          <Field id="order-number" label="Número" required>
            <Input
              id="order-number"
              name="number"
              required
              className="sm:w-28"
              value={values.number}
              onChange={(event) => updateField("number", event.target.value)}
            />
          </Field>
        </div>

        <Field id="order-complement" label="Complemento">
          <Input
            id="order-complement"
            name="complement"
            autoComplete="address-line2"
            value={values.complement}
            onChange={(event) => updateField("complement", event.target.value)}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="order-neighborhood" label="Bairro" required>
            <Input
              id="order-neighborhood"
              name="neighborhood"
              required
              value={values.neighborhood}
              onChange={(event) =>
                updateField("neighborhood", event.target.value)
              }
            />
          </Field>

          <Field id="order-city" label="Cidade" required>
            <Input
              id="order-city"
              name="city"
              autoComplete="address-level2"
              required
              value={values.city}
              onChange={(event) => updateField("city", event.target.value)}
            />
          </Field>
        </div>

        <Field id="order-notes" label="Observações">
          <textarea
            id="order-notes"
            name="notes"
            rows={3}
            value={values.notes}
            onChange={(event) => updateField("notes", event.target.value)}
            className={cn(
              "border-input bg-input-background text-black-1 focus-visible:ring-ring w-full rounded-lg border px-3 py-2 text-sm transition-colors placeholder:text-gray-500 focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            )}
            placeholder="Horário preferencial, referência do local, etc."
          />
        </Field>

        <DeliveryDateField
          value={values.scheduledDate}
          onChange={setScheduledDate}
          disabled={isSubmitting}
        />
      </div>

      <PaymentMethodChoice
        value={paymentMethod}
        onChange={setPaymentMethod}
        disabled={isSubmitting}
      />

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting || !values.scheduledDate}
      >
        {isSubmitting
          ? "Processando..."
          : paymentMethod === "pix"
            ? "Pagar com Pix"
            : "Pagar com cartão"}
      </Button>
    </form>
  );
}
