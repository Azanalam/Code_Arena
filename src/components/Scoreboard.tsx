"use client";

import { useGameStore } from "@/store/gameStore";

export function Scoreboard() {
  const { players, timeRemaining, status } = useGameStore();

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  const sorted = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="bg-zinc-900 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-400">Scoreboard</h3>
        {status === "playing" && (
          <span className={`text-sm font-mono ${timeRemaining < 60 ? "text-red-400" : "text-zinc-300"}`}>
            {minutes}:{seconds.toString().padStart(2, "0")}
          </span>
        )}
      </div>
      <div className="space-y-2">
        {sorted.map((player, i) => (
          <div key={player.userId} className="flex items-center gap-2 text-sm">
            <span className="w-5 text-zinc-500 font-mono">{i + 1}.</span>
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: player.color }}
            />
            <span className={`flex-1 truncate ${player.solved ? "text-green-400" : "text-zinc-300"}`}>
              {player.name}
            </span>
            <span className="font-mono text-zinc-400">{player.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
