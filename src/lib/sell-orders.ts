export type SellOrderStatus =
  | "draft"
  | "submitted"
  | "label_generated"
  | "shipped"
  | "received"
  | "inspecting"
  | "accepted"
  | "partially_accepted"
  | "rejected"
  | "credited"
  | "paid_out"
  | "closed";

export interface SellOrderSenderInput {
  name: string;
  email: string;
  line1: string;
  line2?: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface SellOrderItemInput {
  category: string;
  brand?: string;
  size_label?: string;
  age_range?: string;
  condition: "new" | "like_new" | "very_good" | "good" | "fair";
  material?: string;
  notes?: string;
  image_paths?: string[];
}

export interface CreateSellOrderInput {
  shipping_provider: "mondial_relay" | "laposte" | "internal";
  sender: SellOrderSenderInput;
  items: SellOrderItemInput[];
}

const emptyWallet = {
  schemaReady: false,
  account: { available_cents: 0, pending_cents: 0 },
  transactions: [] as Array<{
    id: string;
    type: string;
    amount_cents: number;
    status: string;
    created_at: string;
  }>,
  payouts: [],
};

function unsupported() {
  throw new Error("Les dossiers vendeur et la cagnotte ne font plus partie de la nouvelle base simplifiee.");
}

export async function createSellOrderDraft(_userId: string, _input: CreateSellOrderInput) {
  void _userId;
  void _input;
  unsupported();
}

export async function submitSellOrder(_userId: string, _sellOrderId: string) {
  void _userId;
  void _sellOrderId;
  unsupported();
}

export async function updateSellOrderTracking(_userId: string, _sellOrderId: string, _trackingNumber: string) {
  void _userId;
  void _sellOrderId;
  void _trackingNumber;
  unsupported();
}

export async function getSellerSellOrders(_userId: string, _status?: string) {
  void _userId;
  void _status;
  return [];
}

export async function getSellerSellOrderByNumber(_userId: string, _orderNumber: string) {
  void _userId;
  void _orderNumber;
  return null;
}

export async function getSellerWalletData(_userId: string) {
  void _userId;
  return emptyWallet;
}

export async function requestPayout(_userId: string, _amountCents: number) {
  void _userId;
  void _amountCents;
  unsupported();
}

export async function listAdminSellOrders(_input: { status?: string; limit?: number; offset?: number }) {
  void _input;
  return [];
}

export async function getAdminSellOrderById(_orderId: string) {
  void _orderId;
  return null;
}

export async function markAdminSellOrderReceived(_orderId: string, _adminUserId?: string) {
  void _orderId;
  void _adminUserId;
  unsupported();
}

interface DecideItemInput {
  item_id: string;
  decision: "accepted" | "rejected";
  final_buyback_cents: number;
}

export async function decideAdminSellOrder(_input: { orderId: string; items: DecideItemInput[]; adminUserId?: string }) {
  void _input;
  unsupported();
}

export async function markAdminPayoutPaid(_input: { payoutId: string; adminNote?: string | null; adminUserId?: string }) {
  void _input;
  unsupported();
}
