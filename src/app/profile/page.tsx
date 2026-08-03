"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { getSocket } from "@/lib/socket";
import { Avatar } from "@/components/Avatar";

interface SubmissionSummary {
  id: string;
  problemId: string;
  title: string;
  difficulty: string;
  category: string;
  language: string;
  passed: boolean;
  score: number;
  output: string | null;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [submissions, setSubmissions] = useState<SubmissionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;
    const userId = session.user.id;
    const s = getSocket();
    if (!s.connected) s.connect();
    const onConnect = () => {
      s.emit("get-submissions", { userId }, (data: SubmissionSummary[] | { error: string }) => {
        if ("error" in data) {
          setSubmissions([]);
        } else {
          setSubmissions(data);
        }
        setLoading(false);
      });
    };
    if (s.connected) onConnect();
    else s.on("connect", onConnect);
    return () => { s.off("connect", onConnect); };
  }, [status, session?.user?.id]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-6 px-4">
        <span className="text-white font-bold text-2xl">Code<span className="text-stone-300">Arena</span></span>
        <p className="text-zinc-400 text-sm">Sign in to view your submission history.</p>
        <button
          onClick={() => signIn("google", { redirectTo: "/profile" })}
          className="px-6 py-2.5 bg-white hover:bg-zinc-200 text-zinc-950 rounded-lg font-medium transition-all"
        >
          Sign In
        </button>
        <button onClick={() => router.push("/lobby")} className="text-sm text-zinc-600 hover:text-zinc-300 transition-colors">
          Back to Lobby
        </button>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const attempts = submissions.length;
  const solved = submissions.filter((s) => s.passed).length;
  const totalScore = submissions.reduce((sum, s) => sum + (s.passed ? s.score : 0), 0);
  const solveRate = attempts > 0 ? Math.round((solved / attempts) * 100) : 0;
  const uniqueSolved = new Set(submissions.filter((s) => s.passed).map((s) => s.problemId)).size;

  const byCategory = submissions.reduce<Record<string, number>>((acc, s) => {
    acc[s.category] = (acc[s.category] ?? 0) + 1;
    return acc;
  }, {});

  const categoryLabels: Record<string, string> = {
    javascript: "JavaScript",
    html: "HTML",
    css: "CSS",
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex items-center gap-4 px-4 sm:px-6 py-4 bg-zinc-900/80 border-b border-zinc-800">
        <button onClick={() => router.push("/lobby")} className="text-zinc-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <span className="text-white font-bold text-lg">Code<span className="text-stone-300">Arena</span></span>
        <span className="text-zinc-500 text-sm">Profile</span>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center gap-4">
          <Avatar name={session.user.name} image={session.user.image} size={64} />
          <div>
            <h1 className="text-2xl font-bold">{session.user.name}</h1>
            <p className="text-zinc-500 text-sm">{session.user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-stone-200">{attempts}</div>
            <div className="text-xs text-zinc-500 mt-1">Attempts</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-green-400">{solved}</div>
            <div className="text-xs text-zinc-500 mt-1">Solved</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-zinc-100">{totalScore}</div>
            <div className="text-xs text-zinc-500 mt-1">Points</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-stone-200">{solveRate}%</div>
            <div className="text-xs text-zinc-500 mt-1">Solve Rate</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-zinc-200">{uniqueSolved}</div>
            <div className="text-xs text-zinc-500 mt-1">Problems</div>
          </div>
        </div>

        {attempts > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-zinc-500">Activity by topic:</span>
            {Object.entries(byCategory).map(([cat, count]) => (
              <span key={cat} className="text-xs font-medium px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300">
                {categoryLabels[cat] ?? cat} · {count}
              </span>
            ))}
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold mb-4">Submission History</h2>
          {loading ? (
            <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" /></div>
          ) : submissions.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
              <p className="text-zinc-500 text-sm">No submissions yet. Play a game or practice a problem!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {submissions.map((s) => (
                <div key={s.id} className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 flex items-center gap-3 min-w-0 hover:bg-zinc-900/70 transition-colors">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.passed ? "bg-green-400" : "bg-red-400"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-medium text-sm truncate">{s.title}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded capitalize ${
s.difficulty === "easy" ? "bg-zinc-800/80 text-zinc-200" :
    s.difficulty === "medium" ? "bg-zinc-800/80 text-stone-300" : "bg-zinc-700/80 text-white"
                      }`}>{s.difficulty}</span>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase">
                        {s.language}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5 truncate">
                      {new Date(s.createdAt).toLocaleString()} · {s.category}
                      {!s.passed && s.output ? ` · ${s.output.slice(0, 80)}` : ""}
                    </div>
                  </div>
                  <span className={`text-sm font-mono flex-shrink-0 ${s.passed ? "text-green-400" : "text-red-400"}`}>
                    {s.passed ? `+${s.score} pts` : "Failed"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
