export interface LabelAddress {
  name: string;
  line1: string;
  line2?: string | null;
  postalCode: string;
  city: string;
  country: string;
  email?: string | null;
}

export interface LabelParcelItem {
  category: string;
  brand?: string | null;
  sizeLabel?: string | null;
  condition: string;
}

export interface CreateLabelInput {
  userId: string;
  orderId: string;
  orderNumber: string;
  shippingProvider: "mondial_relay" | "laposte" | "internal";
  sender: LabelAddress;
  receiver: LabelAddress;
  items: LabelParcelItem[];
  estimatedTotalCents: number;
}

export interface CreateLabelResult {
  pdfBytes: Uint8Array;
  trackingNumber?: string | null;
}

export interface ShippingLabelProvider {
  createLabel(input: CreateLabelInput): Promise<CreateLabelResult>;
}
