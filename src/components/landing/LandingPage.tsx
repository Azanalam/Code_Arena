"use client";

import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { Marquee } from "./Marquee";
import { Features } from "./Features";
import { HowItWorks } from "./HowItWorks";
import { ProblemsShowcase } from "./ProblemsShowcase";
import { FinalCta } from "./FinalCta";
import { Footer } from "./Footer";
import type { LandingUser } from "./types";

export function LandingPage({ user }: { user: LandingUser | null }) {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-zinc-300/40 selection:text-zinc-950">
      <Navbar user={user} />
      <main>
        <Hero user={user} />
        <div className="-mt-6">
          <Marquee />
        </div>
        <Features />
        <HowItWorks />
        <ProblemsShowcase />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}