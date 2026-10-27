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
}

export interface AvailableStockSize {
  shirtColor: string | null;
  shirtSize: string | null;
  stockQuantity: number;
}
