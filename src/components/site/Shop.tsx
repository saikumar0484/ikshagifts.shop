import { useMemo, useState } from "react";
import { Heart, Search, ShoppingBag, Star } from "lucide-react";
import { categories as fallbackCategories, formatPrice } from "@/data/products";
import { useCommerce } from "@/lib/commerce";
import { SiteImage } from "@/components/site/SiteImage";

export function Shop() {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const { addToCart, products } = useCommerce();

  const categories = useMemo(() => {
    const values = Array.from(new Set(products.map((product) => product.category))).filter(Boolean);
    return values.length ? ["All", ...values] : fallbackCategories;
  }, [products]);

  const visibleProducts = useMemo(() => {
    return products.filter((product) => {
      if (product.isAvailable === false) return false;
      const matchesCategory = category === "All" || product.category === category;
      const text = `${product.name} ${product.category} ${product.desc}`.toLowerCase();
      return matchesCategory && text.includes(query.toLowerCase());
    });
  }, [category, query]);

  return (
    <section id="shop" className="relative py-20 motion-safe:animate-fade-up md:py-28">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="flex flex-col items-end justify-between gap-6 md:flex-row">
          <div className="max-w-xl">
            <span className="text-xs uppercase tracking-[0.25em] text-primary">The Shop</span>
            <h2 className="mt-3 font-display text-4xl text-foreground md:text-5xl">
              Little things, <em className="text-primary">big love</em>
            </h2>
          </div>
          <p className="max-w-md text-muted-foreground">
            Each piece is hand-stitched in small batches. Customise colours, sizes or design your
            own before we pack it with care.
          </p>
        </div>

        <div className="mt-10 grid gap-4 rounded-[1.75rem] border border-border bg-card p-4 shadow-card lg:grid-cols-[1fr_auto]">
          <label className="flex items-center gap-3 rounded-full border border-border bg-background px-5 py-3 text-sm text-muted-foreground">
            <Search size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search bows, bouquets, charms"
              className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  category === item
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-foreground hover:bg-secondary"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div id="new" className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visibleProducts.map((product, index) => (
            <article
              key={product.id}
              className="group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-soft"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <SiteImage
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  width={900}
                  height={1100}
                  containerClassName="h-full"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute left-4 top-4 rounded-full bg-card/90 px-3 py-1 text-xs font-semibold text-primary backdrop-blur">
                  {product.tag}
                </span>
                <button
                  type="button"
                  className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-card/90 text-primary backdrop-blur transition-transform hover:scale-105"
                  aria-label={`Save ${product.name}`}
                >
                  <Heart size={17} />
                </button>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="mb-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>{product.category}</span>
                  <span className="inline-flex items-center gap-1">
                    <Star size={14} className="fill-primary text-primary" />
                    {product.rating}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-2xl text-foreground">{product.name}</h3>
                  <div className="text-right">
                    <span className="font-display text-lg text-primary">
                      {formatPrice(product.price)}
                    </span>
                    {product.oldPrice && (
                      <div className="text-xs text-muted-foreground line-through">
                        {formatPrice(product.oldPrice)}
                      </div>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{product.desc}</p>
                <div className="mt-auto pt-5">
                  <p className="mb-3 text-xs font-medium text-muted-foreground">
                    {product.delivery}
                  </p>
                  <button
                    type="button"
                    onClick={() => addToCart(product.id)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01]"
                  >
                    <ShoppingBag size={16} />
                    Add to cart
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
