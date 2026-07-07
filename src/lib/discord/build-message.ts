import {
  findPricingPlanLabel,
  findPricingProduct,
} from "@/components/pricing/utils";
import type { OrderInsertRow } from "@/lib/orders/types";
import { parseIsoDateLocal } from "@/lib/scheduling/list-name";
import { formatBRL } from "@/lib/utils";

import type { DiscordEmbed } from "./types";

const PAYMENT_METHOD_LABEL: Record<OrderInsertRow["payment_method"], string> = {
  pix: "Pix",
  card: "Cartão",
};

const SUCCESS_COLOR = 0xf97316;

function formatDeliveryDate(isoDate: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parseIsoDateLocal(isoDate));
}

function formatAddress(row: OrderInsertRow): string {
  const complement = row.complement ? ` — ${row.complement}` : "";
  return `${row.street}, ${row.number}${complement}\n${row.neighborhood}, ${row.city}\nCEP ${row.postal_code}`;
}

export function buildOrderPaidDiscordEmbed(row: OrderInsertRow): DiscordEmbed {
  const product = findPricingProduct(row.product_id);
  const planLabel = findPricingPlanLabel(row.product_id, row.plan_id);
  const productName = product?.name ?? row.product_id;

  const fields = [
    { name: "Cliente", value: row.customer_name, inline: true },
    { name: "Telefone", value: row.customer_phone, inline: true },
    { name: "E-mail", value: row.customer_email, inline: true },
    {
      name: "Produto",
      value: `${productName} — ${planLabel ?? row.plan_id}`,
      inline: false,
    },
    { name: "Valor pago", value: formatBRL(row.amount_cents), inline: true },
    {
      name: "Pagamento",
      value: PAYMENT_METHOD_LABEL[row.payment_method],
      inline: true,
    },
    {
      name: "Data de entrega",
      value: row.scheduled_date
        ? formatDeliveryDate(row.scheduled_date)
        : "Não informada",
      inline: false,
    },
    { name: "Endereço", value: formatAddress(row), inline: false },
  ];

  if (row.notes?.trim()) {
    fields.push({
      name: "Observações",
      value: row.notes.trim(),
      inline: false,
    });
  }

  return {
    title: "Nova venda aprovada",
    description: "Pagamento confirmado no site Locafull.",
    color: SUCCESS_COLOR,
    fields,
    footer: { text: `Pedido ${row.id}` },
  };
}
