import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

import { WhatWeDoCardImage } from "./components/WhatWeDoCardImage";
import { WHAT_WE_DO_DESCRIPTION, WHAT_WE_DO_ITEMS } from "./constants";
import type { WhatWeDoProps } from "./types";

export function WhatWeDo({ className }: WhatWeDoProps) {
  return (
    <section
      className={`from-primary via-primary-light to-primary bg-gradient-to-br py-16 sm:py-20 ${className ?? ""}`}
      aria-labelledby="what-we-do-heading"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 sm:px-6 lg:px-8">
        <header className="text-center">
          <h2
            id="what-we-do-heading"
            className="text-headline-4 sm:text-headline-3 font-bold text-white"
          >
            O que nós fazemos
          </h2>
        </header>

        <ul className="grid list-none gap-6 p-0 md:grid-cols-3 md:gap-8">
          {WHAT_WE_DO_ITEMS.map((item) => (
            <li key={item.title}>
              <article className="shadow-brand overflow-hidden rounded-2xl">
                <WhatWeDoCardImage item={item} />
                <h3 className="text-primary bg-white px-3 py-4 text-center text-sm font-bold sm:text-base">
                  {item.title}
                </h3>
              </article>
            </li>
          ))}
        </ul>

        <div className="flex flex-col items-center gap-8">
          <p className="mx-auto max-w-2xl text-center text-base leading-relaxed text-gray-100">
            {WHAT_WE_DO_DESCRIPTION}
          </p>
          <div className="flex justify-center">
            <Button size="lg" asChild>
              <Link href={ROUTES.pricing}>Ver valores e solicitar</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
