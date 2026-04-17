import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { releaseExpiredReservations } from "@/lib/checkout";

export const runtime = "edge";

export async function POST() {
  const auth = await requireAdminApi();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const result = await releaseExpiredReservations();
  return NextResponse.json(result);
}
