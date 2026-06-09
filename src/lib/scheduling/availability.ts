import { parseIsoDateLocal } from "./list-name";

export type OccupancyInput = {
  trelloCards: number;
  pendingOrders: number;
};

export type DeliveryDateAvailability = {
  date: string;
  label: string;
  slotsRemaining: number;
};

export function computeSlotsRemaining(input: {
  trelloCards: number;
  pendingOrders: number;
  max: number;
}): number {
  const occupied = input.trelloCards + input.pendingOrders;
  return Math.max(0, input.max - occupied);
}

function formatDeliveryDateLabel(isoDate: string): string {
  const date = parseIsoDateLocal(isoDate);
  const formatted = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function buildAvailabilityForDates(input: {
  dates: string[];
  occupancyByDate: Record<string, OccupancyInput | undefined>;
  maxDeliveriesPerDay: number;
}): DeliveryDateAvailability[] {
  return input.dates.flatMap((date) => {
    const occupancy = input.occupancyByDate[date] ?? {
      trelloCards: 0,
      pendingOrders: 0,
    };
    const slotsRemaining = computeSlotsRemaining({
      trelloCards: occupancy.trelloCards,
      pendingOrders: occupancy.pendingOrders,
      max: input.maxDeliveriesPerDay,
    });

    if (slotsRemaining <= 0) {
      return [];
    }

    return [
      {
        date,
        label: formatDeliveryDateLabel(date),
        slotsRemaining,
      },
    ];
  });
}
