import type { IPlaceholderPage } from "./types";

export function PlaceholderPage({ title, description }: IPlaceholderPage) {
  return (
    <section className="mx-auto flex min-h-[50vh] max-w-7xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
      <h1 className="text-[length:var(--font-headline4)] font-[var(--font-weight-bold)] text-[var(--primary)]">
        {title}
      </h1>
      <p className="mt-4 max-w-md text-[length:var(--font-body4)] text-[var(--dark-gray)]">
        {description ?? "Esta página estará disponível em breve."}
      </p>
    </section>
  );
}
