import type { PlaceholderPageProps } from "./types";

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section className="mx-auto flex min-h-[50vh] max-w-7xl flex-col items-center justify-center gap-4 px-4 py-16 text-center sm:px-6 lg:px-8">
      <h1 className="text-headline-4 text-primary font-bold">{title}</h1>
      <p className="text-foreground max-w-md text-base">
        {description ?? "Esta página estará disponível em breve."}
      </p>
    </section>
  );
}
