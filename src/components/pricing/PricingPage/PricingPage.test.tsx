import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PricingPage } from "./index";

describe("PricingPage", () => {
  it("renders product sections and payment notice", () => {
    render(<PricingPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /valores e equipamentos/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/cartão/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /mini caçamba/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /tambor/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /barril/i }),
    ).toBeInTheDocument();
  });
});
