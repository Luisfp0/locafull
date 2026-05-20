import { SiteShell } from "@/components/layout/SiteShell";

import type { CheckoutResultLayoutProps } from "./types";

export function CheckoutResultLayout({
  title,
  description,
  actions,
}: CheckoutResultLayoutProps) {
  return (
    <SiteShell>
      <section className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-headline-4 text-primary font-bold">{title}</h1>
        <p className="text-foreground text-base leading-relaxed">
          {description}
        </p>
        {actions}
      </section>
    </SiteShell>
  );
}
