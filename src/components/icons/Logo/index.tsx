import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

import type { ILogo } from "./types";

const LOGO_SRC = "/images/logo-locafull.png";

export function Logo({ className, showTagline = false }: ILogo) {
  return (
    <Link
      href="/"
      className={cn("inline-flex shrink-0 flex-col items-start", className)}
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
        <p className="mt-0.5 max-w-[12rem] text-[length:var(--font-body6)] font-[var(--font-weight-medium)] uppercase leading-tight tracking-wide text-[var(--dark-gray)]">
          Agilidade que movimenta sua obra
        </p>
      )}
    </Link>
  );
}
