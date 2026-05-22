import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Modal } from "./index";

describe("Modal", () => {
  it("renders title when open", () => {
    render(
      <Modal open onClose={vi.fn()} title="Finalizar pedido">
        <p>Conteúdo</p>
      </Modal>,
    );

    expect(
      screen.getByRole("dialog", { name: /finalizar pedido/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Conteúdo")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(
      <Modal open={false} onClose={vi.fn()} title="Finalizar pedido">
        <p>Conteúdo</p>
      </Modal>,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls onClose when Escape is pressed", () => {
    const onClose = vi.fn();

    render(
      <Modal open onClose={onClose} title="Finalizar pedido">
        <p>Conteúdo</p>
      </Modal>,
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
