import { Suspense, lazy } from "react";
import { AuthModal } from "@/components/site/AuthModal";
import { CartDrawer } from "@/components/site/CartDrawer";
import { DeferredSection } from "@/components/site/DeferredSection";
import { GiftExperience } from "@/components/site/GiftExperience";
import { Hero } from "@/components/site/Hero";
import { Nav } from "@/components/site/Nav";
import { OrdersDrawer } from "@/components/site/OrdersDrawer";
import { Shop } from "@/components/site/Shop";
import { SocialProof } from "@/components/site/SocialProof";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { CommerceProvider } from "@/lib/commerce";

const AdminDashboard = lazy(() =>
  import("@/admin/AdminDashboard").then((module) => ({ default: module.AdminDashboard })),
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
  const collectionMatch = window.location.pathname.match(/^\/collections\/(women|men|custom)/);
  const activeCollection = (collectionMatch?.[1] as "women" | "men" | "custom" | undefined) || null;

  if (isAdminHost || window.location.pathname.startsWith("/admin")) {
    return (
      <Suspense
        fallback={
          <div className="grid min-h-screen place-items-center bg-background text-foreground">
            Loading admin...
          </div>
        }
      >
        <AdminDashboard />
      </Suspense>
    );
  }

  return (
    <CommerceProvider>
      <main className="min-h-screen bg-background">
        <Nav />
        {!activeCollection && <Hero />}
        <Shop collectionSlug={activeCollection} />
        {!activeCollection && (
          <>
            <SocialProof />
            <GiftExperience />
          </>
        )}
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
      <WhatsAppFloat />
      <CartDrawer />
      <OrdersDrawer />
      <AuthModal />
    </CommerceProvider>
  );
}
