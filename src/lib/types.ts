export type ProductCondition =
  | "beaucoup_aime"
  | "bon"
  | "tres_bon"
  | "comme_neuf"
  | "neuf_etiquettes"
  | "neuf"
  | "correct";
export type ProductSex = "femme" | "homme" | "enfant" | "mixte";
export type ProductStatus = "brouillon" | "disponible" | "hors_ligne" | "reserve" | "vendu" | "archive";
export type OrderStatus = "en_attente" | "payee" | "preparee" | "envoyee" | "livree" | "annulee" | "remboursee";
export type PaymentProviderName = "stripe" | "klarna" | "twint";

export interface ProductImage {
  id: string;
  product_id: string;
  path: string;
  url: string;
  sort_order: number;
  principale: boolean;
}

export interface Product {
  id: string;
  title: string;
  description: string | null;
  price_cents: number;
  compare_at_price_cents: number | null;
  currency: string;
  brand: string | null;
  condition: ProductCondition;
  category: string | null;
  season: string | null;
  age_range: string | null;
  size_label: string | null;
  sex: ProductSex;
  status: ProductStatus;
  stock_quantity: number | null;
  stock_location: string | null;
  featured: boolean;
  reserved_until: string | null;
  created_at: string;
  product_images?: ProductImage[];
}
