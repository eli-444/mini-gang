import { z } from "zod";
import { ageRangeOptions } from "@/lib/age-options";

const ageRangeSchema = z.enum(ageRangeOptions);
const emptyStringToUndefined = (value: unknown) => (value === "" ? undefined : value);
const urlOrAbsolutePathSchema = z
  .string()
  .trim()
  .refine((value) => value.startsWith("/") || /^https?:\/\//.test(value), "URL invalide");

export const productFiltersSchema = z.object({
  q: z.preprocess(emptyStringToUndefined, z.string().trim().max(120).optional()),
  shop_section: z.preprocess(emptyStringToUndefined, z.enum(["vetements", "merche"]).optional()),
  categorie: z.preprocess(
    emptyStringToUndefined,
    z.enum(["haut", "bas", "robe", "veste", "manteau", "chaussures", "accessoire", "autre"]).optional(),
  ),
  age_range: z.preprocess(emptyStringToUndefined, ageRangeSchema.optional()),
  genre: z.preprocess(emptyStringToUndefined, z.enum(["femme", "homme"]).optional()),
  brand: z.preprocess(emptyStringToUndefined, z.string().trim().max(80).optional()),
  condition: z.preprocess(emptyStringToUndefined, z.enum(["neuf", "tres_bon", "bon", "correct"]).optional()),
  size_label: z.preprocess(emptyStringToUndefined, z.string().trim().max(30).optional()),
  min_price: z.preprocess(emptyStringToUndefined, z.coerce.number().int().min(0).optional()),
  max_price: z.preprocess(emptyStringToUndefined, z.coerce.number().int().min(0).optional()),
  sort: z.preprocess(emptyStringToUndefined, z.enum(["newest", "price_asc", "price_desc"]).default("newest")),
  cursor: z.preprocess(emptyStringToUndefined, z.string().optional()),
  limit: z.coerce.number().int().min(1).max(48).default(24),
});

export const checkoutItemSchema = z.object({
  productId: z.string().uuid(),
});

export const checkoutCreateSchema = z.object({
  provider: z.enum(["stripe", "twint"]),
  email: z.string().email(),
  items: z.array(checkoutItemSchema).min(1).max(20),
  shipping: z.object({
    name: z.string().trim().min(2).max(120),
    phone: z.string().trim().min(6).max(40),
    line1: z.string().trim().min(2).max(200),
    line2: z.string().trim().max(200).optional().or(z.literal("")),
    postalCode: z.string().trim().min(2).max(20),
    city: z.string().trim().min(2).max(100),
    country: z.string().trim().length(2).default("CH"),
  }),
  acceptTerms: z.literal(true),
});

export const adminPaymentSettingsSchema = z.object({
  merchant_bank_holder: z.string().trim().max(160).optional().or(z.literal("")),
  merchant_bank_name: z.string().trim().max(160).optional().or(z.literal("")),
  merchant_iban: z
    .string()
    .trim()
    .max(80)
    .regex(/^[A-Z0-9 ]*$/i, "IBAN invalide")
    .optional()
    .or(z.literal("")),
  card_payments_enabled: z.boolean().default(true),
  twint_payments_enabled: z.boolean().default(false),
  twint_merchant_id: z.string().trim().max(160).optional().or(z.literal("")),
  twint_api_base_url: z.string().trim().url().optional().or(z.literal("")),
  twint_api_key_reference: z.string().trim().max(160).optional().or(z.literal("")),
  shipping_fee_cents: z.coerce.number().int().min(0).max(5000).default(790),
});

export const siteContentSettingsSchema = z.object({
  home_event_enabled: z.boolean().default(false),
  home_event_title: z.string().trim().max(160).optional().or(z.literal("")),
  home_event_text: z.string().trim().max(2000).optional().or(z.literal("")),
  home_event_image_path: z.string().trim().max(400).optional().or(z.literal("")),
  home_event_cta_label: z.string().trim().max(80).optional().or(z.literal("")),
  home_event_cta_url: urlOrAbsolutePathSchema.optional().or(z.literal("")),
});

export const adminProductSchema = z.object({
  title: z.string().trim().min(3).max(140),
  description: z.string().trim().max(3000).optional().or(z.literal("")),
  price_cents: z.coerce.number().int().min(50).max(50000),
  brand: z.string().trim().max(80).optional().or(z.literal("")),
  condition: z.enum(["neuf", "tres_bon", "bon", "correct"]),
  categorie: z.enum(["haut", "bas", "robe", "veste", "manteau", "chaussures", "accessoire", "autre"]),
  age_range: ageRangeSchema,
  size_label: z.string().trim().max(30).optional().or(z.literal("")),
  sex: z.enum(["femme", "homme", "enfant", "mixte"]),
  couleur: z.string().trim().max(60).optional().or(z.literal("")),
  matiere: z.string().trim().max(80).optional().or(z.literal("")),
  mis_en_avant: z.boolean().default(false),
  status: z.enum(["brouillon", "disponible", "reserve", "vendu", "archive"]).default("disponible"),
});

export const adminOrderStatusSchema = z.object({
  status: z.enum(["en_attente", "payee", "preparee", "envoyee", "livree", "annulee", "remboursee"]),
  internal_notes: z.string().trim().max(3000).optional(),
});

export const adminShipmentSchema = z.object({
  carrier: z.string().trim().min(2).max(120),
  tracking_number: z.string().trim().max(160).optional().or(z.literal("")),
  tracking_url: z.string().trim().url().optional().or(z.literal("")),
  status: z.enum(["preparation", "expediee", "livree", "incident"]).default("preparation"),
  shipped_at: z.string().datetime().optional().or(z.literal("")),
});

export const returnRequestSchema = z.object({
  order_id: z.string().uuid(),
  reason: z.string().trim().min(5).max(120),
  message: z.string().trim().min(10).max(3000),
});

export const adminReturnStatusSchema = z.object({
  status: z.enum(["demande", "accepte", "refuse", "rembourse", "clos"]),
  admin_notes: z.string().trim().max(3000).optional().or(z.literal("")),
});

export const sellOrderItemSchema = z.object({
  category: z.string().trim().min(2).max(80),
  brand: z.string().trim().max(80).optional().or(z.literal("")),
  size_label: z.string().trim().max(30).optional().or(z.literal("")),
  age_range: z.string().trim().max(30).optional().or(z.literal("")),
  condition: z.enum(["new", "like_new", "very_good", "good", "fair"]),
  material: z.string().trim().max(80).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  image_paths: z.array(z.string().trim().min(3).max(400)).max(5).optional(),
});

export const sellOrderCreateSchema = z.object({
  shipping_provider: z.enum(["mondial_relay", "laposte", "internal"]),
  sender: z.object({
    name: z.string().trim().min(2).max(120),
    email: z.string().email(),
    line1: z.string().trim().min(2).max(200),
    line2: z.string().trim().max(200).optional().or(z.literal("")),
    postalCode: z.string().trim().min(2).max(20),
    city: z.string().trim().min(2).max(100),
    country: z.string().trim().min(2).max(2).default("CH"),
  }),
  items: z.array(sellOrderItemSchema).min(1).max(80),
});

export const sellOrderTrackingSchema = z.object({
  tracking_number: z.string().trim().min(3).max(120),
});

export const payoutRequestSchema = z.object({
  amount_cents: z.coerce.number().int().min(100),
});

export const adminSellOrderDecideSchema = z.object({
  items: z
    .array(
      z.object({
        item_id: z.string().uuid(),
        decision: z.enum(["accepted", "rejected"]),
        final_buyback_cents: z.coerce.number().int().min(0).max(50000),
      }),
    )
    .min(1),
});

export const sellerProfileUpdateSchema = z.object({
  full_name: z.string().trim().max(120).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  line1: z.string().trim().max(200).optional().or(z.literal("")),
  line2: z.string().trim().max(200).optional().or(z.literal("")),
  postal_code: z.string().trim().max(20).optional().or(z.literal("")),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  country: z.string().trim().max(2).optional().or(z.literal("")),
  iban_last4: z.string().trim().max(4).optional().or(z.literal("")),
  iban_encrypted: z.string().trim().max(600).optional().or(z.literal("")),
  notifications_email: z.boolean().optional(),
});
