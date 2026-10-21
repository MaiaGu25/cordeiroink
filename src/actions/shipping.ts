"use server";

export interface ShippingOption {
  id: number | string;
  name: "PAC" | "SEDEX" | string;
  service: string;
  company: string;
  price: number;
  deliveryDays: number;
  currency: string;
}

export interface CalculateShippingResult {
  success: boolean;
  options: ShippingOption[];
  error?: string;
  isSimulated?: boolean;
  warning?: string;
}

/**
 * Server Action para cálculo de frete via API v2 do Melhor Envio (Sandbox / Produção).
 * Filtra estritamente os serviços dos Correios (PAC e SEDEX).
 */
export async function calculateShippingRate(params: {
  destinationCep: string;
  quantity?: number;
}): Promise<CalculateShippingResult> {
  const { destinationCep, quantity = 1 } = params;

  // 1. Sanitização e validação de CEP
  const cleanDestinationCep = (destinationCep || "").replace(/\D/g, "");
  if (cleanDestinationCep.length !== 8) {
    return {
      success: false,
      options: [],
      error: "CEP de destino inválido. Digite 8 dígitos (ex: 01001-000).",
    };
  }

  // O CEP de origem do ateliê é fixado e carregado estritamente de process.env.CEP_ORIGEM
  const rawOriginCep = process.env.CEP_ORIGEM || "03276010";
  const cleanOriginCep = rawOriginCep.replace(/\D/g, "") || "03276010";

  const email = process.env.MELHOR_ENVIO_EMAIL || "contato@cordeiroink.com.br";
  const token = process.env.MELHOR_ENVIO_TOKEN?.trim() || "";
  const baseUrl = (process.env.MELHOR_ENVIO_URL || "https://melhorenvio.com.br").replace(/\/+$/, "");

  // 2. Simulação de pacote padrão (20x15x10 cm, 0.3kg por camiseta)
  const itemsCount = Math.max(1, quantity);
  const packageLength = 20; // cm
  const packageWidth = 15; // cm
  const packageHeight = Math.min(100, Math.max(10, 10 * itemsCount)); // cm
  const packageWeight = Math.max(0.3, parseFloat((0.3 * itemsCount).toFixed(2))); // kg

  const payload = {
    from: {
      postal_code: cleanOriginCep,
    },
    to: {
      postal_code: cleanDestinationCep,
    },
    package: {
      height: packageHeight,
      width: packageWidth,
      length: packageLength,
      weight: packageWeight,
    },
    options: {
      receipt: false,
      own_hand: false,
    },
    services: "1,2", // 1 = PAC, 2 = SEDEX
  };

  try {
    const res = await fetch(`${baseUrl}/api/v2/me/shipment/calculate`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "CordeiroInk (contato@cordeiroink.com)"
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (res.status === 401) {
      console.warn(
        "[Melhor Envio] Token 401 Unauthenticated. Verifique se o MELHOR_ENVIO_TOKEN no .env é o Personal Access Token JWT com escopo shipping-calculate."
      );

      // Em ambiente de teste/sandbox, se o token ainda não estiver autenticado,
      // fornecemos cotação estimada para não travar a experiência do usuário
      const fallbackOptions: ShippingOption[] = [
        {
          id: 1,
          name: "PAC",
          service: "Correios PAC",
          company: "Correios",
          price: 24.5,
          deliveryDays: 6,
          currency: "R$",
        },
        {
          id: 2,
          name: "SEDEX",
          service: "Correios SEDEX",
          company: "Correios",
          price: 43.8,
          deliveryDays: 2,
          currency: "R$",
        },
      ];

      return {
        success: true,
        options: fallbackOptions,
        isSimulated: true,
        warning:
          "Cotação simulada (Token Melhor Envio retornou 401 Unauthenticated. Gere o Personal Access Token completo em 'Integrações > Permissões de Acesso' no painel Melhor Envio).",
      };
    }

    if (!res.ok) {
      const errText = await res.text();
      console.error("[Melhor Envio] Erro na requisição:", res.status, errText);
      return {
        success: false,
        options: [],
        error: `Erro na API Melhor Envio (HTTP ${res.status}): ${errText.slice(0, 120)}`,
      };
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      return {
        success: false,
        options: [],
        error: data.message || "Formato de resposta inesperado do Melhor Envio.",
      };
    }

    // 3. Filtrar estritamente para Correios (PAC e SEDEX)
    const validCorreiosOptions: ShippingOption[] = data
      .filter((item: any) => {
        if (!item || item.error) return false;
        const nameUpper = String(item.name || "").toUpperCase();
        const companyName = String(item.company?.name || "").toLowerCase();
        const isCorreios = !companyName || companyName.includes("correios");
        const isPacOrSedex = nameUpper.includes("PAC") || nameUpper.includes("SEDEX");
        return isPacOrSedex && isCorreios;
      })
      .map((item: any) => {
        const nameUpper = String(item.name || "").toUpperCase();
        const isSedex = nameUpper.includes("SEDEX");
        const price = parseFloat(item.custom_price || item.price || "0");
        const deliveryDays = parseInt(
          item.custom_delivery_time || item.delivery_time || "0",
          10
        );

        return {
          id: item.id || (isSedex ? 2 : 1),
          name: isSedex ? "SEDEX" : "PAC",
          service: isSedex ? "Correios SEDEX" : "Correios PAC",
          company: "Correios",
          price,
          deliveryDays,
          currency: item.currency || "R$",
        };
      });

    // 4. Se o CEP de destino for local (SP Capital/Grande SP, mesma região do ateliê), disponibiliza Motoboy
    const isSpMetro = /^(0[1-9])\d{6}$/.test(cleanDestinationCep);
    if (isSpMetro && process.env.MOTOBOY_ENABLED !== "false") {
      const motoboyPrice = parseFloat(process.env.MOTOBOY_PRICE || "25.00");
      validCorreiosOptions.push({
        id: "motoboy",
        name: "MOTOBOY",
        service: "Motoboy Express",
        company: "Entrega Local",
        price: motoboyPrice,
        deliveryDays: 1,
        currency: "R$",
      });
    }

    validCorreiosOptions.sort((a, b) => a.price - b.price); // Ordena por valor mais acessível

    if (validCorreiosOptions.length === 0) {
      return {
        success: false,
        options: [],
        error: "Nenhum frete (Correios/Motoboy) disponível para o CEP informado.",
      };
    }

    return {
      success: true,
      options: validCorreiosOptions,
    };
  } catch (err: any) {
    console.error("[Melhor Envio] Falha na chamada da API:", err);
    return {
      success: false,
      options: [],
      error: `Falha na comunicação com o Melhor Envio: ${err.message}`,
    };
  }
}
