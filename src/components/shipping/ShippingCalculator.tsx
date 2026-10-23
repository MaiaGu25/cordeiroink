"use client";

import { useState, useTransition } from "react";
import { Truck, Loader2, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { calculateShippingRate } from "@/actions/shipping";
import { COMBINAR_WHATSAPP_OPTION, type ShippingOption } from "@/lib/shipping-constants";
import { formatCurrency } from "@/lib/utils";

interface ShippingCalculatorProps {
  quantity?: number;
  selectedOption: ShippingOption | null;
  onSelectOption: (option: ShippingOption | null) => void;
  variant?: "storefront" | "admin";
  onCepChange?: (cep: string) => void;
  initialCep?: string;
}

export function ShippingCalculator({
  quantity = 1,
  selectedOption,
  onSelectOption,
  variant = "storefront",
  onCepChange,
  initialCep = "",
}: ShippingCalculatorProps) {
  const [cep, setCep] = useState(initialCep);
  const [isPending, startTransition] = useTransition();
  const [options, setOptions] = useState<ShippingOption[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [hasCalculated, setHasCalculated] = useState(false);

  // Formatação automática do CEP (00000-000)
  const formatCep = (value: string) => {
    const raw = value.replace(/\D/g, "").slice(0, 8);
    if (raw.length <= 5) return raw;
    return `${raw.slice(0, 5)}-${raw.slice(5)}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCep(e.target.value);
    setCep(formatted);
    if (onCepChange) onCepChange(formatted);
  };

  const handleCalculate = () => {
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) {
      setErrorMessage("Por favor, digite um CEP válido com 8 dígitos.");
      return;
    }

    setErrorMessage(null);
    setWarningMessage(null);

    startTransition(async () => {
      const res = await calculateShippingRate({
        destinationCep: clean,
        quantity,
      });

      setHasCalculated(true);

      if (!res.success) {
        setErrorMessage(res.error || "Não foi possível calcular o frete.");
        setOptions([]);
        if (selectedOption?.id !== COMBINAR_WHATSAPP_OPTION.id) {
          onSelectOption(null);
        }
      } else {
        setOptions(res.options);
        if (res.warning) {
          setWarningMessage(res.warning);
        }
        // Seleciona automaticamente o PAC (primeiro/mais econômico) apenas se nenhum estiver selecionado
        if (res.options.length > 0 && !selectedOption) {
          const defaultOpt = res.options[0];
          onSelectOption(defaultOpt);
        }
      }
    });
  };

  const isStorefront = variant === "storefront";

  return (
    <div
      className={`rounded-2xl p-4 transition-all ${
        isStorefront
          ? "bg-[#F2ECE1]/80 border border-[#E6DED2]"
          : "bg-zinc-950 border border-zinc-800"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Truck
            size={16}
            className={isStorefront ? "text-[#0A0A0A]" : "text-amber-400"}
          />
          <span
            className={`text-xs uppercase font-sans font-bold tracking-wider ${
              isStorefront ? "text-[#0A0A0A]" : "text-zinc-200"
            }`}
          >
            Calcular Frete & Prazo (Correios)
          </span>
        </div>
        <span
          className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
            isStorefront
              ? "bg-[#0A0A0A]/5 text-[#737373] border border-[#0A0A0A]/10"
              : "bg-zinc-900 text-zinc-400 border border-zinc-800"
          }`}
        >
          {quantity} {quantity === 1 ? "peça" : "peças"}
        </span>
      </div>

      {/* Input de CEP e Botão Calcular */}
      <div className="flex gap-2">
        <input
          type="text"
          value={cep}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleCalculate();
            }
          }}
          placeholder="00000-000"
          maxLength={9}
          className={`flex-1 px-3 py-2 rounded-xl font-mono text-xs font-semibold focus:outline-none transition ${
            isStorefront
              ? "bg-[#FAF9F6] border border-[#D5CABE] text-[#0A0A0A] placeholder:text-[#A0988A] focus:border-[#0A0A0A]"
              : "bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-700"
          }`}
        />
        <button
          type="button"
          onClick={handleCalculate}
          disabled={isPending || cep.replace(/\D/g, "").length < 8}
          className={`px-4 py-2 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${
            isStorefront
              ? "bg-[#0A0A0A] hover:bg-[#222222] text-[#F7F4EE] shadow-sm"
              : "bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-sm"
          }`}
        >
          {isPending ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              <span>Cotando...</span>
            </>
          ) : (
            <span>Calcular</span>
          )}
        </button>
      </div>

      {/* Erro */}
      {errorMessage && (
        <div
          className={`mt-3 p-2.5 rounded-xl text-xs flex items-start gap-2 ${
            isStorefront
              ? "bg-red-500/10 border border-red-500/20 text-red-700"
              : "bg-red-500/10 border border-red-500/20 text-red-400"
          }`}
        >
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Aviso de Sandbox/Simulação */}
      {warningMessage && (
        <div
          className={`mt-3 p-2 rounded-xl text-[11px] flex items-start gap-1.5 ${
            isStorefront
              ? "bg-amber-500/10 border border-amber-500/20 text-amber-900"
              : "bg-amber-500/10 border border-amber-500/20 text-amber-300"
          }`}
        >
          <Info size={13} className="shrink-0 mt-0.5" />
          <span>{warningMessage}</span>
        </div>
      )}

      {/* Opção Rápida caso ainda não tenha cotado por CEP ou prefira retirar no ateliê */}
      {options.length === 0 && (
        <div className="mt-3">
          <label
            onClick={() => onSelectOption(COMBINAR_WHATSAPP_OPTION)}
            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition select-none ${
              isStorefront
                ? selectedOption?.id === COMBINAR_WHATSAPP_OPTION.id
                  ? "bg-[#FAF9F6] border-[#0A0A0A] shadow-md ring-1 ring-[#0A0A0A]"
                  : "bg-[#FAF9F6]/60 border-[#E6DED2] hover:border-[#0A0A0A]/40"
                : selectedOption?.id === COMBINAR_WHATSAPP_OPTION.id
                ? "bg-zinc-900 border-emerald-500/60 shadow-md ring-1 ring-emerald-500/60"
                : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <input
                type="radio"
                name="shipping_service_initial"
                checked={selectedOption?.id === COMBINAR_WHATSAPP_OPTION.id}
                onChange={() => onSelectOption(COMBINAR_WHATSAPP_OPTION)}
                className="w-3.5 h-3.5 accent-[#0A0A0A] cursor-pointer"
              />
              <div className="text-left">
                <span
                  className={`text-xs font-bold block ${
                    isStorefront ? "text-[#0A0A0A]" : "text-zinc-100"
                  }`}
                >
                  A combinar via WhatsApp
                </span>
                <span
                  className={`text-[10px] block ${
                    isStorefront ? "text-[#737373]" : "text-zinc-400"
                  }`}
                >
                  Retirada no ateliê ou entrega personalizada a combinar
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold uppercase block text-center">
                A Combinar
              </span>
              <span className="font-mono text-xs font-bold text-emerald-600 block mt-0.5">
                R$ 0,00 (Grátis)
              </span>
            </div>
          </label>
        </div>
      )}

      {/* RadioGroup de Opções de Envio (Correios, Motoboy e WhatsApp) */}
      {options.length > 0 && (
        <div className="mt-3 space-y-2">
          <div
            className={`text-[11px] font-sans font-semibold uppercase tracking-wider ${
              isStorefront ? "text-[#737373]" : "text-zinc-400"
            }`}
          >
            Selecione o Serviço de Envio:
          </div>

          <div
            role="radiogroup"
            aria-label="Opções de frete"
            className="grid grid-cols-1 sm:grid-cols-2 gap-2"
          >
            {options.map((opt) => {
              const isSelected = selectedOption?.id === opt.id || selectedOption?.name === opt.name;
              const isSedex = opt.name.toUpperCase().includes("SEDEX");
              const isWhatsApp = opt.name === "WHATSAPP" || opt.id === COMBINAR_WHATSAPP_OPTION.id;

              return (
                <label
                  key={String(opt.id || opt.name)}
                  onClick={() => onSelectOption(opt)}
                  className={`relative p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition select-none ${
                    isWhatsApp ? "sm:col-span-2" : ""
                  } ${
                    isStorefront
                      ? isSelected
                        ? "bg-[#FAF9F6] border-[#0A0A0A] shadow-md ring-1 ring-[#0A0A0A]"
                        : "bg-[#FAF9F6]/60 border-[#E6DED2] hover:border-[#0A0A0A]/40"
                      : isSelected
                      ? "bg-zinc-900 border-amber-500/60 shadow-md ring-1 ring-amber-500/60"
                      : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="shipping_service"
                        value={String(opt.id || opt.name)}
                        checked={isSelected}
                        onChange={() => onSelectOption(opt)}
                        className="w-3.5 h-3.5 accent-[#0A0A0A] cursor-pointer"
                      />
                      <div>
                        <span
                          className={`text-xs font-bold block ${
                            isStorefront ? "text-[#0A0A0A]" : "text-zinc-100"
                          }`}
                        >
                          {opt.service}
                        </span>
                        {isWhatsApp && (
                          <span
                            className={`text-[10px] block font-normal ${
                              isStorefront ? "text-[#737373]" : "text-zinc-400"
                            }`}
                          >
                            Retirada no ateliê ou entrega personalizada a combinar
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                        isWhatsApp
                          ? "bg-emerald-100 text-emerald-800"
                          : isSedex
                          ? isStorefront
                            ? "bg-amber-100 text-amber-800"
                            : "bg-amber-500/20 text-amber-300"
                          : isStorefront
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-emerald-500/20 text-emerald-400"
                      }`}
                    >
                      {isWhatsApp ? "A Combinar" : isSedex ? "Expresso" : "Econômico"}
                    </span>
                  </div>

                  <div className="mt-2 flex items-baseline justify-between pt-1 border-t border-black/5 dark:border-white/5">
                    <span
                      className={`text-[11px] ${
                        isStorefront ? "text-[#737373]" : "text-zinc-400"
                      }`}
                    >
                      {typeof opt.deliveryDays === "number" && opt.deliveryDays > 0
                        ? opt.deliveryDays === 1
                          ? "1 dia útil"
                          : `${opt.deliveryDays} dias úteis`
                        : "A combinar"}
                    </span>
                    <span
                      className={`font-mono text-xs font-bold ${
                        opt.price === 0
                          ? "text-emerald-600"
                          : isStorefront
                          ? "text-[#0A0A0A]"
                          : "text-emerald-400"
                      }`}
                    >
                      {opt.price === 0 ? "R$ 0,00 (Grátis)" : formatCurrency(opt.price)}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Status pós-cálculo com seleção ativa */}
      {selectedOption && (
        <div
          className={`mt-3 p-2.5 rounded-xl text-xs flex items-center justify-between font-medium ${
            isStorefront
              ? "bg-[#FAF9F6] border border-[#E6DED2] text-[#0A0A0A]"
              : "bg-zinc-900 border border-zinc-800 text-zinc-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2
              size={14}
              className={isStorefront ? "text-emerald-600" : "text-emerald-400"}
            />
            <div>
              <span>
                Frete selecionado: <strong>{selectedOption.service}</strong>
              </span>
              {selectedOption.price === 0 && (
                <span className="block text-[10px] text-[#737373]">
                  Retirada no ateliê ou entrega personalizada a combinar
                </span>
              )}
            </div>
          </div>
          <span className="font-mono font-bold text-emerald-600">
            {selectedOption.price === 0 ? "R$ 0,00 (Grátis)" : `+${formatCurrency(selectedOption.price)}`}
          </span>
        </div>
      )}
    </div>
  );
}
