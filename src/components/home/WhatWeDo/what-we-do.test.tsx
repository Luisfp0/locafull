import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { WHAT_WE_DO_ITEMS } from "@/lib/constants";

import { WhatWeDo } from "./index";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));

describe("WhatWeDo", () => {
  afterEach(() => cleanup());

  it("renders three service cards with titles", () => {
    render(<WhatWeDo />);

    for (const item of WHAT_WE_DO_ITEMS) {
      expect(
        screen.getByRole("heading", { level: 3, name: item.title }),
      ).toBeInTheDocument();
    }
  });

  it("renders CTA linking to pedido", () => {
    render(<WhatWeDo />);

    const cta = screen.getByRole("link", { name: /peça agora/i });
    expect(cta).toHaveAttribute("href", "/pedido");
  });
});
