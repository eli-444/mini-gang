import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "edge";

const schema = z.object({
  path: z.string().min(3),
  sort_order: z.number().int().min(0).default(0),
  principale: z.boolean().default(false),
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const { id } = await context.params;

  const json = await request.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const supabase = createSupabaseAdminClient();
  const { data: existingImages, error: countError } = await supabase
    .from("photos_vetements")
    .select("id")
    .eq("vetement_id", id)
    .limit(3);

  if (countError) return NextResponse.json({ error: countError.message }, { status: 500 });
  if ((existingImages ?? []).length >= 3) {
    return NextResponse.json({ error: "Un vetement peut avoir 3 images maximum." }, { status: 400 });
  }

  const shouldBeMain = parsed.data.principale || (existingImages ?? []).length === 0;
  if (shouldBeMain) {
    const { error: resetError } = await supabase
      .from("photos_vetements")
      .update({ principale: false })
      .eq("vetement_id", id);

    if (resetError) return NextResponse.json({ error: resetError.message }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("photos_vetements")
    .insert({
      vetement_id: id,
      url: parsed.data.path,
      position: parsed.data.sort_order,
      principale: shouldBeMain,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
