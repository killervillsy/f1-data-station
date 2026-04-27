"use client";

import Image from "next/image";
import { useState } from "react";

type ConstructorLogoProps = {
  src?: string;
  alt: string;
  fallbackText: string;
  size: number;
  className?: string;
  fallbackClassName?: string;
  textClassName?: string;
};

export default function ConstructorLogo({
  src,
  alt,
  fallbackText,
  size,
  className = "",
  fallbackClassName = "bg-gradient-to-br from-f1-red to-red-700",
  textClassName = "text-white font-bold text-lg",
}: ConstructorLogoProps) {
  const [hasError, setHasError] = useState(false);
  const baseClassName = `relative shrink-0 overflow-hidden rounded-xl flex items-center justify-center ${className}`;
  const style = { width: size, height: size };

  if (!src || hasError) {
    return (
      <div className={`${baseClassName} ${fallbackClassName}`} style={style}>
        <span className={textClassName}>{fallbackText}</span>
      </div>
    );
  }

  return (
    <div className={`${baseClassName} bg-white/90 p-2 ring-1 ring-black/10`} style={style}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={`${size * 4}px`}
        unoptimized
        className="object-contain"
        onError={() => setHasError(true)}
      />
    </div>
  );
}
