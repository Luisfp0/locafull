import { describe, expect, it } from "vitest";

import {
  checkAppPage,
  checkComponentIndex,
  checkFile,
  isAppPageFile,
  isComponentIndexFile,
} from "./check.mjs";

describe("folder conventions", () => {
  it("detects component index paths", () => {
    expect(
      isComponentIndexFile("src/components/order/OrderPage/index.tsx"),
    ).toBe(true);
    expect(isComponentIndexFile("src/components/ui/button.tsx")).toBe(false);
  });

  it("detects app page paths", () => {
    expect(isAppPageFile("src/app/checkout/success/page.tsx")).toBe(true);
    expect(isAppPageFile("src/app/page.tsx")).toBe(true);
    expect(isAppPageFile("src/app/layout.tsx")).toBe(false);
  });

  it("flags inline props types in component index", () => {
    const violations = checkComponentIndex(
      `type FooProps = { id: string };\nexport function Foo(props: FooProps) { return null; }`,
      "src/components/foo/Foo/index.tsx",
    );

    expect(violations).toHaveLength(1);
    expect(violations[0].rule).toBe("component-index");
  });

  it("flags nested components in component index", () => {
    const violations = checkComponentIndex(
      `function Field() { return null; }\nexport function OrderForm() { return <Field />; }`,
      "src/components/order/OrderForm/index.tsx",
    );

    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain("Field");
  });

  it("allows thin app pages", () => {
    const violations = checkAppPage(
      `import { CheckoutSuccessPage } from "@/components/checkout/CheckoutSuccessPage";\nexport default function Page() { return <CheckoutSuccessPage />; }`,
      "src/app/checkout/success/page.tsx",
    );

    expect(violations).toHaveLength(0);
  });

  it("flags inline UI in app pages", () => {
    const violations = checkAppPage(
      `export default function Page() { return <section><h1>Pedido</h1></section>; }`,
      "src/app/order/page.tsx",
    );

    expect(violations.length).toBeGreaterThan(0);
    expect(violations.some((item) => item.rule === "app-thin")).toBe(true);
  });

  it("ignores ui components", () => {
    const violations = checkFile(
      "src/components/ui/button.tsx",
      `type ButtonProps = { children: React.ReactNode }; export function Button() { return null; }`,
    );

    expect(violations).toHaveLength(0);
  });
});
