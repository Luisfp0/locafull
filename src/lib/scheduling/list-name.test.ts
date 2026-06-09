import { describe, expect, it } from "vitest";

import { buildEntregarListName, parseEntregarListDate } from "./list-name";

describe("buildEntregarListName", () => {
  it("formats like board pattern", () => {
    const date = new Date(2026, 5, 9);
    expect(buildEntregarListName(date)).toBe("ENTREGAR - TERÇA-FEIRA - 09/06");
  });
});

describe("parseEntregarListDate", () => {
  it("parses ENTREGAR list title", () => {
    expect(parseEntregarListDate("ENTREGAR - TERÇA-FEIRA - 09/06", 2026)).toBe(
      "2026-06-09",
    );
  });

  it("ignores RETIRAR lists", () => {
    expect(parseEntregarListDate("RETIRAR - TERÇA-FEIRA - 09/06", 2026)).toBe(
      null,
    );
  });
});
