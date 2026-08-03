"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket";
import { getPlayerId } from "@/lib/gameLogic";

interface ProblemSummary {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  category: string;
}

export default function ProblemsPage() {
  const router = useRouter();
  const [problems, setProblems] = useState<ProblemSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

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

  const startPractice = (slug: string) => {
    const s = getSocket();
    s.emit("practice-start", { slug, userId: getPlayerId() }, (res: { roomId: string } | { error: string }) => {
      if ("error" in res) return;
      router.push(`/game/${res.roomId}`);
    });
  };

  const categories = ["all", ...new Set(problems.map((p) => p.category))];
  const filtered = filter === "all" ? problems : problems.filter((p) => p.category === filter);

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex items-center gap-4 px-4 sm:px-6 py-4 bg-zinc-900/80 border-b border-zinc-800">
        <button onClick={() => router.push("/lobby")} className="text-zinc-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <span className="text-white font-bold text-lg">Code<span className="text-blue-500">Arena</span></span>
        <span className="text-zinc-500 text-sm">Problems</span>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl font-bold">All Problems <span className="text-zinc-600 text-base font-normal">({problems.length})</span></h1>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button key={c} onClick={() => setFilter(c)} className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all capitalize ${
                filter === c ? "bg-blue-700 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"
              }`}>
                {c === "all" ? "All" : c}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-14 bg-zinc-900 border border-zinc-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-zinc-500 text-center py-12">No problems found.</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((p) => (
              <div key={p.id} className="flex items-center gap-3 sm:gap-4 bg-zinc-900 rounded-lg px-4 sm:px-5 py-4 border border-zinc-800 hover:border-zinc-700 transition-colors min-w-0">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                  p.difficulty === "easy" ? "bg-green-900/50 text-green-400" :
                  p.difficulty === "medium" ? "bg-yellow-900/50 text-yellow-400" :
                  "bg-red-900/50 text-red-400"
                }`}>
                  {p.difficulty}
                </span>
                <span className="flex-1 font-medium truncate">{p.title}</span>
                <span className="hidden sm:block text-xs text-zinc-600 uppercase">{p.category}</span>
                <button onClick={() => startPractice(p.slug)} className="text-xs px-3 sm:px-4 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-md font-medium transition-all flex-shrink-0">
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
