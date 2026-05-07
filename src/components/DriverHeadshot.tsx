import MappedImage from "@/components/MappedImage";

type DriverHeadshotProps = {
  src?: string;
  alt: string;
  fallbackText: string;
  size: number;
  className?: string;
  fallbackClassName?: string;
  textClassName?: string;
  loading?: "eager" | "lazy";
};

export default function DriverHeadshot({
  src,
  alt,
  fallbackText,
  size,
  className = "",
  fallbackClassName = "bg-gradient-to-br from-f1-red to-red-700",
  textClassName = "text-white font-bold text-lg",
  loading,
}: DriverHeadshotProps) {
  return (
    <MappedImage
      src={src}
      alt={alt}
      fallbackText={fallbackText}
      size={size}
      className={`rounded-full ${className}`}
      fallbackClassName={fallbackClassName}
      textClassName={textClassName}
      imageWrapperClassName="bg-surface-muted"
      imageClassName="origin-top scale-[1.75] object-cover object-top"
      loading={loading}
    />
  );
}
