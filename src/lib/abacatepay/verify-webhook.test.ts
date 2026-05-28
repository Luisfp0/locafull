import crypto from "node:crypto";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  isValidWebhookSecret,
  isValidWebhookSignature,
} from "./verify-webhook";

const TEST_HMAC_KEY = "test-key";
const RAW_BODY = JSON.stringify({ event: "billing.paid", data: {} });

function signWith(key: string, rawBody: string): string {
  return crypto
    .createHmac("sha256", key)
    .update(Buffer.from(rawBody, "utf8"))
    .digest("base64");
}

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  delete process.env.ABACATEPAY_WEBHOOK_HMAC_KEY;
  delete process.env.ABACATEPAY_WEBHOOK_SECRET;
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("isValidWebhookSignature", () => {
  it("returns true for a valid signature", () => {
    process.env.ABACATEPAY_WEBHOOK_HMAC_KEY = TEST_HMAC_KEY;
    const signature = signWith(TEST_HMAC_KEY, RAW_BODY);

    expect(isValidWebhookSignature(RAW_BODY, signature)).toBe(true);
  });

  it("returns false for a tampered signature of the same length", () => {
    process.env.ABACATEPAY_WEBHOOK_HMAC_KEY = TEST_HMAC_KEY;
    const valid = signWith(TEST_HMAC_KEY, RAW_BODY);
    const tampered = `${valid.slice(0, -1)}${valid.at(-1) === "A" ? "B" : "A"}`;

    expect(tampered).toHaveLength(valid.length);
    expect(isValidWebhookSignature(RAW_BODY, tampered)).toBe(false);
  });

  it("returns false (and does not throw) for a signature of a different length", () => {
    process.env.ABACATEPAY_WEBHOOK_HMAC_KEY = TEST_HMAC_KEY;

    expect(() => isValidWebhookSignature(RAW_BODY, "short")).not.toThrow();
    expect(isValidWebhookSignature(RAW_BODY, "short")).toBe(false);
  });

  it("returns false when signature is null", () => {
    process.env.ABACATEPAY_WEBHOOK_HMAC_KEY = TEST_HMAC_KEY;

    expect(isValidWebhookSignature(RAW_BODY, null)).toBe(false);
  });
});

describe("isValidWebhookSecret", () => {
  it("returns true when the configured secret matches provided", () => {
    process.env.ABACATEPAY_WEBHOOK_SECRET = "super-secret";

    expect(isValidWebhookSecret("super-secret")).toBe(true);
  });

  it("returns false when provided differs from the configured secret", () => {
    process.env.ABACATEPAY_WEBHOOK_SECRET = "super-secret";

    expect(isValidWebhookSecret("wrong-secret")).toBe(false);
  });

  it("returns false when provided is null", () => {
    process.env.ABACATEPAY_WEBHOOK_SECRET = "super-secret";

    expect(isValidWebhookSecret(null)).toBe(false);
  });

  it("returns false when the env secret is not configured", () => {
    expect(isValidWebhookSecret("anything")).toBe(false);
  });
});
