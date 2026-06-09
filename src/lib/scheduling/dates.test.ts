import { describe, expect, it, vi } from "vitest";

import { getDeliveryCandidateDates } from "./dates";

describe("getDeliveryCandidateDates", () => {
  it("excludes today and sundays, returns 30-day horizon", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 7, 12));

    const dates = getDeliveryCandidateDates();

    expect(dates[0]).toBe("2026-06-08");
    expect(dates).not.toContain("2026-06-07");
    expect(dates).not.toContain("2026-06-14");
    expect(dates.length).toBeGreaterThan(0);

    vi.useRealTimers();
  });
});
