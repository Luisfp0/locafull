import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

import "@testing-library/jest-dom/vitest";

afterEach(() => {
  cleanup();
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.paddingRight = "";
  document.body.style.overflow = "";
});

window.scrollTo = vi.fn();
