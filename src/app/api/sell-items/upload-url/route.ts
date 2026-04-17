import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST() {
  return NextResponse.json(
    { error: "Les depots vendeur ne font plus partie de la nouvelle base simplifiee." },
    { status: 410 },
  );
}
