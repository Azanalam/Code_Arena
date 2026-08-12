"use client";

import { use, useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSocket } from "@/lib/socket";
import { useGameStore } from "@/store/gameStore";
import { Editor } from "@/components/Editor";
import { Chat } from "@/components/Chat";
import { Scoreboard } from "@/components/Scoreboard";
import { ProblemPanel } from "@/components/ProblemPanel";
import { AiHint } from "@/components/AiHint";
import { getSocket } from "@/lib/socket";
import { playSubmit, isMuted, setMuted } from "@/lib/sounds";
import { PROBLEM_LANGUAGES, languageLabel } from "@/lib/languages";

export default function GamePage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const searchParams = useSearchParams();
  const isSpectator = searchParams.get("spectator") === "1";
  useSocket(roomId);

  const router = useRouter();
  const { data: session } = useSession();
  const {
    code, setCode, status, problem, myUserId, players,
    connecting, testResults, submitting, setSubmitting, reset, countdown,
    setRoomId, language, setLanguage,
  } = useGameStore();
  const isHost = players[0]?.userId === myUserId;
  const [copied, setCopied] = useState(false);
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [mobileTab, setMobileTab] = useState<"problem" | "editor" | "players" | "chat">("problem");
  const [muted, setMutedState] = useState(isMuted());

  const flash =
    testResults && testResults.length > 0 && testResults.every((r) => r.passed)
      ? "All tests passed!"
      : null;

  const [scoreFlash, setScoreFlash] = useState<string | null>(null);
  useEffect(() => {
    if (!scoreFlash) return;
    const t = setTimeout(() => setScoreFlash(null), 4000);
    return () => clearTimeout(t);
  }, [scoreFlash]);

  useEffect(() => {
    const s = getSocket();
    const onScore = ({ userId: uid, score }: { userId: string; score: number }) => {
      if (uid === myUserId && score > 0) setScoreFlash(`Solved! +${score} pts`);
    };
    s.on("score-update", onScore);
    return () => {
      s.off("score-update", onScore);
    };
  }, [myUserId]);

  useEffect(() => {
    setRoomId(roomId);
  }, [roomId, setRoomId]);

  const leaveRoom = useCallback(() => {
    getSocket().emit("leave-room", { roomId });
    reset();
    router.push("/lobby");
  }, [roomId, reset, router]);

  const handleSubmit = useCallback(() => {
    setSubmitting(true);
    playSubmit();
    getSocket().emit("submit-code", { roomId, code, userId: session?.user?.id, language });
  }, [roomId, code, setSubmitting, session?.user?.id, language]);

  const handleStartGame = useCallback(() => {
    getSocket().emit("start-game", { roomId, category, difficulty });
  }, [roomId, category, difficulty]);

  useEffect(() => {
    if (status !== "playing") return;
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && !submitting) {
        handleSubmit();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [status, submitting, handleSubmit]);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomId.split("-")[0]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (connecting) {
    return (
      <div className="h-dvh bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-zinc-400 text-sm">Reconnecting to game…</p>
          <p className="text-zinc-600 text-xs">If this persists, the room may have ended.</p>
        </div>
      </div>
    );
  }

  const roomCode = roomId.split("-")[0];

  if (countdown > 0) {
    return (
      <div className="h-dvh bg-black flex flex-col items-center justify-center">
        <p className="text-zinc-500 text-sm mb-8 tracking-widest uppercase">Get Ready</p>
        <div
          key={countdown}
          className="w-28 h-28 sm:w-36 sm:h-36 rounded-full flex items-center justify-center animate-[countdown_1s_ease-in-out]"
          style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.15), 0 0 60px rgba(255,255,255,0.12)" }}
        >
          <span className="text-7xl sm:text-8xl font-bold text-white">{countdown}</span>
        </div>
        <p className="text-zinc-600 text-xs mt-8">The problem will be revealed soon…</p>
      </div>
    );
  }

  return (
    <div className="h-dvh bg-black flex flex-col">
      <header className="flex items-center flex-wrap gap-x-3 gap-y-2 px-3 sm:px-4 py-2 bg-zinc-900/80 border-b border-zinc-800 backdrop-blur-sm">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button onClick={leaveRoom} className="text-zinc-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="text-white font-bold text-lg">
            Code<span className="text-stone-300">Arena</span>
          </span>
          <span className="text-zinc-700 hidden sm:inline">|</span>
          <button onClick={copyRoomCode} className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors text-sm font-mono bg-zinc-800/50 px-2.5 py-1 rounded-md">
            {roomCode}
            {copied ? (
              <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            )}
          </button>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            status === "waiting" ? "bg-yellow-900/50 text-yellow-400 border border-yellow-700/50" :
            status === "countdown" ? "bg-purple-900/50 text-purple-400 border border-purple-700/50 animate-pulse" :
            status === "playing" ? "bg-green-900/50 text-green-400 border border-green-700/50 animate-pulse" :
            "bg-zinc-800 text-zinc-400 border border-zinc-700"
          }`}>
            {status === "waiting" ? "Waiting" : status === "countdown" ? "Starting" : status === "playing" ? "Live" : "Finished"}
          </span>
          {status === "waiting" && isHost && players.length >= 1 && (
            <div className="w-full flex items-center flex-wrap gap-1.5 pt-1">
              <span className="text-zinc-500 text-xs">Type:</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-zinc-800 text-white text-xs px-2 py-1.5 rounded-md outline-none focus:ring-1 focus:ring-zinc-400 border border-zinc-700 cursor-pointer"
              >
                <option value="all">All</option>
                {PROBLEM_LANGUAGES.map((l) => (
                  <option key={l.id} value={l.id}>{l.label}</option>
                ))}
                <option value="html">HTML</option>
                <option value="css">CSS</option>
              </select>
              <span className="text-zinc-500 text-xs">Diff:</span>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="bg-zinc-800 text-white text-xs px-2 py-1.5 rounded-md outline-none focus:ring-1 focus:ring-zinc-400 border border-zinc-700 cursor-pointer"
              >
                <option value="all">All</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <button onClick={handleStartGame} className="text-xs px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white rounded-md font-medium transition-all">
                Start Game
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => {
              const next = !muted;
              setMuted(next);
              setMutedState(next);
            }}
            className="p-2 text-zinc-400 hover:text-white transition-colors"
            aria-label={muted ? "Unmute sounds" : "Mute sounds"}
          >
            {muted ? (
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
            ) : (
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
            )}
          </button>
          {status === "playing" && !isSpectator && (problem?.languages?.length ?? 0) > 1 && (
            <select
              value={problem?.languages?.includes(language) ? language : problem?.languages?.[0]}
              onChange={(e) => {
                const next = e.target.value;
                setLanguage(next);
                setCode(problem?.starterCodes?.[next] ?? problem?.starterCode ?? "");
              }}
              className="bg-zinc-800 text-white text-xs px-2 py-1.5 rounded-md outline-none focus:ring-1 focus:ring-zinc-400 border border-zinc-700 cursor-pointer"
              title="Language"
            >
              {(problem?.languages ?? []).map((l) => (
                <option key={l} value={l}>{languageLabel(l)}</option>
              ))}
            </select>
          )}
          {status === "playing" && !isSpectator && <AiHint />}
          {status === "playing" && !isSpectator && (
            <>
              <button
                onClick={() => getSocket().emit("forfeit", { roomId })}
                className="px-3 py-1.5 bg-red-800 hover:bg-red-700 text-white text-xs font-medium rounded-md transition-all"
              >
                Forfeit
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-1.5 bg-white hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 text-sm font-medium rounded-md transition-all"
              >
                {submitting ? "Running..." : "Submit"}
              </button>
            </>
          )}
          {isSpectator && (
            <span className="text-xs text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded">Spectating</span>
          )}
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-2 p-2 min-h-0 overflow-hidden">
        <div className="hidden lg:flex w-72 flex-shrink-0 flex-col gap-2">
          <div className="flex-1 min-h-0">
            <Scoreboard />
          </div>
          <div className="flex-[2] min-h-0">
            <Chat />
          </div>
        </div>

        <div className="flex-1 min-w-0 min-h-0 flex flex-col lg:flex-row gap-2">
          <div className={`w-full min-w-0 flex-col min-h-0 ${isSpectator ? "" : "lg:w-1/2"} ${
            mobileTab === "problem" ? "flex flex-1" : "hidden"
          } lg:flex lg:flex-1`}>
            <ProblemPanel />
          </div>
          {!isSpectator && (
            <div className={`w-full min-w-0 flex-col min-h-0 lg:w-1/2 rounded-lg overflow-hidden border border-zinc-800 ${
              mobileTab === "editor" ? "flex flex-1" : "hidden"
            } lg:flex lg:flex-1`}>
              <Editor
                value={code}
                onChange={setCode}
                language={
                  problem?.category === "html" ? "html"
                  : problem?.category === "css" ? "css"
                  : (problem?.languages?.includes(language) ? language : (problem?.languages?.[0] ?? "javascript"))
                }
                readOnly={status !== "playing"}
              />
            </div>
          )}
          <div className={`min-w-0 flex-col min-h-0 ${mobileTab === "players" ? "flex flex-1" : "hidden"} lg:hidden`}>
            <Scoreboard />
          </div>
          <div className={`min-w-0 flex-col min-h-0 ${mobileTab === "chat" ? "flex flex-1" : "hidden"} lg:hidden`}>
            <Chat />
          </div>
        </div>
      </div>

      <div className="lg:hidden flex border-t border-zinc-800 bg-zinc-900/95 backdrop-blur-sm">
        {[
          { key: "problem", label: "Problem" },
          { key: "editor", label: "Editor" },
          { key: "players", label: "Score" },
          { key: "chat", label: "Chat" },
        ]
          .filter((t) => !isSpectator || t.key !== "editor")
          .map((t) => (
            <button
              key={t.key}
              onClick={() => setMobileTab(t.key as "problem" | "editor" | "players" | "chat")}
              className={`flex-1 py-2.5 text-xs font-medium uppercase tracking-wide transition-colors ${
                mobileTab === t.key
                  ? "text-white border-b-2 border-zinc-300 bg-white/10"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {t.label}
            </button>
          ))}
      </div>

      {status === "finished" && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full mx-4 space-y-6">
            <h2 className="text-2xl font-bold text-white text-center">Game Over</h2>
            <div className="space-y-2">
              {[...players].sort((a, b) => b.score - a.score).map((p, i) => (
                <div key={p.userId} className={`flex items-center gap-3 p-3 rounded-lg ${
                  p.userId === myUserId ? "bg-zinc-700/40 border border-zinc-600/50" : "bg-zinc-800/50"
                }`}>
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? "bg-yellow-500 text-black" :
                    i === 1 ? "bg-zinc-400 text-black" :
                    i === 2 ? "bg-amber-700 text-white" :
                    "bg-zinc-700 text-zinc-400"
                  }`}>{i + 1}</span>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="flex-1 text-white font-medium">{p.name} {p.userId === myUserId && "(You)"}</span>
                  <span className="text-zinc-400 text-sm font-mono">{p.score} pts</span>
                  {p.solved && <span className="text-green-400 text-xs">Solved</span>}
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={leaveRoom} className="flex-1 py-2.5 bg-white hover:bg-zinc-200 text-zinc-950 rounded-lg font-medium transition-all">
                Play Again
              </button>
              <button onClick={() => { getSocket().emit("leave-room", { roomId }); reset(); router.push("/"); }} className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-all">
                Home
              </button>
            </div>
          </div>
        </div>
      )}

      {(flash || scoreFlash) && status === "playing" && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 bg-white text-zinc-950 text-sm font-semibold px-5 py-2 rounded-full shadow-2xl shadow-black/50">
          {flash || scoreFlash}
        </div>
      )}

      {testResults && status !== "finished" && (
        <div className="absolute left-3 right-3 sm:left-auto sm:right-4 sm:w-96 bottom-16 lg:bottom-4 bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-2xl max-h-80 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-white">Test Results</h4>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              testResults.every((r) => r.passed) ? "bg-green-900/50 text-green-400" : "bg-red-900/50 text-red-400"
            }`}>
              {testResults.filter((r) => r.passed).length}/{testResults.length} passed
            </span>
          </div>
          {testResults.every((r) => r.passed) ? (
            <div className="text-xs p-3 rounded bg-green-900/20 text-green-300 flex items-center gap-2">
              <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              All {testResults.length} tests passed — you solved it!
            </div>
          ) : (
            <div className="space-y-2">
              {testResults.map((r, i) => (
                r.passed ? (
                  <div key={i} className="text-[11px] px-2 py-1 rounded bg-green-900/10 text-green-400/70 flex items-center gap-1.5">
                    <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Test {i + 1} passed
                  </div>
                ) : (
                  <div key={i} className="text-xs p-2 rounded bg-red-900/20 text-red-300">
                    <div className="flex items-center gap-1.5 mb-1">
                      <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      <span className="font-medium">Test {i + 1} failed</span>
                    </div>
                    <div className="space-y-0.5 ml-5">
                      <div>Input: <span className="font-mono text-white/70">{r.input}</span></div>
                      <div>Expected: <span className="font-mono text-white/70">{r.expected}</span></div>
                      <div>Got: <span className="font-mono text-white/70">{r.actual}</span></div>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
