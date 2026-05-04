import { useEffect, useMemo, useState } from "react";
import { Search, ShoppingBag, Sparkles } from "lucide-react";
import {
  categoryLabel,
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
  eyebrow: string;
  title: string;
  description: string;
  products: Product[];
};

function ProductCard({ product }: { product: Product }) {
  const { addToCart, setCartOpen } = useCommerce();

  const buyNow = () => {
    addToCart(product.id);
    setCartOpen(true);
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.55rem] border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-soft">
      <div className="bg-secondary/55 p-4">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem]">
          <SiteImage
            src={product.image}
            alt={product.name}
            loading="lazy"
            width={900}
            height={1100}
            containerClassName="h-full"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <span className="absolute left-3 top-3 rounded-full bg-card/92 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary backdrop-blur">
            {product.tag}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col px-4 pb-4">
        <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {product.category}
        </div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl leading-tight text-foreground md:text-2xl">
            {product.name}
          </h3>
          <div className="text-right">
            <span className="font-display text-lg text-primary">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <div className="text-xs text-muted-foreground line-through">
                {formatPrice(product.oldPrice)}
              </div>
            )}
          </div>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{product.desc}</p>
        <div className="mt-4 space-y-2 text-xs font-medium text-foreground/85">
          <p>🚚 Delivery in 3–5 Days</p>
          <p>🎁 Premium Packaging Included</p>
        </div>
        <div className="mt-auto grid gap-2 pt-5 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => addToCart(product.id)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01]"
          >
            <ShoppingBag size={16} />
            Add to Cart
          </button>
          <button
            type="button"
            onClick={buyNow}
            className="rounded-full border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            Buy Now
          </button>
        </div>
      </div>
    </article>
  );
}

function ProductSection({ id, eyebrow, title, description, products }: ProductSectionProps) {
  if (!products.length) return null;

  return (
    <section id={id} className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-primary">{eyebrow}</span>
          <h2 className="mt-3 font-display text-4xl text-foreground md:text-5xl">{title}</h2>
        </div>
        <p className="max-w-lg text-sm leading-7 text-muted-foreground">{description}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
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
          data.products.map((product) => ({
            ...product,
            category: categoryLabel(product.categorySlug || product.category),
            collection: collectionSlug,
          })),
        );
      })
      .catch(() => undefined);

    return () => controller.abort();
  }, [collectionSlug]);

  const availableProducts = useMemo(
    () => products.filter((product) => product.isAvailable !== false),
    [products],
  );

  const featuredProducts = useMemo(
    () => availableProducts.filter((product) => product.isFeatured).slice(0, 4),
    [availableProducts],
  );

  const bestSellingProducts = useMemo(
    () => availableProducts.filter((product) => product.isBestSeller).slice(0, 4),
    [availableProducts],
  );

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
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <Sparkles size={14} />
              {collectionLabels[collectionSlug]}
            </span>
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

          <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {collectionProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto flex max-w-7xl flex-col gap-16 px-6 md:px-10">
        <ProductSection
          id="featured-products"
          eyebrow="Curated now"
          title="Featured Products"
          description="Premium personalized picks chosen for gifting moments that need a polished first impression."
          products={featuredProducts}
        />

        <ProductSection
          id="best-selling-products"
          eyebrow="Loved by customers"
          title="Best Selling Products"
          description="These are the fastest-moving gift picks for birthdays, surprises, and custom occasion gifting."
          products={bestSellingProducts}
        />
      </div>
    </section>
  );
}
