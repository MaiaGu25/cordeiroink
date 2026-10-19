"use client";

import React, { useState, useEffect } from "react";
import { Image as ImageIcon } from "lucide-react";
import { normalizeImageUrl } from "@/lib/utils";

export interface SafeImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src?: string | null;
  fallbackText?: string;
  iconSize?: number;
  containerClassName?: string;
  fallbackClassName?: string;
}

/**
 * Componente de imagem com fallback visual seguro.
 * Se a URL for inválida, ausente ou o carregamento falhar (404/rede),
 * exibe um bloco com fundo cinza (bg-zinc-900) e ícone genérico, preservando o layout.
 */
export function SafeImage({
  src,
  alt = "",
  className = "w-full h-full object-cover",
  containerClassName,
  fallbackClassName = "w-full h-full bg-zinc-900 flex flex-col items-center justify-center text-zinc-500",
  fallbackText,
  iconSize = 24,
  onError,
  ...props
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);
  const normalizedSrc = normalizeImageUrl(src as string);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!normalizedSrc || hasError) {
    return (
      <div className={containerClassName || fallbackClassName}>
        <ImageIcon size={iconSize} className="text-zinc-600" />
        {fallbackText && (
          <span className="text-[10px] mt-1 font-mono text-zinc-500 text-center px-1">
            {fallbackText}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      {...props}
      src={normalizedSrc}
      alt={alt}
      className={className}
      onError={(e) => {
        setHasError(true);
        if (onError) onError(e);
      }}
    />
  );
}
