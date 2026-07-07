import type { OrderInsertRow } from "@/lib/orders/types";

import { buildOrderPaidDiscordEmbed } from "./build-message";
import { getDiscordWebhookConfig } from "./config";
import type { NotifyOrderPaidDiscordResult } from "./types";

type DiscordWebhookResponse = {
  message?: string;
};

export async function notifyOrderPaidOnDiscord(
  row: OrderInsertRow,
): Promise<NotifyOrderPaidDiscordResult> {
  const config = getDiscordWebhookConfig();

  if (!config) {
    console.warn("[discord] skipped — DISCORD_WEBHOOK_URL missing or invalid");
    return { sent: false, skipped: true };
  }

  const embed = buildOrderPaidDiscordEmbed(row);

  try {
    const response = await fetch(config.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Locafull",
        embeds: [embed],
      }),
    });

    if (!response.ok) {
      const body = (await response.json()) as DiscordWebhookResponse;
      return {
        sent: false,
        error: body.message ?? `Discord ${response.status}`,
      };
    }

    return { sent: true };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro de rede ao enviar notificação Discord.";
    return { sent: false, error: message };
  }
}
