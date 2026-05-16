import { ContactStrip } from "@/components/home/ContactStrip";
import { Hero } from "@/components/home/Hero";
import { SiteShell } from "@/components/layout/SiteShell";

export default function HomePage() {
  return (
    <SiteShell>
      <Hero />
      <ContactStrip />
    </SiteShell>
  );
}
