import { describe, expect, it } from "vitest";

import { buildPricingLineItemName, findPricingPlanPrice } from "./utils";

describe("findPricingPlanPrice", () => {
  it("returns plan price for mini dumpster 48h", () => {
    expect(findPricingPlanPrice("mini-dumpster", "48h")).toBe(18000);
  });

  it("returns combo price for drum", () => {
    expect(findPricingPlanPrice("drum", "combo-2")).toBe(20000);
  });

  it("returns undefined for invalid ids", () => {
    expect(findPricingPlanPrice("invalid", "48h")).toBeUndefined();
    expect(findPricingPlanPrice("mini-dumpster", "invalid")).toBeUndefined();
  });
});

describe("buildPricingLineItemName", () => {
  it("combines product name and plan label", () => {
    expect(buildPricingLineItemName("mini-dumpster", "48h")).toBe(
      "Mini caçamba — Aluguel 48h",
    );
  });

  it("returns undefined for invalid plan", () => {
    expect(
      buildPricingLineItemName("mini-dumpster", "invalid"),
    ).toBeUndefined();
  });
});
