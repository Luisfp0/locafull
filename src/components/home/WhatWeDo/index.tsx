import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

import { WHAT_WE_DO_ITEMS } from "./constants";
import type { WhatWeDoProps } from "./types";
import Image from "next/image";

export function WhatWeDo({ className }: WhatWeDoProps) {
  return (
    <section
      className={`from-primary via-primary-light to-primary bg-linear-to-br py-16 sm:py-20 ${className ?? ""}`}
      aria-labelledby="what-we-do-heading"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 sm:px-6 lg:px-8">
        <header className="text-center">
          <h2 className="text-headline-4 sm:text-headline-3 font-bold text-white">
            O que nós fazemos
          </h2>
        </header>

        <div className="flex justify-around gap-4 md:gap-0">
          {WHAT_WE_DO_ITEMS.map((item) => (
            <div className="relative flex" key={item.title}>
              <Image
                className="rounded-lg"
                src={item.imageSrc}
                alt={item.imageAlt}
                width={400}
                height={300}
              />
              <div className="absolute bottom-0 flex w-full justify-center rounded-b-lg bg-white py-4">
                <h3 className="text-primary text-xs font-bold sm:text-base">
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-8">
          <p className="mx-auto max-w-2xl text-center text-base leading-relaxed text-gray-100">
            Somos especialistas em locação de mini caçambas, tambores e barris
            para obras, reformas e limpeza de terrenos em Goiânia e região.
            Fazemos a entrega e a retirada no local, com agilidade e
            equipamentos ideais para espaços menores.
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
