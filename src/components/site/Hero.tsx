import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { SiteImage } from "@/components/site/SiteImage";
import { useCommerce } from "@/lib/commerce";

const SLIDE_INTERVAL_MS = 2000;
const SLIDE_TRANSITION_MS = 700;

export function Hero() {
  const { addToCart, products } = useCommerce();
  const [index, setIndex] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);

  const slides = products.filter((product) => product.isAvailable !== false).slice(0, 4);
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
    <section
      id="top"
      className="relative overflow-hidden border-b border-border px-6 py-10 md:px-10 md:py-14"
    >
      <div className="mx-auto max-w-7xl">
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
                <div className="relative aspect-[16/7] min-h-[280px] md:min-h-[420px]">
                  <SiteImage
                    src={product.image}
                    alt={product.name}
                    width={1600}
                    height={900}
                    loading={slideIndex === 0 ? "eager" : "lazy"}
                    fetchPriority={slideIndex === 0 ? "high" : "auto"}
                    containerClassName="h-full"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/22 via-transparent to-transparent" />

                  <div className="absolute left-5 top-5 rounded-full bg-card/92 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary shadow-card backdrop-blur">
                    Best product
                  </div>

                  <div className="absolute right-5 top-5 rounded-full bg-card/92 px-4 py-2 text-xs font-medium text-foreground shadow-card backdrop-blur">
                    {product.category}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-4 p-5 md:p-7">
                    <div className="rounded-[1.6rem] bg-card/88 px-5 py-4 shadow-card backdrop-blur">
                      <p className="font-display text-2xl text-foreground md:text-3xl">
                        {product.name}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">{product.delivery}</p>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-card transition-transform group-hover:scale-[1.03]">
                      <ShoppingBag size={16} />
                      Add to cart
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {slides.length > 1 && (
          <div className="mt-5 flex items-center justify-center gap-2">
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
        )}
      </div>
    </section>
  );
}
