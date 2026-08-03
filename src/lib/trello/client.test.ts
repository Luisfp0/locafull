import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchEntregarCardCountsByDate } from "./client";

const config = {
  apiKey: "key",
  token: "token",
  labelIdEntregar: "label-entregar",
};

describe("fetchEntregarCardCountsByDate", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("counts only open cards with Entregar label on short-named lists", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: "list-qua", name: "QUARTA - 05/08" },
          { id: "list-other", name: "A AGENDAR" },
          { id: "list-legacy", name: "ENTREGAR - QUARTA-FEIRA - 05/08" },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: "c1",
            idList: "list-qua",
            idLabels: ["label-entregar"],
          },
          {
            id: "c2",
            idList: "list-qua",
            idLabels: ["label-entregar", "other"],
          },
          {
            id: "c3",
            idList: "list-qua",
            idLabels: [],
          },
          {
            id: "c4",
            idList: "list-legacy",
            idLabels: ["label-entregar"],
          },
        ],
      });

    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchEntregarCardCountsByDate(
      "board123",
      2026,
      config,
    );

    expect(result).toEqual({ "2026-08-05": 2 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("returns empty object when no matching lists", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [{ id: "x", name: "Inbox" }],
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        }),
    );

    const result = await fetchEntregarCardCountsByDate(
      "board123",
      2026,
      config,
    );

    expect(result).toEqual({});
  });

  it("returns error when lists request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 401 }),
    );

    const result = await fetchEntregarCardCountsByDate(
      "board123",
      2026,
      config,
    );

    expect(result).toEqual({ error: "Trello API 401" });
  });
});
