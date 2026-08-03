"use client";

import { Reveal } from "./Reveal";

const STEPS = [
  {
    n: "01",
    title: "Pick your challenge",
    desc: "Create a room, share the code, or hop into solo practice. Choose Easy, Medium or Hard across JavaScript, HTML and CSS.",
  },
  {
    n: "02",
    title: "Race the clock",
    desc: "Solve the same problem as everyone else. Live code, instant test results, and a score that rewards speed and difficulty.",
  },
  {
    n: "03",
    title: "Claim the board",
    desc: "Pass the tests first to win the round. Scores land on your profile and the global leaderboard — replay any time.",
  },
];

export function HowItWorks() {
  return (
    <section className="relative py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Reveal className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-400 mb-3">How it works</p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">From lobby to victory in three steps</h2>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-5">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 110}>
              <div className="relative rounded-2xl glass p-7 h-full">
                <div className="absolute top-0 left-7 -translate-y-1/2 flex items-center gap-3">
                  <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-sm font-bold flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
                    {s.n}
                  </span>
                  {i < STEPS.length - 1 && (
                    <span className="hidden md:block h-px w-16 bg-gradient-to-r from-white/30 to-transparent" />
                  )}
                </div>
                <h3 className="pt-6 text-lg font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}