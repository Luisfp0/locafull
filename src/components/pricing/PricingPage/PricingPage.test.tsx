import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PricingPage } from "./index";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: vi.fn(),
  }),
}));

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

  it("opens checkout modal when product and plan are valid", () => {
    render(<PricingPage productId="mini-dumpster" planId="48h" />);

    const dialog = screen.getByRole("dialog", { name: /finalizar pedido/i });
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText("Mini caçamba")).toBeInTheDocument();
    expect(within(dialog).getByText("Aluguel 48h")).toBeInTheDocument();
    expect(within(dialog).getByText("R$ 180,00")).toBeInTheDocument();
  });

  it("does not open modal for invalid query", () => {
    render(<PricingPage productId="invalid" planId="48h" />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
