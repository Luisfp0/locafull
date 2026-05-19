import Link from "next/link";

import { Button } from "@/components/ui/button";
import { buildOrderHref } from "@/components/pricing/utils";
import { formatBRL } from "@/lib/utils";

import type { ProductCombosProps } from "../../types";

export function ProductCombos({ product }: ProductCombosProps) {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-primary text-sm font-semibold">Combos</p>
      <ul className="grid gap-3 sm:grid-cols-3">
        {product.combos!.map((combo) => (
          <li key={combo.id}>
            <div className="border-border flex h-full flex-col gap-3 rounded-lg border p-3 text-center">
              <p className="text-foreground text-sm font-medium">
                {combo.label}
              </p>
              <p className="text-warning text-lg font-bold">
                {formatBRL(combo.priceCents)}
              </p>
              {product.orderEnabled && (
                <Button size="sm" className="w-full" asChild>
                  <Link href={buildOrderHref(product.id, combo.id)}>
                    Escolher
                  </Link>
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
