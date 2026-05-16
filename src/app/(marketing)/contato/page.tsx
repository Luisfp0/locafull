import { ContactStrip } from "@/components/home/ContactStrip";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";
import { SiteShell } from "@/components/layout/SiteShell";

export default function ContatoPage() {
  return (
    <SiteShell>
      <PlaceholderPage
        title="Contato"
        description="Fale conosco pelos canais abaixo."
      />
      <ContactStrip />
    </SiteShell>
  );
}
