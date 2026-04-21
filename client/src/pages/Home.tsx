// ==================== src/pages/Home.tsx ====================
// Clean page file — just imports and composition.
// All logic lives in src/components/home/*

import {
  Navbar,
  Hero,
  StatsBar,
  Features,
  Architecture,
  TechStack,
  Comparison,
  CTA,
  Footer,
} from "../components/home/index.js";

export default function Home() {
  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-bg)", color: "var(--color-text-primary)" }}
    >
      <Navbar />
      <Hero />
      <StatsBar />
      <Features />
      <Architecture />
      <TechStack />
      <Comparison />
      <CTA />
      <Footer />
    </div>
  );
}