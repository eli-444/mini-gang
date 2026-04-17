export type ProductCondition = "neuf" | "tres_bon" | "bon" | "correct";
export type ProductSex = "femme" | "homme" | "enfant" | "mixte";
export type ProductStatus = "brouillon" | "disponible" | "reserve" | "vendu" | "archive";
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
  currency: string;
  brand: string | null;
  condition: ProductCondition;
  age_range: string | null;
  size_label: string | null;
  sex: ProductSex;
  status: ProductStatus;
  reserved_until: string | null;
  created_at: string;
  product_images?: ProductImage[];
}
