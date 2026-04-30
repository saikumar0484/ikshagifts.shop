import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Gift, ShoppingBag, Sparkles } from "lucide-react";
import { SiteImage } from "@/components/site/SiteImage";
import { formatPrice } from "@/data/products";
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
    <section id="top" className="border-b border-border px-6 py-10 md:px-10 md:py-14">
      <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[1.05fr_1.2fr]">
        <div className="rounded-[2rem] border border-border bg-card p-7 shadow-card md:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-secondary px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            <Sparkles size={14} />
            Limited Custom Orders Available Today
          </div>

          <h1 className="mt-6 font-display text-5xl leading-[1.02] text-foreground md:text-7xl">
            More Than a Gift <span className="text-primary">— It&apos;s a Memory.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground md:text-lg">
            Premium Personalized Gifts for Every Occasion. Curated, wrapped, and finished to feel
            thoughtful from first glance to final unboxing.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#featured-products"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01]"
            >
              Shop Now
              <ArrowRight size={16} />
            </a>
            <a
              href="/collections/custom"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-6 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              Customize Your Gift 💝
            </a>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.35rem] bg-background p-4">
              <p className="text-sm font-semibold text-foreground">Order before 5PM</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Faster dispatch available for ready-to-wrap featured gifts.
              </p>
            </div>
            <div className="rounded-[1.35rem] bg-background p-4">
              <p className="text-sm font-semibold text-foreground">Premium packaging included</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Gift-ready wrapping and careful presentation are part of the experience.
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2.2rem] border border-border bg-card shadow-soft">
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
                <div className="relative aspect-[16/11] min-h-[320px] md:min-h-[510px]">
                  <SiteImage
                    src={product.image}
                    alt={product.name}
                    width={1600}
                    height={1100}
                    loading={slideIndex === 0 ? "eager" : "lazy"}
                    fetchPriority={slideIndex === 0 ? "high" : "auto"}
                    containerClassName="h-full"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/28 via-transparent to-transparent" />

                  <div className="absolute left-5 top-5 rounded-full bg-card/92 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary shadow-card backdrop-blur">
                    Best Product
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-4 p-5 md:p-7">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                      <div className="rounded-[1.5rem] bg-card/88 px-5 py-4 shadow-card backdrop-blur">
                        <p className="font-display text-2xl text-foreground md:text-3xl">
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
                        🚚 Delivery in 3–5 Days
                      </span>
                      <span className="rounded-full bg-card/90 px-4 py-2 text-xs font-semibold text-foreground backdrop-blur">
                        🎁 Premium Packaging Included
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {slides.length > 1 && (
            <div className="flex items-center justify-between border-t border-border bg-card px-5 py-4">
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Gift size={16} className="text-primary" />
                Order Your Gift Now 🎁
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

