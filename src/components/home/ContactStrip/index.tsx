import type { ContactStripProps } from "./types";
import { CONTACT_ITEMS } from "./utils";

export function ContactStrip({ className }: ContactStripProps) {
  return (
    <section
      className={`bg-white py-12 ${className ?? ""}`}
      aria-labelledby="contact-strip-heading"
    >
      <h2 id="contact-strip-heading" className="text-foreground sr-only">
        Contato
      </h2>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {CONTACT_ITEMS.map((item) => {
          const Icon = item.icon;
          const content = (
            <>
              <Icon className="text-primary size-5 shrink-0" />
              <div className="flex flex-col gap-1">
                <p className="text-black-1 text-xs font-bold tracking-wide uppercase">
                  {item.label}
                </p>
                <p className="text-warning text-base font-medium">
                  {item.value}
                </p>
              </div>
            </>
          );

          if ("href" in item && item.href) {
            return (
              <a
                key={item.label}
                href={item.href}
                {...("external" in item && item.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="flex gap-3 transition-opacity hover:opacity-80"
              >
                {content}
              </a>
            );
          }

          return (
            <div key={item.label} className="flex gap-3">
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}
