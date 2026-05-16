import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "./button";

describe("Button", () => {
  it("renders default CTA variant", () => {
    render(<Button>Peça agora</Button>);
    const button = screen.getByRole("button", { name: /peça agora/i });
    expect(button.className).toMatch(/bg-warning/);
  });

  it("renders secondary variant", () => {
    render(<Button variant="secondary">Secundário</Button>);
    const button = screen.getByRole("button", { name: /secundário/i });
    expect(button.className).toMatch(/bg-primary/);
  });
});
