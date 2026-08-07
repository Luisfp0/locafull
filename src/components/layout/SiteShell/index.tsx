import { Header } from "../Header";
import type { SiteShellProps } from "./types";

export const SiteShell = ({ children }: SiteShellProps) => {
  return (
    <div>
      <Header />
      <main className="w-full">{children}</main>
    </div>
  );
};
