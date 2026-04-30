import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import bouquet from "@/assets/product-bouquet.jpg";
import bow from "@/assets/product-bow.jpg";
import keychain from "@/assets/product-keychain.jpg";
import { SiteImage } from "@/components/site/SiteImage";

const items = [
  { src: g1, alt: "Blue crochet lily", span: "row-span-2" },
  { src: bow, alt: "Pink crochet bow", span: "" },
  { src: g2, alt: "Cream crochet bunny", span: "" },
  { src: g3, alt: "Crochet sunflower", span: "row-span-2" },
  { src: keychain, alt: "Crochet teddy charm", span: "" },
  { src: bouquet, alt: "Crochet bouquet", span: "" },
];

export function Gallery() {
  return (
    <section className="py-24 motion-safe:animate-fade-up md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="mb-12 flex flex-col items-end justify-between gap-4 md:flex-row">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-primary">Gallery</span>
            <h2 className="mt-3 font-display text-4xl text-foreground md:text-5xl">
              From the <em className="text-primary">studio</em>
            </h2>
          </div>
          <a
            href="https://instagram.com/iksha_cozies"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            See more on Instagram {"->"}
          </a>
        </div>

        <div className="grid auto-rows-[180px] grid-cols-2 gap-4 md:auto-rows-[220px] md:grid-cols-4">
          {items.map((item, index) => (
            <figure
              key={index}
              className={`group relative overflow-hidden rounded-2xl border border-border bg-card shadow-card ${item.span}`}
            >
              <SiteImage
                src={item.src}
                alt={item.alt}
                loading="lazy"
                containerClassName="h-full"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/30 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
