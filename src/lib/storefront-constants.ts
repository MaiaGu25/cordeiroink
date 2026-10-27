export const CATALOG_CATEGORIES = [
  "Adulto",
  "Infantil",
  "Oversized",
  "Feminina",
  "Regata",
] as const;

export type CatalogCategory = (typeof CATALOG_CATEGORIES)[number];

export interface VariantInput {
  id?: string;
  colorName: string;
  hexCode: string;
  imageUrl: string;
  backImageUrl?: string;
}

export interface AvailableStockSize {
  shirtColor: string | null;
  shirtSize: string | null;
  stockQuantity: number;
}

export interface VirtualRackColor {
  name: string;
  hex: string;
  imageUrl: string;
  backImageUrl?: string | null;
}

export interface VirtualRackProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  collection?: string | null;
  description?: string | null;
  imageUrl: string;
  backImageUrl?: string | null;
  colors: VirtualRackColor[];
}
