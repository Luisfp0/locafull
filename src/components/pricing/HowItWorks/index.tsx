import { HOW_IT_WORKS_STEPS } from "./constants";

export function HowItWorks() {
  return (
    <section
      aria-labelledby="how-it-works-heading"
      className="flex flex-col gap-8"
    >
      <h2
        id="how-it-works-heading"
        className="text-primary text-center text-xl font-bold sm:text-2xl"
      >
        Como funciona
      </h2>
      <ol className="grid gap-6 sm:grid-cols-3">
        {HOW_IT_WORKS_STEPS.map((step, index) => (
          <li
            key={step.title}
            className="border-border flex flex-col items-center gap-4 rounded-xl border bg-white p-6 text-center"
          >
            <span className="bg-primary inline-flex size-8 items-center justify-center rounded-full text-sm font-bold text-white">
              {index + 1}
            </span>
            <div className="flex flex-col gap-2">
              <h3 className="text-primary font-semibold">{step.title}</h3>
              <p className="text-foreground text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
