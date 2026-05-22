import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

import type { OrderActionsProps } from "./types";

export function OrderActions({ onClose }: OrderActionsProps) {
  return (
    <div className="flex flex-col gap-3">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={onClose}
      >
        Alterar seleção
      </Button>
      <Button variant="ghost" className="w-full" asChild>
        <Link href={ROUTES.home}>Voltar ao início</Link>
      </Button>
    </div>
  );
}
