import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export function CheckoutCancelActions() {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      <Button asChild>
        <Link href={ROUTES.pricing}>Voltar aos valores</Link>
      </Button>
      <Button variant="outline" asChild>
        <Link href={ROUTES.home}>Ir para o início</Link>
      </Button>
    </div>
  );
}
