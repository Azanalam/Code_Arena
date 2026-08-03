"use client";

import { Reveal } from "./Reveal";

const FEATURES = [
  {
    title: "Head-to-head battles",
    desc: "Compete in rooms of 2–4. First to land every test case on the same problem wins — score is decided by speed and difficulty.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
    ),
    accent: "from-blue-600/25 to-transparent",
  },
  {
    title: "40+ curated challenges",
    desc: "From Two Sum to Trapping Rain Water — carefully verified test batteries across Easy, Medium and Hard.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
    ),
    accent: "from-violet-500/25 to-transparent",
  },
  {
    title: "Real problem solving",
    desc: "Write real code in a Monaco editor and run it against hidden test suites — instant pass/fail feedback with your score.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2M3 12a9 9 0 0118 0M3 12a9 9 0 0018 0" /></svg>
    ),
    accent: "from-emerald-500/25 to-transparent",
  },
  {
    title: "Reconnection-safe",
    desc: "Lose your connection mid-battle? Your player and code are restored automatically — reload and jump right back in.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M4 4v5h5M20 20v-5h-5M4.5 9A7.5 7.5 0 0119 7M19.5 15A7.5 7.5 0 015 17" /></svg>
    ),
    accent: "from-amber-500/25 to-transparent",
  },
  {
    title: "AI mentor & live chat",
    desc: "Stuck? Ask the AI mentor for a hint — or bench-talk trash in the room chat between rounds.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
    ),
    accent: "from-fuchsia-500/25 to-transparent",
  },
  {
    title: "Persistent leaderboard",
    desc: "Victories are saved to your profile — track your solve rate, points, and climb the global board over time.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
    ),
    accent: "from-sky-500/25 to-transparent",
  },
];

export function Features() {
  return (
    <section className="relative py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Reveal className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400 mb-3">Why CodeArena</p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">Built for the race,<br />not the grind</h2>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 90}>
              <div className="group relative h-full rounded-2xl glass p-6 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.07]">
                <div className={`absolute inset-0 bg-gradient-to-br ${f.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600/30 to-purple-600/30 border border-white/10 flex items-center justify-center text-blue-300 mb-4">
                    {f.icon}
                  </div>
                  <h3 className="font-semibold text-lg text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}