import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Gift, ShoppingBag } from "lucide-react";
import { SiteImage } from "@/components/site/SiteImage";
import { formatPrice } from "@/data/products";
import { collectionNav } from "@/data/storefront";
import { useCommerce } from "@/lib/commerce";

const SLIDE_INTERVAL_MS = 2000;
const SLIDE_TRANSITION_MS = 700;

export function Hero() {
  const { addToCart, products } = useCommerce();
  const [index, setIndex] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);

  const slides = useMemo(
    () =>
      products
        .filter((product) => product.isAvailable !== false)
        .sort((left, right) => Number(right.isFeatured) - Number(left.isFeatured))
        .slice(0, 4),
    [products],
  );
  const loopedSlides = slides.length > 1 ? [...slides, slides[0]] : slides;

  useEffect(() => {
    if (slides.length <= 1) return;

    const intervalId = window.setInterval(() => {
      setTransitionEnabled(true);
      setIndex((current) => current + 1);
    }, SLIDE_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1 || index !== slides.length) return;

    const timeoutId = window.setTimeout(() => {
      setTransitionEnabled(false);
      setIndex(0);
    }, SLIDE_TRANSITION_MS);

    return () => window.clearTimeout(timeoutId);
  }, [index, slides.length]);

  useEffect(() => {
    if (transitionEnabled) return;

    const frameId = window.requestAnimationFrame(() => {
      setTransitionEnabled(true);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [transitionEnabled]);

  if (!slides.length) return null;

  return (
    <section id="top" className="border-b border-border px-6 py-8 md:px-10 md:py-12">
      <div className="mx-auto grid max-w-7xl items-stretch gap-6 lg:grid-cols-[0.66fr_1.34fr] lg:gap-8">
        <aside className="rounded-[2rem] border border-border bg-card/88 p-5 shadow-card backdrop-blur-sm md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-primary">
                Collections
              </p>
              <h1 className="mt-3 font-display text-3xl text-foreground md:text-4xl">
                Thoughtful gifting, sorted beautifully.
              </h1>
            </div>
            <div className="hidden rounded-full border border-primary/20 bg-secondary px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary md:inline-flex">
              Curated
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {collectionNav.map((item) => (
              <a
                key={item.slug}
                href={item.href}
                className="group rounded-[1.45rem] border border-border bg-background/92 px-4 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-secondary/72"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-2xl text-foreground">{item.label}</p>
                    <p className="mt-2 max-w-[28ch] text-sm leading-6 text-muted-foreground">
                      {item.blurb}
                    </p>
                  </div>
                  <span className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground transition-transform duration-300 group-hover:translate-x-0.5">
                    <ArrowRight size={16} />
                  </span>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-5 rounded-[1.45rem] bg-secondary/78 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Order window
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-foreground">
              <span>Limited custom orders available today</span>
              <span className="hidden h-1.5 w-1.5 rounded-full bg-primary/35 sm:block" />
              <span className="text-muted-foreground">Order before 5PM for faster dispatch</span>
            </div>
          </div>
        </aside>

        <div className="overflow-hidden rounded-[2.35rem] border border-border bg-card shadow-soft">
          <div
            className="flex"
            style={{
              transform: `translateX(-${index * 100}%)`,
              transition: transitionEnabled
                ? `transform ${SLIDE_TRANSITION_MS}ms cubic-bezier(.22,.61,.36,1)`
                : "none",
            }}
          >
            {loopedSlides.map((product, slideIndex) => (
              <button
                key={`${product.id}-${slideIndex}`}
                type="button"
                onClick={() => addToCart(product.id)}
                className="group relative block min-w-full text-left"
                aria-label={`Add ${product.name} to cart`}
              >
                <div className="relative aspect-[16/11] min-h-[360px] md:min-h-[560px]">
                  <SiteImage
                    src={product.image}
                    alt={product.name}
                    width={1600}
                    height={1100}
                    loading={slideIndex === 0 ? "eager" : "lazy"}
                    fetchPriority={slideIndex === 0 ? "high" : "auto"}
                    containerClassName="h-full"
                    className="animate-hero-zoom h-full w-full object-cover transition duration-700 group-hover:scale-[1.03] motion-reduce:animate-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/26 via-foreground/4 to-transparent" />

                  <div className="animate-float-slow absolute left-5 top-5 rounded-full bg-card/92 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary shadow-card backdrop-blur">
                    Best Product
                  </div>

                  <div className="animate-drift absolute right-5 top-5 rounded-full bg-card/92 px-4 py-2 text-xs font-semibold text-foreground shadow-card backdrop-blur">
                    Premium wrapping included
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-4 p-5 md:p-7">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                      <div className="rounded-[1.6rem] bg-card/88 px-5 py-4 shadow-card backdrop-blur">
                        <p className="font-display text-2xl text-foreground md:text-[2rem]">
                          {product.name}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {product.category} • {formatPrice(product.price)}
                        </p>
                      </div>

                      <div className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-card transition-transform group-hover:scale-[1.03]">
                        <ShoppingBag size={16} />
                        Add to Cart
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-card/90 px-4 py-2 text-xs font-semibold text-foreground backdrop-blur">
                        Delivery in 3-5 Days
                      </span>
                      <span className="rounded-full bg-card/90 px-4 py-2 text-xs font-semibold text-foreground backdrop-blur">
                        Gift-ready presentation
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {slides.length > 1 && (
            <div className="flex flex-col gap-3 border-t border-border bg-card px-5 py-4 md:flex-row md:items-center md:justify-between">
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Gift size={16} className="text-primary" />
                Tap any image to add it to your cart
              </div>
              <div className="flex items-center gap-2">
                {slides.map((product, dotIndex) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => {
                      setTransitionEnabled(true);
                      setIndex(dotIndex);
                    }}
                    className={`h-2.5 rounded-full transition-all ${
                      index % slides.length === dotIndex ? "w-8 bg-primary" : "w-2.5 bg-border"
                    }`}
                    aria-label={`Show ${product.name}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
