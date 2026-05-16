import { describe, expect, it } from "vitest";

import { buildWaLink, formatPhone } from "./utils";

describe("formatPhone", () => {
  it("formats 11-digit mobile number", () => {
    expect(formatPhone("62930300077")).toBe("(62) 93030-0077");
  });
});

describe("buildWaLink", () => {
  it("builds wa.me link with encoded message", () => {
    const link = buildWaLink("556230300077", "Olá");
    expect(link).toContain("https://wa.me/556230300077");
    expect(link).toContain(encodeURIComponent("Olá"));
  });
});
