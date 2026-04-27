"use client";

import Image from "next/image";
import { useState } from "react";

type DriverHeadshotProps = {
  src?: string;
  alt: string;
  fallbackText: string;
  size: number;
  className?: string;
  fallbackClassName?: string;
  textClassName?: string;
};

export default function DriverHeadshot({
  src,
  alt,
  fallbackText,
  size,
  className = "",
  fallbackClassName = "bg-gradient-to-br from-f1-red to-red-700",
  textClassName = "text-white font-bold text-lg",
}: DriverHeadshotProps) {
  const [hasError, setHasError] = useState(false);
  const baseClassName = `relative shrink-0 overflow-hidden rounded-full flex items-center justify-center ${className}`;
  const style = { width: size, height: size };

  if (!src || hasError) {
    return (
      <div className={`${baseClassName} ${fallbackClassName}`} style={style}>
        <span className={textClassName}>{fallbackText}</span>
      </div>
    );
  }

  return (
    <div className={`${baseClassName} bg-surface-muted`} style={style}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={`${size * 4}px`}
        unoptimized
        className="origin-top scale-[1.75] object-cover object-top"
        onError={() => setHasError(true)}
      />
    </div>
  );
}
