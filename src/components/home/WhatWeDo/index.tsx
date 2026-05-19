import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { WHAT_WE_DO_DESCRIPTION, WHAT_WE_DO_ITEMS } from "@/lib/constants";

import type { IWhatWeDo } from "./types";

export function WhatWeDo({ className }: IWhatWeDo) {
  return (
    <section
      className={`from-primary via-primary-light to-primary bg-gradient-to-br py-16 sm:py-20 ${className ?? ""}`}
      aria-labelledby="what-we-do-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="text-center">
          <h2
            id="what-we-do-heading"
            className="text-headline-4 sm:text-headline-3 font-bold text-white"
          >
            O que nós fazemos
          </h2>
          <p className="text-alert-3 mt-2 text-sm">veja abaixo</p>
        </header>

        <ul className="mt-10 grid list-none gap-6 p-0 md:grid-cols-3 md:gap-8">
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

        <p className="mx-auto mt-10 max-w-2xl text-center text-base leading-relaxed text-gray-100">
          {WHAT_WE_DO_DESCRIPTION}
        </p>

        <div className="mt-8 flex justify-center">
          <Button size="lg" asChild>
            <Link href="/pedido">Peça agora</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function WhatWeDoCardImage({
  item,
}: {
  item: (typeof WHAT_WE_DO_ITEMS)[number];
}) {
  return (
    <div className="relative aspect-[4/3] w-full">
      <Image
        src={item.imageSrc}
        alt={item.imageAlt}
        fill
        className="object-cover object-center"
        sizes="(max-width: 768px) 100vw, 33vw"
      />
    </div>
  );
}
