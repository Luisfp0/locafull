import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ROUTES } from "@/lib/constants";

import { WhatWeDo } from "./index";
import { WHAT_WE_DO_ITEMS } from "./constants";

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

  it("renders CTA linking to pricing", () => {
    render(<WhatWeDo />);

    const cta = screen.getByRole("link", { name: /ver valores e solicitar/i });
    expect(cta).toHaveAttribute("href", ROUTES.pricing);
  });
});
