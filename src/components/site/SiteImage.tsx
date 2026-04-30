import { ImgHTMLAttributes, useState } from "react";

type SiteImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  containerClassName?: string;
};

export function SiteImage({
  alt,
  className = "",
  containerClassName = "",
  loading,
  ...props
}: SiteImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-secondary/70 ${containerClassName}`}>
      {!loaded && (
        <div className="pointer-events-none absolute inset-0 animate-image-sheen bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-80" />
      )}
      <img
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover transition duration-700 will-change-transform ${loaded ? "scale-100 opacity-100 blur-0" : "scale-[1.02] opacity-0 blur-sm"} ${className}`}
        {...props}
      />
    </div>
  );
}
