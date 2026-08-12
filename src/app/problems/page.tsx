"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getSocket } from "@/lib/socket";
import { getPlayerId } from "@/lib/gameLogic";
import { languageLabel } from "@/lib/languages";

interface ProblemSummary {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  category: string;
  languages?: string[];
}

export default function ProblemsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [problems, setProblems] = useState<ProblemSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [solvedIds, setSolvedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const s = getSocket();
    if (!s.connected) s.connect();
    const onConnect = () => {
      s.emit("get-problems", {}, (data: ProblemSummary[]) => {
        setProblems(data);
        setLoading(false);
      });
    };
    if (s.connected) onConnect();
    else s.on("connect", onConnect);
    return () => { s.off("connect", onConnect); };
  }, []);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;
    const s = getSocket();
    if (!s.connected) s.connect();
    const onConnect = () => {
      s.emit("get-submissions", { userId }, (data: { problemId: string; passed: boolean }[] | { error: string }) => {
        if ("error" in data) return;
        setSolvedIds(new Set(data.filter((sub) => sub.passed).map((sub) => sub.problemId)));
      });
    };
    if (s.connected) onConnect();
    else s.on("connect", onConnect);
    return () => { s.off("connect", onConnect); };
  }, [session?.user?.id]);

  const startPractice = (slug: string) => {
    const s = getSocket();
    s.emit("practice-start", { slug, userId: getPlayerId() }, (res: { roomId: string } | { error: string }) => {
      if ("error" in res) return;
      router.push(`/game/${res.roomId}`);
    });
  };

  const categories = ["all", ...new Set(problems.map((p) => p.category))];
  const q = query.trim().toLowerCase();
  const filtered = problems.filter(
    (p) =>
      (filter === "all" || p.category === filter) &&
      (!q || p.title.toLowerCase().includes(q) || p.slug.includes(q))
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex items-center gap-4 px-4 sm:px-6 py-4 bg-zinc-900/80 border-b border-zinc-800">
        <button onClick={() => router.push("/lobby")} className="text-zinc-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <span className="text-white font-bold text-lg">Code<span className="text-stone-300">Arena</span></span>
        <span className="text-zinc-500 text-sm">Problems</span>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h1 className="text-2xl font-bold">All Problems <span className="text-zinc-600 text-base font-normal">({problems.length})</span></h1>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button key={c} onClick={() => setFilter(c)} className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all capitalize ${
                filter === c ? "bg-white text-zinc-950" : "bg-zinc-800 text-zinc-400 hover:text-white"
              }`}>
                {c === "all" ? "All" : c}
              </button>
            ))}
          </div>
        </div>

        <div className="relative mb-6">
          <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search problems…"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-zinc-400 placeholder-zinc-600"
          />
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-14 bg-zinc-900 border border-zinc-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <svg className="w-12 h-12 mx-auto text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="text-zinc-500 text-sm">No problems match your search.</p>
            {(query || filter !== "all") && (
              <button
                onClick={() => { setQuery(""); setFilter("all"); }}
                className="text-xs px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg font-medium transition-all"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((p) => (
              <div key={p.id} className={`flex items-center gap-3 sm:gap-4 bg-zinc-900 rounded-lg px-4 sm:px-5 py-4 border transition-colors min-w-0 ${
                solvedIds.has(p.id) ? "border-green-900/60" : "border-zinc-800 hover:border-zinc-700"
              }`}>
                {solvedIds.has(p.id) ? (
                  <span className="text-green-400 flex-shrink-0" title="Solved">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </span>
                ) : (
                  <span className="w-4 h-4 flex-shrink-0" />
                )}
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
p.difficulty === "easy" ? "bg-zinc-800/80 text-zinc-200" :
    p.difficulty === "medium" ? "bg-zinc-800/80 text-stone-300" :
    "bg-zinc-700/80 text-white"
                }`}>
                  {p.difficulty}
                </span>
                <span className="flex-1 font-medium truncate">{p.title}</span>
                <span className="hidden md:flex items-center gap-1 flex-shrink-0">
                  {(p.languages?.length ? p.languages : [p.category]).slice(0, 3).map((l) => (
                    <span key={l} className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                      {languageLabel(l)}
                    </span>
                  ))}
                  {(p.languages?.length ?? 0) > 3 && (
                    <span className="text-[10px] text-zinc-600">+{(p.languages?.length ?? 0) - 3}</span>
                  )}
                </span>
                <span className="hidden sm:block text-xs text-zinc-600 uppercase">{p.category}</span>
                <button onClick={() => startPractice(p.slug)} className="text-xs px-3 sm:px-4 py-1.5 bg-white hover:bg-zinc-200 text-zinc-950 rounded-md font-medium transition-all flex-shrink-0">
                  Practice
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
