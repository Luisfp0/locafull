import { describe, expect, it, vi, afterEach } from "vitest";

import { findOrCreateEntregarList } from "./find-or-create-entregar-list";

const config = {
  apiKey: "key",
  token: "token",
  boardId: "board123",
  labelIdEntregar: "label123",
  maxDeliveriesPerDay: 6,
};

describe("findOrCreateEntregarList", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns existing list id when ENTREGAR list matches date", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          { id: "list456", name: "ENTREGAR - TERÇA-FEIRA - 09/06" },
        ],
      }),
    );

    const result = await findOrCreateEntregarList("2026-06-09", config);

    expect(result).toEqual({ listId: "list456" });
  });

  it("creates list when ENTREGAR list does not exist", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "list789" }),
      });

    vi.stubGlobal("fetch", fetchMock);

    const result = await findOrCreateEntregarList("2026-06-09", config);

    expect(result).toEqual({ listId: "list789" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
