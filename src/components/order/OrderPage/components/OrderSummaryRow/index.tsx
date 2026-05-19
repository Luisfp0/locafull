import type { OrderSummaryRowProps } from "./types";

export function OrderSummaryRow({ label, value }: OrderSummaryRowProps) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-primary font-semibold">{value}</dd>
    </div>
  );
}
