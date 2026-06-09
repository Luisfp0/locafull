import type { DeliveryDateOption, DeliveryDatesApiResponse } from "./types";

let cachedOptions: DeliveryDateOption[] | null = null;
let inFlight: Promise<DeliveryDateOption[] | { error: string }> | null = null;

export function getCachedDeliveryDateOptions(): DeliveryDateOption[] | null {
  return cachedOptions;
}

export async function loadDeliveryDateOptions(): Promise<
  DeliveryDateOption[] | { error: string }
> {
  if (cachedOptions) {
    return cachedOptions;
  }

  if (inFlight) {
    return inFlight;
  }

  inFlight = (async () => {
    try {
      const response = await fetch("/api/availability/delivery-dates");
      const data = (await response.json()) as DeliveryDatesApiResponse;

      if (!response.ok || "error" in data) {
        return {
          error:
            ("error" in data && data.error) ||
            "Não foi possível carregar as datas disponíveis.",
        };
      }

      cachedOptions = data.dates;
      return data.dates;
    } catch {
      return { error: "Erro de conexão ao carregar datas disponíveis." };
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}
