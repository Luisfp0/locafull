import type { FieldProps } from "./types";

export function Field({ id, label, required, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-foreground text-sm font-medium">
        {label}
        {required ? " *" : ""}
      </label>
      {children}
    </div>
  );
}
