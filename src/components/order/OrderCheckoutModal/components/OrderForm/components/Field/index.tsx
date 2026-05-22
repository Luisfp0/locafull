import type { FieldProps } from "./types";

export function Field({ id, label, required, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm text-gray-500">
        {label}
        {required ? " *" : ""}
      </label>
      {children}
    </div>
  );
}
