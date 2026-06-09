import { getSupabaseAdmin } from "@/lib/supabase";

export type PendingCountsResult =
  | { success: true; counts: Record<string, number> }
  | { success: false; error: string };

export async function countPendingOrdersByDates(
  dates: string[],
): Promise<PendingCountsResult> {
  if (dates.length === 0) {
    return { success: true, counts: {} };
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("orders")
    .select("scheduled_date")
    .eq("status", "pending")
    .in("scheduled_date", dates);

  if (error) {
    console.error("[orders] pending count failed", error);
    return {
      success: false,
      error: "Não foi possível consultar reservas.",
    };
  }

  const counts: Record<string, number> = {};

  for (const row of data ?? []) {
    const date = row.scheduled_date as string | null;

    if (!date) {
      continue;
    }

    counts[date] = (counts[date] ?? 0) + 1;
  }

  return { success: true, counts };
}
