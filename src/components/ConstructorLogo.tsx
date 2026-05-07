import MappedImage from "@/components/MappedImage";

type ConstructorLogoProps = {
  src?: string;
  alt: string;
  fallbackText: string;
  size: number;
  className?: string;
  fallbackClassName?: string;
  textClassName?: string;
  loading?: "eager" | "lazy";
};

export default function ConstructorLogo({
  src,
  alt,
  fallbackText,
  size,
  className = "",
  fallbackClassName = "bg-gradient-to-br from-f1-red to-red-700",
  textClassName = "text-white font-bold text-lg",
  loading,
}: ConstructorLogoProps) {
  return (
    <MappedImage
      src={src}
      alt={alt}
      fallbackText={fallbackText}
      size={size}
      className={`rounded-xl ${className}`}
      fallbackClassName={fallbackClassName}
      textClassName={textClassName}
      imageWrapperClassName="bg-white/90 p-2 ring-1 ring-black/10"
      imageClassName="object-contain"
      loading={loading}
    />
  );
}
