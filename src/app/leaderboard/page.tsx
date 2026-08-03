"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket";
import { Avatar } from "@/components/Avatar";

interface Entry {
  name: string;
  score: number;
  date: number;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = getSocket();
    if (!s.connected) s.connect();

    const onConnect = () => {
      s.emit("get-leaderboard", {}, (data: Entry[]) => {
        setEntries(data);
        setLoading(false);
      });
    };

    if (s.connected) onConnect();
    else s.on("connect", onConnect);

    return () => { s.off("connect", onConnect); };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex items-center gap-4 px-4 sm:px-6 py-4 bg-zinc-900/80 border-b border-zinc-800">
        <button onClick={() => router.push("/lobby")} className="text-zinc-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <span className="text-white font-bold text-lg">
          Code<span className="text-blue-500">Arena</span>
        </span>
        <span className="text-zinc-500 text-sm">Leaderboard</span>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Top Players</h1>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-14 bg-zinc-900 border border-zinc-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <p className="text-zinc-500 text-center py-12">No scores yet. Play a game to get on the board!</p>
        ) : (
          <div className="space-y-2">
            {entries.map((e, i) => (
              <div key={i} className={`flex items-center gap-4 bg-zinc-900 rounded-lg px-4 py-3 border ${i < 3 ? "border-zinc-700" : "border-zinc-800"} transition-colors`}>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  i === 0 ? "bg-yellow-400 text-black" :
                  i === 1 ? "bg-zinc-300 text-black" :
                  i === 2 ? "bg-amber-700 text-white" :
                  "bg-zinc-800 text-zinc-500"
                }`}>{i + 1}</span>
                <Avatar name={e.name} image={null} size={32} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{e.name}</div>
                  <div className="text-[11px] text-zinc-600">{new Date(e.date).toLocaleDateString()}</div>
                </div>
                <span className="text-blue-400 font-mono font-bold">{e.score} pts</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
