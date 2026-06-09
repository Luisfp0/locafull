import { isDeliveryCandidateDate } from "@/lib/scheduling/dates";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function parseScheduledDate(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!ISO_DATE_PATTERN.test(trimmed)) {
    return null;
  }

  const [year, month, day] = trimmed.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return trimmed;
}

export function validateScheduledDateCandidate(
  isoDate: string,
  now: Date = new Date(),
): boolean {
  return isDeliveryCandidateDate(isoDate, now);
}
