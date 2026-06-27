import { Header } from "@/components/layout/Header";

import type { SiteShellProps } from "./types";

export function SiteShell({ children }: SiteShellProps) {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  );
}
