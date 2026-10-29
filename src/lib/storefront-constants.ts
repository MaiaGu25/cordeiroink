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
  printTheme?: "LIGHT" | "DARK";
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
  printTheme?: "LIGHT" | "DARK";
}

export interface VirtualRackProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  collection?: string | null;
  description?: string | null;

  // Camadas de Blend Mode (Mockup cinza base e estampa PNG)
  baseImage: string;
  baseBackImage: string;
  baseSideImage?: string | null;
  printImage?: string | null;
  printBackImage?: string | null;

  // Versões de Estampa Clara e Escura (Contraste Dinâmico)
  printLightFront?: string | null;
  printDarkFront?: string | null;
  printLightBack?: string | null;
  printDarkBack?: string | null;

  // Coordenadas dinâmicas da estampa frontal
  printWidth: number;
  printTop: number;
  printLeft: number;

  // Coordenadas dinâmicas da estampa traseira
  printWidthBack: number;
  printTopBack: number;
  printLeftBack: number;

  imageUrl?: string;
  backImageUrl?: string | null;
  colors: VirtualRackColor[];
}

