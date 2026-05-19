import Image from "next/image";

import type { WhatWeDoCardImageProps } from "./types";

export function WhatWeDoCardImage({ item }: WhatWeDoCardImageProps) {
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
