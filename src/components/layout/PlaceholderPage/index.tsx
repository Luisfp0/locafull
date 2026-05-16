import type { IPlaceholderPage } from "./types";

export function PlaceholderPage({ title, description }: IPlaceholderPage) {
  return (
    <section className="mx-auto flex min-h-[50vh] max-w-7xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
      <h1 className="text-headline-4 text-primary font-bold">{title}</h1>
      <p className="text-foreground mt-4 max-w-md text-base">
        {description ?? "Esta página estará disponível em breve."}
      </p>
    </section>
  );
}
