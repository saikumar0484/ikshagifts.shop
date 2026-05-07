import { useEffect, useMemo, useState } from "react";
import { Search, ShoppingBag, Sparkles } from "lucide-react";
import {
  categoryLabel,
  categoryToCollection,
  collectionDescriptions,
  collectionLabels,
  collectionToCategory,
  formatPrice,
  Product,
  ProductCollection,
} from "@/data/products";
import { useCommerce } from "@/lib/commerce";
import { SiteImage } from "@/components/site/SiteImage";

type ShopProps = {
  collectionSlug?: ProductCollection | null;
};

type ProductSectionProps = {
  id: string;
  products: Product[];
};

const collectionPills: Array<{ slug: ProductCollection; href: string; label: string }> = [
  { slug: "men", href: "/collections/men", label: "Gift For Men" },
  { slug: "women", href: "/collections/women", label: "Gift For Women" },
  { slug: "custom", href: "/collections/custom", label: "Customized Gifts" },
];

function ProductCard({ product }: { product: Product }) {
  const { addToCart, setCartOpen } = useCommerce();
  const [showDescription, setShowDescription] = useState(false);
  const isUnavailable = product.isAvailable === false || (product.stockQuantity ?? 1) <= 0;

  const buyNow = () => {
    if (isUnavailable) return;
    addToCart(product.id);
    setCartOpen(true);
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[0.75rem] border border-border bg-card shadow-card transition-all hover:-translate-y-0.5 hover:shadow-soft">
      <button
        type="button"
        onClick={() => setShowDescription((current) => !current)}
        className="block bg-secondary/55 p-2 text-left"
        aria-expanded={showDescription}
      >
        <div className="relative aspect-square overflow-hidden rounded-[0.6rem]">
          <SiteImage
            src={product.image}
            alt={product.name}
            loading="lazy"
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
        <button
          type="button"
          onClick={() => setShowDescription((current) => !current)}
          className="text-left"
          aria-expanded={showDescription}
        >
          <h3 className="font-display text-sm leading-tight text-foreground md:text-base">
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
        {showDescription && (
          <p className="mt-2 text-xs leading-5 text-muted-foreground">{product.desc}</p>
        )}
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

function ProductSection({ id, products }: ProductSectionProps) {
  if (!products.length) return null;

  return (
    <section id={id}>
      <div className="grid grid-cols-3 gap-2 md:gap-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export function Shop({ collectionSlug = null }: ShopProps) {
  const [query, setQuery] = useState("");
  const [collectionProductsFromDb, setCollectionProductsFromDb] = useState<Product[] | null>(null);
  const { products } = useCommerce();

  useEffect(() => {
    const category = collectionSlug ? collectionToCategory[collectionSlug] : null;
    if (!category) {
      setCollectionProductsFromDb(null);
      return;
    }

    const controller = new AbortController();
    fetch(`/api/products?category=${category}`, {
      credentials: "include",
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
            return {
              ...product,
              category: categoryLabel(dbCategory),
              categorySlug: category,
              collection: categoryToCollection[category],
              tag: product.tag || fallback?.tag || "New",
              desc: product.desc || fallback?.desc || "",
              image:
                product.imageUrl ||
                row.image_url ||
                product.image ||
                fallback?.image ||
                products[0].image,
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

          <div className="mt-10 grid grid-cols-3 gap-2 md:gap-3">
            {collectionProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-6 md:px-10">
        <ProductSection id="best-selling-products" products={bestSellingProducts} />
      </div>
    </section>
  );
}
