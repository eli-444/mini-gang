import { env } from "@/lib/env";
import { InternalPdfProvider } from "@/lib/shipping/internal-pdf-provider";
import { MondialRelayProvider } from "@/lib/shipping/mondial-relay-provider";
import type { ShippingLabelProvider } from "@/lib/shipping/provider";

const internalProvider = new InternalPdfProvider();
const mondialRelayProvider = new MondialRelayProvider();

export function getShippingProvider(provider: "mondial_relay" | "laposte" | "internal"): ShippingLabelProvider {
  if (provider === "mondial_relay" && env.enableMondialRelay) return mondialRelayProvider;
  return internalProvider;
}
