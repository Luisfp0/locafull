import crypto from "node:crypto";

const DEFAULT_PUBLIC_KEY =
  "t9dXRhHHo3yDEj5pVDYz0frf7q6bMKyMRmxxCPIPp3RCplBfXRxqlC6ZpiWmOqj4L63qEaeUOtrCI8P0VMUgo6iIga2ri9ogaHFs0WIIywSMg0q7RmBfybe1E5XJcfC4IW3alNqym0tXoAKkzvfEjZxV6bE0oG2zJrNNYmUCKZyV0KZ3JS8Votf9EAWWYdiDkMkpbMdPggfh1EqHlVkMiTady6jOR3hyzGEHrIz2Ret0xHKMbiqkr9HS1JhNHDX9";

function getPublicKey(): string {
  return process.env.ABACATEPAY_WEBHOOK_HMAC_KEY?.trim() || DEFAULT_PUBLIC_KEY;
}

export function isValidWebhookSecret(provided: string | null): boolean {
  const expected = process.env.ABACATEPAY_WEBHOOK_SECRET?.trim();
  return Boolean(expected) && provided === expected;
}

export function isValidWebhookSignature(
  rawBody: string,
  signature: string | null,
): boolean {
  if (!signature) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", getPublicKey())
    .update(Buffer.from(rawBody, "utf8"))
    .digest("base64");

  const a = Buffer.from(expected);
  const b = Buffer.from(signature);

  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
