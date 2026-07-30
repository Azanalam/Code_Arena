"use client";

import { use, useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSocket } from "@/lib/socket";
import { useGameStore } from "@/store/gameStore";
import { Editor } from "@/components/Editor";
import { Chat } from "@/components/Chat";
import { Scoreboard } from "@/components/Scoreboard";
import { ProblemPanel } from "@/components/ProblemPanel";
import { AiHint } from "@/components/AiHint";
import { getSocket } from "@/lib/socket";
import { playSubmit } from "@/lib/sounds";

export default function GamePage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const searchParams = useSearchParams();
  const isSpectator = searchParams.get("spectator") === "1";
  useSocket(roomId);

  const router = useRouter();
  const {
    code, setCode, status, problem, myUserId, players, myName,
    connecting, testResults, submitting, setSubmitting, reset,
  } = useGameStore();
  const isHost = players[0]?.userId === myUserId;
  const [copied, setCopied] = useState(false);
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");

  const handleSubmit = useCallback(() => {
    setSubmitting(true);
    playSubmit();
    getSocket().emit("submit-code", { roomId, code });
  }, [roomId, code, setSubmitting]);

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
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-zinc-400 text-sm">Connecting to game...</p>
        </div>
      </div>
    );
  }

  const roomCode = roomId.split("-")[0];

  return (
    <div className="h-screen bg-black flex flex-col">
      <header className="flex items-center justify-between px-4 py-2 bg-zinc-900/80 border-b border-zinc-800 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => { reset(); router.push("/lobby"); }} className="text-zinc-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="text-white font-bold text-lg">
            Code<span className="text-blue-500">Arena</span>
          </span>
          <span className="text-zinc-700">|</span>
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
            status === "playing" ? "bg-green-900/50 text-green-400 border border-green-700/50 animate-pulse" :
            "bg-zinc-800 text-zinc-400 border border-zinc-700"
          }`}>
            {status === "waiting" ? "Waiting" : status === "playing" ? "Live" : "Finished"}
          </span>
          {status === "waiting" && isHost && players.length >= 1 && (
            <>
              <span className="text-zinc-500 text-xs ml-2">Type:</span>
              {["all", "javascript", "html", "css"].map((c) => (
                <button key={c} onClick={() => setCategory(c)} className={`text-xs px-2 py-1 rounded font-medium transition-all capitalize ${
                  category === c
                    ? "bg-blue-700 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:text-white"
                }`}>
                  {c === "all" ? "All" : c === "javascript" ? "JS" : c.toUpperCase()}
                </button>
              ))}
              <span className="text-zinc-500 text-xs ml-2">Diff:</span>
              {["all", "easy", "medium"].map((d) => (
                <button key={d} onClick={() => setDifficulty(d)} className={`text-xs px-2 py-1 rounded font-medium transition-all capitalize ${
                  difficulty === d
                    ? "bg-blue-700 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:text-white"
                }`}>
                  {d === "all" ? "All" : d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
              <button onClick={handleStartGame} className="text-xs px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white rounded-md font-medium transition-all">
                Start Game
              </button>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
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
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-sm font-medium rounded-md transition-all"
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

      <div className="flex-1 flex flex-col lg:flex-row gap-2 p-2 overflow-hidden">
        <div className="hidden lg:flex w-72 flex-shrink-0 flex-col gap-2">
          <div className="flex-1 min-h-0">
            <Scoreboard />
          </div>
          <div className="flex-[2] min-h-0">
            <Chat />
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col lg:flex-row gap-2">
          <div className={isSpectator ? "w-full" : "w-full lg:w-1/2 min-w-0"}>
            <ProblemPanel />
          </div>
          {!isSpectator && (
            <div className="w-full lg:w-1/2 min-w-0 h-64 lg:h-auto rounded-lg overflow-hidden border border-zinc-800">
              <Editor value={code} onChange={setCode} language="javascript" readOnly={status !== "playing"} />
            </div>
          )}
        </div>
      </div>

      {status === "finished" && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full mx-4 space-y-6">
            <h2 className="text-2xl font-bold text-white text-center">Game Over</h2>
            <div className="space-y-2">
              {[...players].sort((a, b) => b.score - a.score).map((p, i) => (
                <div key={p.userId} className={`flex items-center gap-3 p-3 rounded-lg ${
                  p.userId === myUserId ? "bg-blue-900/30 border border-blue-800/50" : "bg-zinc-800/50"
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
              <button onClick={() => { reset(); router.push("/lobby"); }} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all">
                Play Again
              </button>
              <button onClick={() => { reset(); router.push("/"); }} className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-all">
                Home
              </button>
            </div>
          </div>
        </div>
      )}

      {testResults && status !== "finished" && (
        <div className="absolute bottom-4 right-4 w-96 bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-2xl max-h-80 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-white">Test Results</h4>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              testResults.every((r) => r.passed) ? "bg-green-900/50 text-green-400" : "bg-red-900/50 text-red-400"
            }`}>
              {testResults.filter((r) => r.passed).length}/{testResults.length} passed
            </span>
          </div>
          <div className="space-y-2">
            {testResults.map((r, i) => (
              <div key={i} className={`text-xs p-2 rounded ${
                r.passed ? "bg-green-900/20 text-green-300" : "bg-red-900/20 text-red-300"
              }`}>
                <div className="flex items-center gap-1.5 mb-1">
                  {r.passed ? (
                    <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  )}
                  <span className="font-medium">Test {i + 1}</span>
                </div>
                {!r.passed && (
                  <div className="space-y-0.5 ml-5">
                    <div>Expected: <span className="font-mono text-white/70">{r.expected}</span></div>
                    <div>Got: <span className="font-mono text-white/70">{r.actual}</span></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
