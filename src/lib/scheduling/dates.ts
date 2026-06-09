import { HORIZON_DAYS, MIN_ADVANCE_DAYS, SUNDAY } from "./constants";
import { formatIsoDateLocal } from "./list-name";

export function getDeliveryCandidateDates(now: Date = new Date()): string[] {
  const dates: string[] = [];
  const start = new Date(now);
  start.setHours(12, 0, 0, 0);
  start.setDate(start.getDate() + MIN_ADVANCE_DAYS);

  const end = new Date(start);
  end.setDate(end.getDate() + HORIZON_DAYS);

  for (
    const cursor = new Date(start);
    cursor <= end;
    cursor.setDate(cursor.getDate() + 1)
  ) {
    if (cursor.getDay() === SUNDAY) {
      continue;
    }

    dates.push(formatIsoDateLocal(cursor));
  }

  return dates;
}

export function isDeliveryCandidateDate(
  isoDate: string,
  now: Date = new Date(),
): boolean {
  return getDeliveryCandidateDates(now).includes(isoDate);
}
