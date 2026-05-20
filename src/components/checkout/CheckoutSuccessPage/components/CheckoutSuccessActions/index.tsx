import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export function CheckoutSuccessActions() {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      <Button asChild>
        <Link href={ROUTES.home}>Voltar ao início</Link>
      </Button>
      <Button variant="outline" asChild>
        <Link href={ROUTES.pricing}>Ver outros equipamentos</Link>
      </Button>
    </div>
  );
}
