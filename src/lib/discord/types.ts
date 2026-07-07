export type DiscordWebhookConfig = {
  webhookUrl: string;
};

export type NotifyOrderPaidDiscordResult =
  | { sent: true }
  | { sent: false; skipped: true }
  | { sent: false; error: string };

export type DiscordEmbed = {
  title: string;
  description?: string;
  color: number;
  fields: { name: string; value: string; inline?: boolean }[];
  footer?: { text: string };
};
