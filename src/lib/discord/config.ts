import type { DiscordWebhookConfig } from "./types";

export function getDiscordWebhookConfig(): DiscordWebhookConfig | null {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL?.trim();

  if (!webhookUrl?.startsWith("https://discord.com/api/webhooks/")) {
    return null;
  }

  return { webhookUrl };
}
