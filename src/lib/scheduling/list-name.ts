const WEEKDAY_PT = [
  "DOMINGO",
  "SEGUNDA-FEIRA",
  "TERÇA-FEIRA",
  "QUARTA-FEIRA",
  "QUINTA-FEIRA",
  "SEXTA-FEIRA",
  "SÁBADO",
] as const;

const ENTREGAR_LIST_PATTERN = /^ENTREGAR\s*-\s*.+\s*-\s*(\d{2})\/(\d{2})$/i;

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function buildEntregarListName(date: Date): string {
  const weekday = WEEKDAY_PT[date.getDay()];
  const day = pad2(date.getDate());
  const month = pad2(date.getMonth() + 1);

  return `ENTREGAR - ${weekday} - ${day}/${month}`;
}

export function parseEntregarListDate(
  name: string,
  year: number,
): string | null {
  const match = name.trim().match(ENTREGAR_LIST_PATTERN);

  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const parsed = new Date(year, month - 1, day);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return `${year}-${pad2(month)}-${pad2(day)}`;
}

export function formatIsoDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());

  return `${year}-${month}-${day}`;
}

export function parseIsoDateLocal(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}
