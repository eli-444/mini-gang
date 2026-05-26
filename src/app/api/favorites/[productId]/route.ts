import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/auth";
import { addFavoriteProduct, ensureFavoriteUserProfile, isFavoriteProduct, removeFavoriteProduct } from "@/lib/favorites";
import { getProductById } from "@/lib/products";

const paramsSchema = z.object({
  productId: z.string().uuid(),
});

async function getUserOrUnauthorized() {
  const { user } = await getAuthenticatedUser();
  if (!user) return { response: NextResponse.json({ error: "Connexion requise." }, { status: 401 }) };
  return { user };
}

export async function GET(_: Request, context: { params: Promise<{ productId: string }> }) {
  const params = paramsSchema.safeParse(await context.params);
  if (!params.success) return NextResponse.json({ error: "Produit invalide." }, { status: 400 });

  const auth = await getUserOrUnauthorized();
  if ("response" in auth) return auth.response;

  const isFavorite = await isFavoriteProduct(auth.user.id, params.data.productId);
  return NextResponse.json({ isFavorite });
}

export async function PUT(_: Request, context: { params: Promise<{ productId: string }> }) {
  const params = paramsSchema.safeParse(await context.params);
  if (!params.success) return NextResponse.json({ error: "Produit invalide." }, { status: 400 });

  const auth = await getUserOrUnauthorized();
  if ("response" in auth) return auth.response;

  const product = await getProductById(params.data.productId);
  if (!product) return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });

  try {
    await ensureFavoriteUserProfile(auth.user);
    await addFavoriteProduct(auth.user.id, params.data.productId);
    return NextResponse.json({ isFavorite: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Favori impossible." },
      { status: 500 },
    );
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ productId: string }> }) {
  const params = paramsSchema.safeParse(await context.params);
  if (!params.success) return NextResponse.json({ error: "Produit invalide." }, { status: 400 });

  const auth = await getUserOrUnauthorized();
  if ("response" in auth) return auth.response;

  await removeFavoriteProduct(auth.user.id, params.data.productId);
  return NextResponse.json({ isFavorite: false });
}
