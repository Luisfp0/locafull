import type { PaymentNoticeProps } from "./types";

export function PaymentNotice({ className }: PaymentNoticeProps) {
  return (
    <div
      className={`border-warning/30 bg-alert-3/40 text-primary flex flex-col gap-1 rounded-xl border px-4 py-3 text-center text-sm sm:text-base ${className ?? ""}`}
      role="note"
    >
      <p>
        <span className="font-semibold">Pagamento:</span> PIX ou dinheiro
      </p>
      <p>Não aceitamos cartão de crédito ou débito</p>
    </div>
  );
}
