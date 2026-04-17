import { InternalPdfProvider } from "@/lib/shipping/internal-pdf-provider";
import type { CreateLabelInput, CreateLabelResult, ShippingLabelProvider } from "@/lib/shipping/provider";
import { env } from "@/lib/env";
import { log } from "@/lib/logger";

export class MondialRelayProvider implements ShippingLabelProvider {
  private fallback = new InternalPdfProvider();

  async createLabel(input: CreateLabelInput): Promise<CreateLabelResult> {
    // MVP: keep a graceful fallback even if API credentials are missing/invalid.
    if (!env.enableMondialRelay || !env.mondialRelayApiUrl || !env.mondialRelayApiKey) {
      return this.fallback.createLabel(input);
    }

    try {
      const response = await fetch(`${env.mondialRelayApiUrl}/labels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.mondialRelayApiKey}`,
        },
        body: JSON.stringify({
          order_number: input.orderNumber,
          sender: input.sender,
          receiver: input.receiver,
          items_count: input.items.length,
        }),
      });
      if (!response.ok) {
        throw new Error(`Mondial Relay label creation failed: ${response.status}`);
      }

      const payload = await response.json().catch(() => null);
      const labelBase64 = payload?.label_pdf_base64 as string | undefined;
      const trackingNumber = payload?.tracking_number as string | undefined;
      if (!labelBase64) throw new Error("Mondial Relay response missing label payload");

      let bytes: Uint8Array;
      if (typeof atob === "function") {
        const binary = atob(labelBase64);
        bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
      } else {
        bytes = Uint8Array.from([]);
      }

      return {
        pdfBytes: bytes,
        trackingNumber: trackingNumber ?? null,
      };
    } catch (error) {
      log.warn("Mondial Relay provider failed, fallback to internal PDF", {
        reason: error instanceof Error ? error.message : "unknown",
        order_number: input.orderNumber,
      });
      return this.fallback.createLabel(input);
    }
  }
}
