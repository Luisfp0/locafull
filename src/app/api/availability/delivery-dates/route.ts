import { NextResponse } from "next/server";

import { getDeliveryDateAvailability } from "@/lib/scheduling/get-delivery-date-availability";

export const runtime = "nodejs";

export async function GET() {
  const result = await getDeliveryDateAvailability();

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({ dates: result.dates });
}
