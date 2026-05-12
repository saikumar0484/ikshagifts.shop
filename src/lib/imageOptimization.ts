const optimizedWidths = [320, 640, 960, 1280];

function localProductImageName(src?: string | null) {
  const image = String(src || "").trim();
  const match = image.match(/^\/product-images\/([^/]+)\.(?:jpe?g|png)$/i);
  return match?.[1] || "";
}

export function optimizedProductImage(src?: string | null, width = 640) {
  const name = localProductImageName(src);
  if (!name) return src || "";
  return `/product-images/optimized/${name}-${width}.webp`;
}

export function optimizedProductImageSrcSet(src?: string | null) {
  const name = localProductImageName(src);
  if (!name) return undefined;
  return optimizedWidths
    .map((width) => `/product-images/optimized/${name}-${width}.webp ${width}w`)
    .join(", ");
}
