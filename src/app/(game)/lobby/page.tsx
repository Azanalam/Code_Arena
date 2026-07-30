"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { getSocket } from "@/lib/socket";
import { useGameStore } from "@/store/gameStore";
import { generateRoomCode } from "@/lib/gameLogic";

export default function LobbyPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { setRoomId, setMyUserId, setMyName, myName } = useGameStore();
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(myName || "");

  const getPlayerName = () => name.trim() || `Player_${Math.random().toString(36).slice(2, 6)}`;

  const createRoom = () => {
    if (!name.trim()) return;
    setLoading(true);
    const socket = getSocket();
    if (!socket.connected) socket.connect();

    const code = generateRoomCode();
    const playerName = getPlayerName();
    socket.emit("create-room", { code, name: playerName }, (response: { roomId: string; userId: string }) => {
      setRoomId(response.roomId);
      setMyUserId(response.userId);
      setMyName(playerName);
      router.push(`/game/${response.roomId}`);
    });
  };

  const joinRoom = () => {
    if (!joinCode.trim() || !name.trim()) return;
    setLoading(true);
    const socket = getSocket();
    if (!socket.connected) socket.connect();

    const playerName = getPlayerName();
    socket.emit(
      "join-room",
      { code: joinCode.trim().toUpperCase(), name: playerName },
      (response: { roomId: string; userId: string } | { error: string }) => {
        if ("error" in response) {
          setError(response.error);
          setLoading(false);
          return;
        }
        setRoomId(response.roomId);
        setMyUserId(response.userId);
        setMyName(playerName);
        router.push(`/game/${response.roomId}`);
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">
            Code<span className="text-blue-500">Arena</span>
          </h1>
          <p className="text-zinc-500 text-sm">Create or join a coding battle</p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-5">
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Your Name</label>
            <input
              className="w-full bg-zinc-800 text-white rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Enter your name"
              maxLength={20}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <button
            onClick={createRoom}
            disabled={loading || !name.trim()}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-lg font-medium transition-all"
          >
            {loading ? "Creating..." : "Create New Room"}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-zinc-900/50 text-zinc-600">or join existing</span>
            </div>
          </div>

          <div className="space-y-3">
            <input
              className="w-full bg-zinc-800 text-white rounded-lg px-4 py-2.5 text-center text-lg font-mono tracking-widest uppercase outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ROOM CODE"
              maxLength={6}
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && joinRoom()}
            />
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button
              onClick={joinRoom}
              disabled={loading || !joinCode.trim() || !name.trim()}
              className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white rounded-lg font-medium transition-all"
            >
              Join Room
            </button>
            <button
              onClick={() => {
                if (!joinCode.trim()) return;
                setLoading(true);
                const socket = getSocket();
                if (!socket.connected) socket.connect();
                socket.emit("spectate-room", { roomId: joinCode.trim().toUpperCase() }, (res: { roomId: string } | { error: string }) => {
                  if ("error" in res) {
                    setError(res.error);
                    setLoading(false);
                    return;
                  }
                  setRoomId(res.roomId);
                  router.push(`/game/${res.roomId}?spectator=1`);
                });
              }}
              disabled={loading || !joinCode.trim()}
              className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-zinc-500 hover:text-zinc-300 text-sm rounded-lg font-medium transition-all border border-zinc-800"
            >
              Spectate
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button onClick={() => router.push("/problems")} className="text-sm text-zinc-600 hover:text-blue-400 transition-colors">
            Problems
          </button>
          <span className="text-zinc-800 text-xs">|</span>
          <button onClick={() => router.push("/leaderboard")} className="text-sm text-zinc-600 hover:text-blue-400 transition-colors">
            Leaderboard
          </button>
        </div>

        <div className="text-center pt-4 border-t border-zinc-800">
          {session?.user ? (
            <div className="flex items-center justify-center gap-3">
              {session.user.image && (
                <img src={session.user.image} alt="" className="w-6 h-6 rounded-full ring-1 ring-zinc-700" />
              )}
              <span className="text-zinc-400 text-sm">{session.user.name}</span>
              <button onClick={() => signOut()} className="text-xs text-zinc-600 hover:text-red-400 transition-colors">
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => signIn("github", { redirectTo: "/lobby" })} className="text-xs px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-md text-zinc-400 hover:text-white transition-all">
                GitHub
              </button>
              <button onClick={() => signIn("google", { redirectTo: "/lobby" })} className="text-xs px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-md text-zinc-400 hover:text-white transition-all">
                Google
              </button>
              <span className="text-zinc-700 text-xs">Sign in to save scores</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
