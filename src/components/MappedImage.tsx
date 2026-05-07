"use client";

import Image from "next/image";
import { useState } from "react";

type MappedImageProps = {
  src?: string;
  alt: string;
  fallbackText: string;
  size: number;
  className?: string;
  fallbackClassName: string;
  textClassName: string;
  imageWrapperClassName: string;
  imageClassName: string;
  loading?: "eager" | "lazy";
};

export default function MappedImage({
  src,
  alt,
  fallbackText,
  size,
  className = "",
  fallbackClassName,
  textClassName,
  imageWrapperClassName,
  imageClassName,
  loading,
}: MappedImageProps) {
  const [hasError, setHasError] = useState(false);
  const baseClassName = `relative shrink-0 overflow-hidden flex items-center justify-center ${className}`;
  const style = { width: size, height: size };

  if (!src || hasError) {
    return (
      <div className={`${baseClassName} ${fallbackClassName}`} style={style}>
        <span className={textClassName}>{fallbackText}</span>
      </div>
    );
  }

  return (
    <div className={`${baseClassName} ${imageWrapperClassName}`} style={style}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={`${size}px`}
        loading={loading}
        className={imageClassName}
        onError={() => setHasError(true)}
      />
    </div>
  );
}
