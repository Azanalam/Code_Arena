"use client";

import { useEffect, useMemo, useState } from "react";
import { CountUp } from "./CountUp";
import { Particles } from "./Particles";
import { TypingCode } from "./TypingCode";
import type { LandingUser } from "./types";

const PLAYERS = [
  { name: "alice_codes", color: "#a1a1aa", diff: "easy" },
  { name: "you", color: "#d6d3d1", diff: "hard" },
];

function LiveBattleCard() {
  const [phase, setPhase] = useState(0);
  const progress = [Math.min(100, phase * 17), Math.min(100, (phase + 2) * 13)];

  useEffect(() => {
    const t = setInterval(() => setPhase((p) => (p + 1) % 9), 1400);
    return () => clearInterval(t);
  }, []);

  const statusA = progress[0] >= 100 ? "All tests passed" : phase % 2 === 0 ? "Running tests…" : "Compiling…";
  const statusB = progress[1] >= 100 ? "Wrong answer" : phase % 2 === 0 ? "Compiling…" : "Running tests…";

  return (
    <div className="glass rounded-2xl p-4 sm:p-5 shadow-2xl shadow-black/40">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-xs font-medium">
          <span className="live-dot w-2 h-2 rounded-full bg-red-500" />
          <span className="text-zinc-300">LIVE MATCH</span>
        </div>
        <span className="text-xs font-mono text-zinc-400">42P2 · 2 players</span>
      </div>

      {PLAYERS.map((p, i) => (
        <div key={p.name} className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="flex items-center gap-2 font-medium" style={{ color: p.color }}>
              <span className="w-4 h-4 rounded-full ring-1 ring-white/20" style={{ background: p.color }} />
              {p.name}
            </span>
            <span className={`font-mono ${progress[i] >= 100 ? "text-zinc-100" : "text-zinc-400"} transition-colors`}>
              {progress[i] >= 100 ? "✓ " + statusA : statusB && i === 1 ? statusB : statusA}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progress[i]}%`, background: `linear-gradient(90deg, ${p.color}88, ${p.color})` }}
            />
          </div>
        </div>
      ))}

      <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
        <span className="text-zinc-500 font-mono">06:43 left</span>
        <div className="flex gap-1.5">
          <span className="px-2 py-0.5 rounded-md bg-zinc-200/20 text-zinc-200 font-medium">Easy</span>
          <span className="px-2 py-0.5 rounded-md bg-stone-400/20 text-stone-200 font-medium">Hard</span>
        </div>
      </div>
    </div>
  );
}

function CodeWindow() {
  return (
    <div className="glass rounded-2xl overflow-hidden shadow-2xl shadow-black/50 glow-border">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
        <span className="w-3 h-3 rounded-full bg-red-500/80" />
        <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
        <span className="w-3 h-3 rounded-full bg-green-500/80" />
        <span className="ml-3 text-xs text-zinc-500 font-mono">solution.js — Two Sum</span>
      </div>
      <div className="p-4">
        <TypingCode />
      </div>
    </div>
  );
}

export function Hero({ user }: { user: LandingUser | null }) {
  const [mouse, setMouse] = useState({ x: -500, y: -500 });

  const spotlight = useMemo(
    () => ({
      background: `radial-gradient(600px circle at ${mouse.x}px ${mouse.y}px, rgba(255,255,255,0.07), transparent 65%)`,
    }),
    [mouse]
  );

  return (
    <section
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
      className="relative min-h-screen overflow-hidden pt-24 pb-20"
    >
      <div className="absolute inset-0 -z-10">
        <Particles className="absolute inset-0" />
        <div className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,black,transparent)]" />
        <div className="absolute -top-40 -left-40 w-[34rem] h-[34rem] rounded-full bg-zinc-400/10 blur-[120px] animate-aurora" />
        <div className="absolute -top-20 right-0 w-[30rem] h-[30rem] rounded-full bg-stone-400/10 blur-[120px] animate-aurora" style={{ animationDelay: "-6s" }} />
        <div className="absolute bottom-0 left-1/3 w-[28rem] h-[28rem] rounded-full bg-neutral-300/10 blur-[130px] animate-aurora" style={{ animationDelay: "-10s" }} />
      </div>
      <div className="absolute inset-0 -z-10 pointer-events-none" style={spotlight} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs text-zinc-300 mb-6">
              <span className="live-dot w-2 h-2 rounded-full bg-emerald-400" />
              Community battles happening right now
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight">
              Real-time<br />
              <span className="text-gradient">coding battles</span>
            </h1>

            <p className="mt-6 text-lg text-zinc-400 max-w-lg leading-relaxed">
              Race head-to-head against friends and strangers. Solve problems in JavaScript, HTML and CSS — first to pass the tests takes the crown.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="/lobby"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-semibold shadow-xl shadow-black/30 transition-all hover:scale-[1.03]"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                Start a Battle
              </a>
              <a
                href="/problems"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl glass text-white font-medium hover:bg-white/10 transition-all"
              >
                Browse Challenges
              </a>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-6 max-w-md">
              <div>
                <div className="text-3xl font-bold text-white"><CountUp end={40} suffix="+" /></div>
                <div className="text-xs text-zinc-500 mt-1">Challenges</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white"><CountUp end={3} suffix="+" /></div>
                <div className="text-xs text-zinc-500 mt-1">Languages</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">{user ? "∞" : <CountUp end={2} suffix="-4" />}</div>
                <div className="text-xs text-zinc-500 mt-1">Players / room</div>
              </div>
            </div>
          </div>

          <div className="relative space-y-6">
            <div className="hidden sm:block">
              <div className="absolute -inset-8 -z-10 rounded-3xl bg-gradient-to-br from-zinc-400/15 via-transparent to-stone-400/15 blur-2xl animate-float" />
              <CodeWindow />
            </div>
            <div className="hidden sm:block max-w-sm ml-8">
              <div className="absolute -inset-6 -z-10 rounded-3xl bg-stone-500/10 blur-2xl animate-float" style={{ animationDelay: "-4s" }} />
              <LiveBattleCard />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}