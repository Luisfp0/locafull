export type DeliveryDateFieldProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export type DeliveryDateOption = {
  date: string;
  label: string;
  slotsRemaining: number;
};

export type DeliveryDatesApiResponse =
  | { dates: DeliveryDateOption[] }
  | { error: string };
