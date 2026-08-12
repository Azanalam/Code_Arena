"use client";

import { useMemo, useState } from "react";
import { Reveal } from "./Reveal";
import { PREVIEW_PROBLEMS, type ProblemPreview } from "./types";

const DIFF_COLORS: Record<ProblemPreview["difficulty"], { badge: string; pulse: string }> = {
  easy: { badge: "bg-zinc-200/90 text-zinc-900 border-zinc-300/60", pulse: "from-white/10" },
  medium: { badge: "bg-stone-300/90 text-zinc-950 border-stone-400/60", pulse: "from-stone-400/10" },
  hard: { badge: "bg-white text-black border-white/70", pulse: "from-white/15" },
};

const CATEGORY_LABEL: Record<string, string> = {
  javascript: "JS",
  python: "Py",
  java: "Java",
  cpp: "C++",
  go: "Go",
  rust: "Rust",
  csharp: "C#",
  typescript: "TS",
  html: "HTML",
  css: "CSS",
};

export function ProblemsShowcase() {
  const [filter, setFilter] = useState<"all" | ProblemPreview["difficulty"]>("all");

  const filtered = useMemo(
    () => (filter === "all" ? PREVIEW_PROBLEMS : PREVIEW_PROBLEMS.filter((p) => p.difficulty === filter)),
    [filter]
  );

  const tabs: { key: "all" | ProblemPreview["difficulty"]; label: string }[] = [
    { key: "all", label: "All" },
    { key: "easy", label: "Easy" },
    { key: "medium", label: "Medium" },
    { key: "hard", label: "Hard" },
  ];

  return (
    <section className="relative py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Reveal className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-400 mb-3">The battleground</p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">200+ challenges, three difficulty tiers</h2>
        </Reveal>

        <Reveal className="flex justify-center mb-10">
          <div className="inline-flex gap-1.5 glass rounded-xl p-1.5">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setFilter(t.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === t.key
                    ? "bg-white text-zinc-950 shadow-lg shadow-black/30"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p, i) => {
            const c = DIFF_COLORS[p.difficulty];
            return (
              <Reveal key={p.title} delay={(i % 3) * 70}>
                <a href="/problems" className="group block relative rounded-xl glass px-5 py-4 overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.07]">
                  <div className={`absolute inset-0 bg-gradient-to-b ${c.pulse} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="relative flex items-center gap-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase ${c.badge}`}>{p.difficulty}</span>
                    <span className="flex-1 font-medium text-sm text-white truncate">{p.title}</span>
                    <span className="text-[10px] font-semibold text-zinc-500 uppercase">{CATEGORY_LABEL[p.category] ?? p.category}</span>
                  </div>
                </a>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}