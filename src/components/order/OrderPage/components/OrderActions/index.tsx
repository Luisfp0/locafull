import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export function OrderActions() {
  return (
    <div className="flex flex-wrap gap-4">
      <Button asChild>
        <Link href={ROUTES.pricing}>Alterar seleção</Link>
      </Button>
      <Button variant="outline" asChild>
        <Link href={ROUTES.home}>Voltar ao início</Link>
      </Button>
    </div>
  );
}
