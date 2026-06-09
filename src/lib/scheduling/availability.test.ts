import { describe, expect, it } from "vitest";

import {
  buildAvailabilityForDates,
  computeSlotsRemaining,
} from "./availability";

describe("computeSlotsRemaining", () => {
  it("subtracts trello cards and pending orders from max", () => {
    expect(
      computeSlotsRemaining({ trelloCards: 3, pendingOrders: 2, max: 6 }),
    ).toBe(1);
  });

  it("never goes below zero", () => {
    expect(
      computeSlotsRemaining({ trelloCards: 5, pendingOrders: 3, max: 6 }),
    ).toBe(0);
  });
});

describe("buildAvailabilityForDates", () => {
  it("returns only dates with remaining slots", () => {
    const result = buildAvailabilityForDates({
      dates: ["2026-06-09", "2026-06-10"],
      occupancyByDate: {
        "2026-06-09": { trelloCards: 6, pendingOrders: 0 },
        "2026-06-10": { trelloCards: 2, pendingOrders: 1 },
      },
      maxDeliveriesPerDay: 6,
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.date).toBe("2026-06-10");
    expect(result[0]?.slotsRemaining).toBe(3);
    expect(result[0]?.label).toMatch(/10\/06\/2026/);
  });
});
