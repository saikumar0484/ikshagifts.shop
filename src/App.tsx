import { Suspense, lazy } from "react";
import { AuthModal } from "@/components/site/AuthModal";
import { CartDrawer } from "@/components/site/CartDrawer";
import { DeferredSection } from "@/components/site/DeferredSection";
import { Hero } from "@/components/site/Hero";
import { Marquee } from "@/components/site/Marquee";
import { Nav } from "@/components/site/Nav";
import { OrdersDrawer } from "@/components/site/OrdersDrawer";
import { Shop } from "@/components/site/Shop";
import { TrustBar } from "@/components/site/TrustBar";
import { CommerceProvider } from "@/lib/commerce";

const AdminDashboard = lazy(() =>
  import("@/admin/AdminDashboard").then((module) => ({ default: module.AdminDashboard })),
);
const About = lazy(() =>
  import("@/components/site/About").then((module) => ({ default: module.About })),
);
const Gallery = lazy(() =>
  import("@/components/site/Gallery").then((module) => ({ default: module.Gallery })),
);
const Contact = lazy(() =>
  import("@/components/site/Contact").then((module) => ({ default: module.Contact })),
);
const LegalPolicies = lazy(() =>
  import("@/components/site/LegalPolicies").then((module) => ({
    default: module.LegalPolicies,
  })),
);
const Footer = lazy(() =>
  import("@/components/site/Footer").then((module) => ({ default: module.Footer })),
);

export function App() {
  const isAdminHost = window.location.hostname.startsWith("admin.");
  if (isAdminHost || window.location.pathname.startsWith("/admin")) {
    return (
      <Suspense fallback={<div className="grid min-h-screen place-items-center bg-background text-foreground">Loading admin...</div>}>
        <AdminDashboard />
      </Suspense>
    );
  }

  return (
    <CommerceProvider>
      <main className="min-h-screen bg-background">
        <Nav />
        <Hero />
        <TrustBar />
        <Marquee />
        <Shop />
        <DeferredSection id="about" minHeight={980}>
          <Suspense fallback={null}>
            <About />
          </Suspense>
        </DeferredSection>
        <DeferredSection id="gallery" minHeight={780}>
          <Suspense fallback={null}>
            <Gallery />
          </Suspense>
        </DeferredSection>
        <DeferredSection id="contact" minHeight={720}>
          <Suspense fallback={null}>
            <Contact />
          </Suspense>
        </DeferredSection>
        <Suspense fallback={null}>
          <LegalPolicies />
        </Suspense>
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </main>
      <CartDrawer />
      <OrdersDrawer />
      <AuthModal />
    </CommerceProvider>
  );
}
