export interface ShippingOption {
  id: number | string;
  name: "PAC" | "SEDEX" | "MOTOBOY" | "WHATSAPP" | string;
  service: string;
  company: string;
  description?: string;
  price: number;
  deliveryDays: number | string;
  currency: string;
}

export const COMBINAR_WHATSAPP_OPTION: ShippingOption = {
  id: "combinar-whatsapp",
  name: "WHATSAPP",
  service: "A combinar via WhatsApp",
  company: "Retirada no ateliê ou entrega personalizada a combinar",
  description: "Retirada no ateliê ou entrega personalizada a combinar",
  price: 0,
  deliveryDays: "A combinar",
  currency: "R$",
};

export interface CalculateShippingResult {
  success: boolean;
  options: ShippingOption[];
  error?: string;
  isSimulated?: boolean;
  warning?: string;
}
