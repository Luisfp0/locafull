import {
  findPricingPlanLabel,
  findPricingProduct,
} from "@/components/pricing/utils";
import type { OrderInsertRow } from "@/lib/orders/types";
import { formatBRL } from "@/lib/utils";

import type { TrelloCardPayload } from "./types";

export function buildTrelloCardFromOrder(
  row: OrderInsertRow,
): TrelloCardPayload {
  const product = findPricingProduct(row.product_id);
  const planLabel = findPricingPlanLabel(row.product_id, row.plan_id);
  const productName = product?.name ?? row.product_id;

  const complement = row.complement ? ` — ${row.complement}` : "";
  const notesBlock = row.notes ? `\n\nObservações: ${row.notes}` : "";

  return {
    name: `${productName} — ${row.neighborhood}`,
    desc: [
      `Nome: ${row.customer_name}`,
      `Telefone: ${row.customer_phone}`,
      `E-mail: ${row.customer_email}`,
      "",
      `Endereço: ${row.street}, ${row.number}${complement}`,
      `${row.neighborhood}, ${row.city}`,
      `CEP: ${row.postal_code}`,
      "",
      `Plano: ${planLabel ?? row.plan_id}`,
      `Valor pago: ${formatBRL(row.amount_cents)}${notesBlock}`,
      "",
      `Pedido Stripe: ${row.stripe_session_id}`,
    ].join("\n"),
  };
}
