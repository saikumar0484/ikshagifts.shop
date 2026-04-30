import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Marquee } from "@/components/site/Marquee";
import { Shop } from "@/components/site/Shop";
import { About } from "@/components/site/About";
import { Gallery } from "@/components/site/Gallery";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "iksha gifts — Handmade Crochet Bows, Bouquets & Keepsakes" },
      {
        name: "description",
        content:
          "iksha gifts makes hand-crocheted bows, flower bouquets, keychains and tiny treasures. Customised, made-to-order with love in India.",
      },
      { property: "og:title", content: "iksha gifts — Handmade Crochet Keepsakes" },
      {
        property: "og:description",
        content: "Cozy little crochet treasures, made stitch by stitch.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=DM+Sans:opsz,wght@9..40,300..600&display=swap",
      },
    ],
  }),
});

function Index() {
  return (
    <main className="min-h-screen bg-background">
      <Nav />
      <Hero />
      <Marquee />
      <Shop />
      <About />
      <Gallery />
      <Contact />
      <Footer />
    </main>
  );
}
