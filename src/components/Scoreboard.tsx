"use client";

import { useGameStore } from "@/store/gameStore";

export function Scoreboard() {
  const { players, timeRemaining, status, myUserId } = useGameStore();

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const sorted = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-3 space-y-3 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Players</h3>
        {status === "playing" && (
          <span className={`text-sm font-mono font-bold tabular-nums ${timeRemaining < 30 ? "text-red-400 animate-pulse" : timeRemaining < 60 ? "text-yellow-400" : "text-zinc-300"}`}>
            {minutes}:{seconds.toString().padStart(2, "0")}
          </span>
        )}
      </div>
      <div className="flex-1 space-y-1.5 overflow-y-auto">
        {sorted.map((player, i) => (
          <div
            key={player.userId}
            className={`flex items-center gap-2 text-sm p-1.5 rounded ${
              player.userId === myUserId ? "bg-blue-900/20" : ""
            }`}
          >
            <span className="w-4 text-xs text-zinc-600 font-mono text-right">{i + 1}</span>
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: player.color }} />
            <span className={`flex-1 truncate text-sm ${
              player.userId === myUserId ? "text-blue-300" : "text-zinc-300"
            }`}>
              {player.name}
            </span>
            <span className="text-xs font-mono text-zinc-500">{player.score}</span>
            {player.solved && (
              <svg className="w-3.5 h-3.5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        ))}
        {sorted.length === 0 && (
          <p className="text-zinc-600 text-xs text-center py-4">Waiting for players...</p>
        )}
      </div>
    </div>
  );
}
