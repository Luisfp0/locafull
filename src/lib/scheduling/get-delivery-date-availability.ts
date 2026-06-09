import { buildAvailabilityForDates } from "@/lib/scheduling/availability";
import { getDeliveryCandidateDates } from "@/lib/scheduling/dates";
import { countPendingOrdersByDates } from "@/lib/orders/count-pending-by-date";
import { fetchEntregarCardCountsByDate } from "@/lib/trello/client";
import { getTrelloConfig } from "@/lib/trello/config";

type AvailabilityCache = {
  cachedAt: number;
  payload: ReturnType<typeof buildAvailabilityForDates>;
};

let cache: AvailabilityCache | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function getDeliveryDateAvailability(): Promise<
  { dates: ReturnType<typeof buildAvailabilityForDates> } | { error: string }
> {
  const now = Date.now();

  if (cache && now - cache.cachedAt < CACHE_TTL_MS) {
    return { dates: cache.payload };
  }

  const config = getTrelloConfig();

  if (!config) {
    return { error: "Agendamento indisponível no momento." };
  }

  const candidateDates = getDeliveryCandidateDates();
  const year = new Date().getFullYear();
  const trelloCounts = await fetchEntregarCardCountsByDate(
    config.boardId,
    year,
    config,
  );

  if ("error" in trelloCounts) {
    return { error: "Não foi possível consultar disponibilidade." };
  }

  const pendingCounts = await countPendingOrdersByDates(candidateDates);

  if (!pendingCounts.success) {
    return { error: pendingCounts.error };
  }

  const occupancyByDate = Object.fromEntries(
    candidateDates.map((date) => [
      date,
      {
        trelloCards: trelloCounts[date] ?? 0,
        pendingOrders: pendingCounts.counts[date] ?? 0,
      },
    ]),
  );

  const dates = buildAvailabilityForDates({
    dates: candidateDates,
    occupancyByDate,
    maxDeliveriesPerDay: config.maxDeliveriesPerDay,
  });

  cache = { cachedAt: now, payload: dates };

  return { dates };
}

export async function getSlotsRemainingForDate(
  isoDate: string,
): Promise<number | { error: string }> {
  const availability = await getDeliveryDateAvailability();

  if ("error" in availability) {
    return { error: availability.error };
  }

  const match = availability.dates.find((entry) => entry.date === isoDate);
  return match?.slotsRemaining ?? 0;
}
