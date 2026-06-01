// ==================== src/pages/Home.tsx ====================
import { lazy, Suspense } from "react";
import { Navbar, Hero } from "../components/home/index.js";

const StatsBar     = lazy(() => import("../components/home/StatsBar").then(m     => ({ default: m.StatsBar })));
const Features     = lazy(() => import("../components/home/Features").then(m     => ({ default: m.Features })));
const Architecture = lazy(() => import("../components/home/Architecture").then(m => ({ default: m.Architecture })));
const TechStack    = lazy(() => import("../components/home/TechStack").then(m    => ({ default: m.TechStack })));
const Comparison   = lazy(() => import("../components/home/Comparison").then(m   => ({ default: m.Comparison })));
const CTA          = lazy(() => import("../components/home/CTA").then(m          => ({ default: m.CTA })));
const Footer       = lazy(() => import("../components/home/Footer").then(m       => ({ default: m.Footer })));

export default function Home() {
  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ background: "var(--color-bg)", color: "var(--color-text-primary)" }}
    >
      <Navbar />
      <Hero />
      <Suspense fallback={<div style={{ minHeight: "200vh" }} />}>
        <StatsBar />
        <Features />
        <Architecture />
        <TechStack />
        <Comparison />
        <CTA />
        <Footer />
      </Suspense>
    </div>
  );
}
