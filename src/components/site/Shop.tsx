import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search, ShoppingBag, Sparkles, X } from "lucide-react";
import {
  categoryLabel,
  categoryToCollection,
  collectionDescriptions,
  collectionLabels,
  collectionToCategory,
  formatPrice,
  placeholderImage,
  Product,
  ProductCollection,
} from "@/data/products";
import { useCommerce } from "@/lib/commerce";
import { SiteImage } from "@/components/site/SiteImage";
import { optimizedProductImage, optimizedProductImageSrcSet } from "@/lib/imageOptimization";

type ShopProps = {
  collectionSlug?: ProductCollection | null;
};

type ProductSectionProps = {
  id: string;
  products: Product[];
  onViewProduct: (product: Product) => void;
};

const collectionPills: Array<{ slug: ProductCollection; href: string; label: string }> = [
  { slug: "men", href: "/collections/men", label: "Gift For Men" },
  { slug: "women", href: "/collections/women", label: "Gift For Women" },
  { slug: "custom", href: "/collections/custom", label: "Customized Gifts" },
];

function isBlockedPlaceholderImage(value?: string | null) {
  return Boolean(
    value &&
    (/(^https?:\/\/)?via\.placeholder\.com\//i.test(value) ||
      /drive\.google\.com\/drive\/folders\//i.test(value)),
  );
}

function normalizeExternalImageUrl(value?: string | null) {
  const image = String(value || "").trim();
  const driveMatch = image.match(/drive\.google\.com\/file\/d\/([^/]+)/i);
  const driveOpenMatch = image.match(/[?&]id=([^&]+)/i);
  const driveId =
    driveMatch?.[1] || (image.includes("drive.google.com") ? driveOpenMatch?.[1] : "");
  if (driveId) return `https://drive.google.com/thumbnail?id=${driveId}&sz=w1200`;
  return image;
}

function resolveProductImage(
  product: Product & { image_url?: string },
  fallback?: Product,
  fallbackProducts: Product[] = [],
) {
  const image = normalizeExternalImageUrl(product.imageUrl || product.image_url || product.image);
  if (image && !isBlockedPlaceholderImage(image)) return image;
  return fallback?.image || fallbackProducts[0]?.image || placeholderImage(product.name || "Gift");
}

function productImages(product: Product) {
  const images = [
    ...(product.images || []),
    normalizeExternalImageUrl(product.imageUrl),
    normalizeExternalImageUrl(product.image2Url),
    normalizeExternalImageUrl(product.image2),
    normalizeExternalImageUrl(product.image),
  ]
    .filter((image): image is string => Boolean(image && !isBlockedPlaceholderImage(image)))
    .filter((image, index, list) => list.indexOf(image) === index);
  const firstImage = images[0] || placeholderImage(product.name || "Gift");
  const secondImage = images[1] || firstImage;
  return [firstImage, secondImage];
}

function ProductImageSlider({ product }: { product: Product }) {
  const images = productImages(product);
  const [activeImage, setActiveImage] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const showPrevious = () =>
    setActiveImage((current) => (current + images.length - 1) % images.length);
  const showNext = () => setActiveImage((current) => (current + 1) % images.length);

  return (
    <div
      className="overflow-hidden touch-pan-y select-none"
      onTouchStart={(event) => setTouchStart(event.touches[0]?.clientX ?? null)}
      onTouchEnd={(event) => {
        if (touchStart === null) return;
        const distance = touchStart - (event.changedTouches[0]?.clientX ?? touchStart);
        if (Math.abs(distance) > 36) {
          if (distance > 0) showNext();
          else showPrevious();
        }
        setTouchStart(null);
      }}
    >
      <div className="relative aspect-square overflow-hidden rounded-[0.85rem] bg-secondary/55">
        <div
          className="flex h-full will-change-transform transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${activeImage * 100}%)` }}
        >
          {images.map((image, index) => (
            <img
              key={`${image}-${index}`}
              src={optimizedProductImage(image, 960)}
              srcSet={optimizedProductImageSrcSet(image)}
              sizes="(max-width: 768px) 92vw, 440px"
              alt={`${product.name} view ${index + 1}`}
              draggable={false}
              className="h-full min-w-full object-cover"
              width={700}
              height={700}
              loading={index === 0 ? "eager" : "lazy"}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={showPrevious}
          className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-card/90 text-foreground shadow-card"
          aria-label="Previous product image"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={showNext}
          className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-card/90 text-foreground shadow-card"
          aria-label="Next product image"
        >
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="mt-3 flex justify-center gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setActiveImage(index)}
            className={`h-2 rounded-full transition-all ${
              activeImage === index ? "w-6 bg-primary" : "w-2 bg-border"
            }`}
            aria-label={`Show product image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function ProductDetailModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { addToCart, setCartOpen } = useCommerce();
  const isUnavailable = product.isAvailable === false || (product.stockQuantity ?? 1) <= 0;

  const buyNow = () => {
    if (isUnavailable) return;
    addToCart(product.id);
    setCartOpen(true);
    onClose();
  };

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-foreground/35 px-3 py-4 backdrop-blur-sm md:place-items-center">
      <button
        className="absolute inset-0 cursor-default"
        type="button"
        onClick={onClose}
        aria-label="Close product detail"
      />
      <article className="relative grid max-h-[92dvh] w-full max-w-4xl overflow-y-auto rounded-[1.25rem] border border-border bg-card p-4 shadow-soft animate-in fade-in zoom-in-95 duration-200 md:grid-cols-[1.05fr_0.95fr] md:gap-6 md:p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-card/90 text-foreground shadow-card"
          aria-label="Close product detail"
        >
          <X size={18} />
        </button>
        <ProductImageSlider product={product} />
        <div className="flex flex-col pt-5 md:pt-2">
          <p className="text-xs uppercase tracking-[0.16em] text-primary">{product.category}</p>
          <h3 className="mt-2 font-display text-3xl leading-tight text-foreground">
            {product.name}
          </h3>
          <div className="mt-3 flex flex-wrap items-baseline gap-2">
            <span className="font-display text-2xl text-primary">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>
          <p className="mt-5 text-sm leading-7 text-muted-foreground">{product.desc}</p>
          <div className="mt-auto grid gap-3 pt-6 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => addToCart(product.id)}
              disabled={isUnavailable}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
            >
              <ShoppingBag size={16} />
              Add to Cart
            </button>
            <button
              type="button"
              onClick={buyNow}
              disabled={isUnavailable}
              className="rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
            >
              Buy Now
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}

function ProductCard({
  product,
  onViewProduct,
}: {
  product: Product;
  onViewProduct: (product: Product) => void;
}) {
  const { addToCart, setCartOpen } = useCommerce();
  const isUnavailable = product.isAvailable === false || (product.stockQuantity ?? 1) <= 0;
  const images = productImages(product);

  const buyNow = () => {
    if (isUnavailable) return;
    addToCart(product.id);
    setCartOpen(true);
  };

  return (
    <article className="group flex h-full min-h-[285px] flex-col overflow-hidden rounded-[0.75rem] border border-border bg-card shadow-card transition-all hover:-translate-y-0.5 hover:shadow-soft md:min-h-[330px]">
      <button
        type="button"
        onClick={() => onViewProduct(product)}
        className="block bg-secondary/55 p-2 text-left"
        aria-label={`View ${product.name} details`}
      >
        <div className="relative aspect-square overflow-hidden rounded-[0.6rem]">
          <SiteImage
            src={images[0]}
            alt={product.name}
            loading="lazy"
            sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 300px"
            width={300}
            height={300}
            containerClassName="h-full"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <span className="absolute left-2 top-2 rounded-full bg-card/92 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-primary backdrop-blur">
            {isUnavailable ? "Out of stock" : product.tag}
          </span>
        </div>
      </button>
      <div className="flex flex-1 flex-col px-2.5 pb-2.5">
        <div className="mb-1 text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
          {product.category}
        </div>
        <button type="button" onClick={() => onViewProduct(product)} className="text-left">
          <h3 className="line-clamp-2 min-h-[2.25rem] font-display text-sm leading-tight text-foreground md:min-h-[2.5rem] md:text-base">
            {product.name}
          </h3>
        </button>
        <div className="mt-1.5 flex flex-wrap items-baseline gap-1.5">
          <span className="font-display text-sm text-primary md:text-base">
            {formatPrice(product.price)}
          </span>
          {product.oldPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>
        <div className="mt-auto grid gap-1.5 pt-3 xl:grid-cols-2">
          <a
            href={product.cartUrl}
            onClick={(event) => {
              event.preventDefault();
              if (isUnavailable) return;
              addToCart(product.id);
            }}
            aria-disabled={isUnavailable}
            className={`inline-flex items-center justify-center gap-1 rounded-full px-2 py-1.5 text-[10px] font-semibold transition-transform md:text-xs ${
              isUnavailable
                ? "cursor-not-allowed bg-muted text-muted-foreground"
                : "bg-primary text-primary-foreground hover:scale-[1.01]"
            }`}
          >
            <ShoppingBag size={12} />
            Add to Cart
          </a>
          <button
            type="button"
            onClick={buyNow}
            disabled={isUnavailable}
            className="rounded-full border border-border bg-background px-2 py-1.5 text-[10px] font-semibold text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground md:text-xs"
          >
            Buy Now
          </button>
        </div>
      </div>
    </article>
  );
}

function ProductSection({ id, products, onViewProduct }: ProductSectionProps) {
  if (!products.length) return null;

  return (
    <section id={id}>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onViewProduct={onViewProduct} />
        ))}
      </div>
    </section>
  );
}

export function Shop({ collectionSlug = null }: ShopProps) {
  const [query, setQuery] = useState("");
  const [collectionProductsFromDb, setCollectionProductsFromDb] = useState<Product[] | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { products } = useCommerce();

  useEffect(() => {
    const category = collectionSlug ? collectionToCategory[collectionSlug] : null;
    if (!category) {
      setCollectionProductsFromDb(null);
      return;
    }

    const controller = new AbortController();
    fetch(`/api/products?category=${category}&t=${Date.now()}`, {
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => response.json())
      .then((data: { products?: Product[] }) => {
        if (!Array.isArray(data.products)) return;
        setCollectionProductsFromDb(
          data.products.map((product) => {
            const row = product as Product & {
              image_url?: string;
              old_price?: number | null;
              stock_quantity?: number;
              is_available?: boolean;
              sort_order?: number;
            };
            const fallback = products.find((item) => item.id === product.id);
            const dbCategory = product.categorySlug || product.category;
            const images = productImages({
              ...product,
              image: resolveProductImage(row, fallback, products),
              images: product.images || fallback?.images,
              image2: product.image2 || fallback?.image2,
              image2Url: product.image2Url || fallback?.image2Url,
            });
            return {
              ...product,
              category: categoryLabel(dbCategory),
              categorySlug: category,
              collection: categoryToCollection[category],
              tag: product.tag || fallback?.tag || "New",
              desc: product.desc || fallback?.desc || "",
              image: images[0],
              images,
              image2: images[1],
              image2Url: images[1],
              cartUrl: product.cartUrl || fallback?.cartUrl || `/cart/add/${product.id}`,
              oldPrice: product.oldPrice ?? row.old_price ?? fallback?.oldPrice,
              rating: product.rating ?? fallback?.rating ?? 4.8,
              delivery: product.delivery || fallback?.delivery || "",
              stockQuantity: product.stockQuantity ?? row.stock_quantity ?? fallback?.stockQuantity,
              isAvailable: product.isAvailable ?? row.is_available ?? fallback?.isAvailable ?? true,
              sortOrder: product.sortOrder ?? row.sort_order ?? fallback?.sortOrder,
            };
          }),
        );
      })
      .catch(() => undefined);

    return () => controller.abort();
  }, [collectionSlug, products]);

  const availableProducts = useMemo(
    () => products.filter((product) => product.isAvailable !== false),
    [products],
  );

  const bestSellingProducts = useMemo(() => availableProducts, [availableProducts]);

  const collectionProducts = useMemo(() => {
    const term = query.toLowerCase();
    const source = collectionProductsFromDb || availableProducts;
    return source.filter((product) => {
      const matchesCollection = !collectionSlug || product.collection === collectionSlug;
      const searchable = `${product.name} ${product.category} ${product.desc}`.toLowerCase();
      return matchesCollection && searchable.includes(term);
    });
  }, [availableProducts, collectionProductsFromDb, collectionSlug, query]);

  if (collectionSlug) {
    return (
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="rounded-[2rem] border border-border bg-card p-6 shadow-card md:p-8">
            <div className="flex flex-wrap items-center gap-2">
              {collectionPills.map((item) => {
                const isActive = item.slug === collectionSlug;
                return (
                  <a
                    key={item.slug}
                    href={item.href}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors ${
                      isActive
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-background text-primary hover:border-primary hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    {isActive && <Sparkles size={13} />}
                    {item.label}
                  </a>
                );
              })}
            </div>
            <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="font-display text-4xl text-foreground md:text-5xl">
                  {collectionLabels[collectionSlug]} Collection
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                  {collectionDescriptions[collectionSlug]}
                </p>
              </div>
              <label className="flex items-center gap-3 rounded-full border border-border bg-background px-5 py-3 text-sm text-muted-foreground lg:min-w-[340px]">
                <Search size={18} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={`Search ${collectionLabels[collectionSlug].toLowerCase()} gifts`}
                  className="w-full bg-transparent outline-none"
                />
              </label>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3">
            {collectionProducts.map((product) => (
              <ProductCard key={product.id} product={product} onViewProduct={setSelectedProduct} />
            ))}
          </div>
          {selectedProduct && (
            <ProductDetailModal
              product={selectedProduct}
              onClose={() => setSelectedProduct(null)}
            />
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-6 md:px-10">
        <ProductSection
          id="best-selling-products"
          products={bestSellingProducts}
          onViewProduct={setSelectedProduct}
        />
      </div>
      {selectedProduct && (
        <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </section>
  );
}
