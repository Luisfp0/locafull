"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

import type { OrderPixPaymentProps } from "./types";

export function OrderPixPayment({
  orderId,
  brCode,
  brCodeBase64,
  expiresAt,
  onConfirmed,
}: OrderPixPaymentProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/abacatepay/orders/${orderId}/status`,
        );
        if (!response.ok) return;
        const data = (await response.json()) as { status?: string };
        if (active && data.status === "paid") {
          clearInterval(interval);
          onConfirmed();
        }
      } catch {
        // silencioso — segue tentando até expirar/desmontar
      }
    }, 4000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [orderId, onConfirmed]);

  async function handleCopy() {
    await navigator.clipboard.writeText(brCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <p className="text-sm text-gray-600">
        Escaneie o QR Code ou copie o código Pix para pagar.
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={brCodeBase64}
        alt="QR Code Pix"
        className="border-input h-56 w-56 rounded-lg border"
      />
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleCopy}
      >
        {copied ? "Código copiado!" : "Copiar código Pix"}
      </Button>
      {expiresAt ? (
        <p className="text-xs text-gray-500">
          Expira em {new Date(expiresAt).toLocaleTimeString("pt-BR")}
        </p>
      ) : null}
      <p className="text-primary text-sm" role="status">
        Aguardando confirmação do pagamento…
      </p>
    </div>
  );
}
