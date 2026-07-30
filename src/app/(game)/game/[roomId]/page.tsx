"use client";

import { use } from "react";
import { useSocket } from "@/lib/socket";
import { useGameStore } from "@/store/gameStore";
import { Editor } from "@/components/Editor";
import { Chat } from "@/components/Chat";
import { Scoreboard } from "@/components/Scoreboard";
import { ProblemPanel } from "@/components/ProblemPanel";
import { AiHint } from "@/components/AiHint";

export default function GamePage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  useSocket(roomId);

  const { code, setCode, status, problem, myUserId, players } = useGameStore();
  const isHost = players[0]?.userId === myUserId;

  const handleSubmit = () => {
    const { getSocket } = require("@/lib/socket");
    getSocket().emit("submit-code", { roomId, code });
  };

  const handleStartGame = () => {
    const { getSocket } = require("@/lib/socket");
    getSocket().emit("start-game", { roomId });
  };

  return (
    <div className="h-screen bg-black flex flex-col">
      <header className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <span className="text-white font-bold">
            Code<span className="text-blue-500">Arena</span>
          </span>
          <span className="text-zinc-600 text-sm">|</span>
          <span className="text-zinc-400 text-sm font-mono">{roomId}</span>
          <span className={`text-xs px-2 py-0.5 rounded font-medium ${
            status === "waiting" ? "bg-yellow-900 text-yellow-400" :
            status === "playing" ? "bg-green-900 text-green-400" :
            "bg-zinc-800 text-zinc-400"
          }`}>
            {status}
          </span>
          {status === "waiting" && isHost && (
            <button
              onClick={handleStartGame}
              className="text-xs px-3 py-1 bg-green-700 hover:bg-green-600 text-white rounded font-medium transition-colors"
            >
              Start Game
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <AiHint />
          {status === "playing" && (
            <button
              onClick={handleSubmit}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded transition-colors"
            >
              Submit
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 flex gap-2 p-2 overflow-hidden">
        <div className="w-72 flex-shrink-0 flex flex-col gap-2">
          <div className="flex-1 min-h-0">
            <Scoreboard />
          </div>
          <div className="flex-1 min-h-0">
            <Chat />
          </div>
        </div>

        <div className="flex-1 min-w-0 flex gap-2">
          <div className="w-1/2 min-w-0">
            <ProblemPanel />
          </div>
          <div className="w-1/2 min-w-0 rounded-lg overflow-hidden">
            <Editor
              value={code}
              onChange={setCode}
              language="javascript"
              readOnly={status !== "playing"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
