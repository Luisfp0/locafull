import { describe, expect, it } from "vitest";

import { buildEntregarListName, parseEntregarListDate } from "./list-name";

describe("buildEntregarListName", () => {
  it("formats short weekday and date", () => {
    const date = new Date(2026, 5, 9);
    expect(buildEntregarListName(date)).toBe("TERÇA - 09/06");
  });

  it("formats saturday without -FEIRA", () => {
    const date = new Date(2026, 7, 8);
    expect(buildEntregarListName(date)).toBe("SÁBADO - 08/08");
  });
});

describe("parseEntregarListDate", () => {
  it("parses short list title", () => {
    expect(parseEntregarListDate("QUARTA - 05/08", 2026)).toBe("2026-08-05");
  });

  it("parses tuesday short title", () => {
    expect(parseEntregarListDate("TERÇA - 09/06", 2026)).toBe("2026-06-09");
  });

  it("ignores legacy ENTREGAR lists", () => {
    expect(parseEntregarListDate("ENTREGAR - TERÇA-FEIRA - 09/06", 2026)).toBe(
      null,
    );
  });

  it("ignores RETIRAR lists", () => {
    expect(parseEntregarListDate("RETIRAR - TERÇA-FEIRA - 09/06", 2026)).toBe(
      null,
    );
  });

  it("ignores unrelated lists", () => {
    expect(parseEntregarListDate("A AGENDAR", 2026)).toBe(null);
  });
});
