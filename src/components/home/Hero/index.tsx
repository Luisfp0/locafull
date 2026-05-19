import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ROUTES, SITE_TAGLINE } from "@/lib/constants";

import type { IHero } from "./types";

const HERO_EQUIPMENT_SRC = "/images/hero-equipamento.png";

export function Hero({ className }: IHero) {
  return (
    <section
      className={`from-primary via-primary-light to-warning relative overflow-hidden bg-gradient-to-br text-white ${className ?? ""}`}
    >
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-24">
        <div>
          <p className="text-alert-3 text-sm font-medium tracking-widest uppercase">
            {SITE_TAGLINE}
          </p>
          <h1 className="text-headline-4 sm:text-headline-3 mt-4 leading-tight font-bold text-white">
            Locação de mini caçambas para sua obra em Goiânia e região
          </h1>
          <p className="mt-4 max-w-xl text-lg text-gray-100">
            Rápido, fácil e ideal para pequenas obras, reformas e limpeza de
            terrenos. Tambores e barris para resíduos da sua construção.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button size="lg" asChild>
              <Link href={ROUTES.order}>Peça agora</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-black hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link href={ROUTES.contact}>Fale conosco</Link>
            </Button>
          </div>
        </div>
        <div className="relative flex justify-center lg:justify-end">
          <div className="shadow-brand relative aspect-[4/3] w-full max-w-lg overflow-hidden rounded-2xl border border-white/20">
            <Image
              src={HERO_EQUIPMENT_SRC}
              alt="Mini caçamba Locafull laranja em trailer, pronta para entrega"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 512px"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
