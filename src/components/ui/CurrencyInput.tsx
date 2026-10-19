"use client";

import React, { useState, useEffect, forwardRef } from "react";

export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: number | string | undefined | null;
  onChange: (value: number | "") => void;
  allowNegative?: boolean;
}

/**
 * Input numérico para campos monetários e decimais (R$).
 * - Aceita tanto vírgula (,) quanto ponto (.) de forma fluida.
 * - Permite campo vazio ("") sem forçar preenchimento com 0 ao apagar.
 * - Evita os bloqueios de validação HTML5 ("Insira um valor válido") usando inputMode="decimal".
 */
export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    {
      value,
      onChange,
      className = "",
      placeholder = "0,00",
      allowNegative = false,
      onBlur,
      ...props
    },
    ref
  ) => {
    const toDisplay = (val: number | string | undefined | null): string => {
      if (val === undefined || val === null || val === "") return "";
      return String(val).replace(".", ",");
    };

    const [text, setText] = useState<string>(() => toDisplay(value));

    // Sincroniza se o valor mudar externamente (ex: clique em botões de tamanho ou reset de modal)
    useEffect(() => {
      if (value === "" || value === undefined || value === null) {
        if (text !== "") setText("");
        return;
      }

      const parsedCurrentText = parseFloat(text.replace(",", "."));
      const numVal =
        typeof value === "number"
          ? value
          : parseFloat(String(value).replace(",", "."));

      // Atualiza apenas se o número for diferente e não estivermos no meio de digitação de vírgula ou decimal
      if (isNaN(parsedCurrentText) || parsedCurrentText !== numVal) {
        setText(toDisplay(value));
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;

      // 1. Se o usuário apagou tudo, permite ficar vazio sem forçar "0"
      if (raw === "") {
        setText("");
        onChange("");
        return;
      }

      // 2. Converte ponto em vírgula para manter padrão brasileiro
      let formatted = raw.replace(/\./g, ",");

      // 3. Filtra caracteres: permite apenas números, uma vírgula e opcionalmente '-'
      if (allowNegative) {
        formatted = formatted.replace(/[^\d,-]/g, "");
      } else {
        formatted = formatted.replace(/[^\d,]/g, "");
      }

      // Permite apenas uma vírgula
      const parts = formatted.split(",");
      if (parts.length > 2) {
        formatted = parts[0] + "," + parts.slice(1).join("");
      }

      // Limita a 2 casas decimais após a vírgula
      if (parts.length === 2 && parts[1].length > 2) {
        formatted = parts[0] + "," + parts[1].substring(0, 2);
      }

      setText(formatted);

      // 4. Notifica o form com o valor numérico ou "" se incompleto
      const cleanForParse = formatted.replace(",", ".");
      if (cleanForParse === "" || cleanForParse === "-" || cleanForParse === ".") {
        onChange("");
      } else {
        const parsed = parseFloat(cleanForParse);
        if (!isNaN(parsed)) {
          onChange(parsed);
        } else {
          onChange("");
        }
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Formata com 2 casas ao sair do campo se houver número válido
      if (text !== "" && text !== "-") {
        const parsed = parseFloat(text.replace(",", "."));
        if (!isNaN(parsed)) {
          setText(parsed.toFixed(2).replace(".", ","));
        }
      }
      if (onBlur) onBlur(e);
    };

    return (
      <input
        {...props}
        ref={ref}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={text}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={className}
      />
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";
