import { ImgHTMLAttributes, useState } from "react";
import { optimizedProductImage, optimizedProductImageSrcSet } from "@/lib/imageOptimization";

type SiteImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  containerClassName?: string;
};

export function SiteImage({
  alt,
  className = "",
  containerClassName = "",
  loading,
  onError,
  sizes,
  srcSet,
  ...props
}: SiteImageProps) {
  const [loaded, setLoaded] = useState(false);
  const src = typeof props.src === "string" ? props.src : undefined;
  const optimizedSrc = optimizedProductImage(src, 640);
  const optimizedSrcSet = optimizedProductImageSrcSet(src);

  return (
    <div className={`relative overflow-hidden bg-secondary/70 ${containerClassName}`}>
      {!loaded && (
        <div className="pointer-events-none absolute inset-0 animate-image-sheen bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-80" />
      )}
      <img
        {...props}
        alt={alt}
        loading={loading}
        decoding="async"
        src={optimizedSrc}
        srcSet={srcSet || optimizedSrcSet}
        sizes={sizes || "(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 320px"}
        onLoad={() => setLoaded(true)}
        onError={(event) => {
          setLoaded(true);
          onError?.(event);
        }}
        className={`h-full w-full object-cover transition duration-700 will-change-transform ${loaded ? "scale-100 opacity-100 blur-0" : "scale-[1.02] opacity-0 blur-sm"} ${className}`}
      />
    </div>
  );
}
