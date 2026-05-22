import type { ReactNode } from "react";

export type FieldProps = {
  id: string;
  label: string;
  required?: boolean;
  children: ReactNode;
};
