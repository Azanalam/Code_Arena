"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getSocket } from "@/lib/socket";
import { Avatar } from "@/components/Avatar";

interface Entry {
  name: string;
  score: number;
  date: number;
  userId: string | null;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<"week" | "all">("all");
  const [weekAgo, setWeekAgo] = useState(0);

  useEffect(() => {
    const s = getSocket();
    if (!s.connected) s.connect();
    const onConnect = () => {
      s.emit("get-leaderboard", {}, (data: Entry[]) => {
        setEntries(data);
        setWeekAgo(Date.now() - 7 * 24 * 60 * 60 * 1000);
        setLoading(false);
      });
    };
    if (s.connected) onConnect();
    else s.on("connect", onConnect);
    return () => { s.off("connect", onConnect); };
  }, []);

  const visible = range === "week" ? entries.filter((e) => e.date >= weekAgo) : entries;
  const myId = session?.user?.id;

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex items-center gap-4 px-4 sm:px-6 py-4 bg-zinc-900/80 border-b border-zinc-800">
        <button onClick={() => router.push("/lobby")} className="text-zinc-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <span className="text-white font-bold text-lg">
          Code<span className="text-stone-300">Arena</span>
        </span>
        <span className="text-zinc-500 text-sm">Leaderboard</span>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Top Players</h1>
          <div className="flex gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
            {(["week", "all"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all capitalize ${
                  range === r ? "bg-white text-zinc-950" : "text-zinc-400 hover:text-white"
                }`}
              >
                {r === "week" ? "This week" : "All time"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-14 bg-zinc-900 border border-zinc-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <p className="text-zinc-500 text-center py-12">No scores yet. Play a game to get on the board!</p>
        ) : visible.length === 0 ? (
          <p className="text-zinc-500 text-center py-12">No scores this week yet. Play a game to get on the board!</p>
        ) : (
          <div className="space-y-2">
            {visible.map((e, i) => (
              <div key={i} className={`flex items-center gap-4 bg-zinc-900 rounded-lg px-4 py-3 border transition-colors ${
                e.userId && e.userId === myId
                  ? "bg-zinc-700/40 border-zinc-600/50"
                  : i < 3 ? "border-zinc-700" : "border-zinc-800"
              }`}>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  i === 0 ? "bg-yellow-400 text-black" :
                  i === 1 ? "bg-zinc-300 text-black" :
                  i === 2 ? "bg-amber-700 text-white" :
                  "bg-zinc-800 text-zinc-500"
                }`}>{i + 1}</span>
                <Avatar name={e.name} image={null} size={32} />
                <div className="flex-1 min-w-0">
                  <div className={`font-medium truncate ${e.userId === myId ? "text-white" : ""}`}>
                    {e.name} {e.userId === myId && <span className="text-zinc-400 text-xs font-normal">(You)</span>}
                  </div>
                  <div className="text-[11px] text-zinc-600">{new Date(e.date).toLocaleDateString()}</div>
                </div>
                <span className="text-stone-300 font-mono font-bold">{e.score} pts</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
