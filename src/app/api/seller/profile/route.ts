import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  return NextResponse.json({ profile: null, email: null });
}

export async function POST() {
  return NextResponse.json(
    { error: "Les profils vendeur ne font plus partie de la nouvelle base simplifiee." },
    { status: 410 },
  );
}
