"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket";
import { useGameStore } from "@/store/gameStore";
import { generateRoomCode } from "@/lib/gameLogic";

export default function LobbyPage() {
  const router = useRouter();
  const { setRoomId, setMyUserId } = useGameStore();
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");

  const createRoom = () => {
    const socket = getSocket();
    if (!socket.connected) socket.connect();

    const code = generateRoomCode();
    socket.emit("create-room", { code }, (response: { roomId: string; userId: string }) => {
      setRoomId(response.roomId);
      setMyUserId(response.userId);
      router.push(`/game/${response.roomId}`);
    });
  };

  const joinRoom = () => {
    if (!joinCode.trim()) return;
    const socket = getSocket();
    if (!socket.connected) socket.connect();

    socket.emit("join-room", { code: joinCode.trim().toUpperCase() }, (response: { roomId: string; userId: string } | { error: string }) => {
      if ("error" in response) {
        setError(response.error);
        return;
      }
      setRoomId(response.roomId);
      setMyUserId(response.userId);
      router.push(`/game/${response.roomId}`);
    });
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <h1 className="text-3xl font-bold text-white text-center">Lobby</h1>

        <button
          onClick={createRoom}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
        >
          Create New Room
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-black text-zinc-500">or</span>
          </div>
        </div>

        <div className="space-y-3">
          <input
            className="w-full bg-zinc-900 text-white rounded-lg px-4 py-3 text-center text-lg font-mono tracking-widest uppercase outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter room code"
            maxLength={6}
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && joinRoom()}
          />
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button
            onClick={joinRoom}
            className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors"
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
}
