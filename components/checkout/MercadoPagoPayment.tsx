const initialization = {
  amount: Math.round(Number(totalAmount) * 100) / 100 || 1.0, // Nunca deixe ser 0 ou undefined
};
export * from "@/components/checkout/MercadoPagoPayment";
export { MercadoPagoPayment as default } from "@/components/checkout/MercadoPagoPayment";
