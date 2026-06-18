import { env } from "@/lib/env";
import type { OrderShippingLabelInput } from "@/lib/shipping/order-label";

export async function createLaPosteOrderLabel(input: OrderShippingLabelInput): Promise<Uint8Array | null> {
  if (!env.enableLaPoste || !env.laPosteApiUrl || !env.laPosteApiKey) return null;

  void input;
  // Integration point: call La Poste here, then return the PDF bytes received from the API.
  return null;
}
