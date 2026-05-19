import { ContactStrip } from "@/components/home/ContactStrip";
import { Hero } from "@/components/home/Hero";
import { WhatWeDo } from "@/components/home/WhatWeDo";
import { SiteShell } from "@/components/layout/SiteShell";

export default function HomePage() {
  return (
    <SiteShell>
      <Hero />
      <WhatWeDo />
      <ContactStrip />
    </SiteShell>
  );
}
