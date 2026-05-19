import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

import type { LogoProps } from "./types";

const LOGO_SRC = "/images/logo-locafull.png";

export function Logo({ className, showTagline = false }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex shrink-0 flex-col items-start gap-0.5",
        className,
      )}
    >
      <Image
        src={LOGO_SRC}
        alt="Locafull — Agilidade que movimenta sua obra"
        width={180}
        height={56}
        className="h-10 w-auto object-contain sm:h-11"
        priority
      />
      {showTagline && (
        <p className="text-foreground max-w-[12rem] text-xs leading-tight font-medium tracking-wide uppercase">
          Agilidade que movimenta sua obra
        </p>
      )}
    </Link>
  );
}
