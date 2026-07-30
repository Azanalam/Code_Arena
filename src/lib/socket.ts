"use client";

import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useGameStore } from "@/store/gameStore";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3001", {
      autoConnect: false,
    });
  }
  return socket;
}

export function useSocket(roomId: string) {
  const {
    setPlayers,
    setProblem,
    setStatus,
    setTimeRemaining,
    addChatMessage,
    addPlayer,
    removePlayer,
    updatePlayerScore,
  } = useGameStore();

  useEffect(() => {
    const s = getSocket();

    if (!s.connected) {
      s.connect();
    }

    s.emit("join-room", { roomId });

    s.on("room-state", (state) => {
      setPlayers(state.players);
      setProblem(state.problem);
      setStatus(state.status);
      setTimeRemaining(state.timeRemaining);
    });

    s.on("player-joined", (player) => addPlayer(player));
    s.on("player-left", (userId) => removePlayer(userId));
    s.on("score-update", ({ userId, score }) => updatePlayerScore(userId, score));
    s.on("game-start", ({ problem, timeLimit }) => {
      setProblem(problem);
      setStatus("playing");
      setTimeRemaining(timeLimit);
    });
    s.on("timer-tick", (time) => setTimeRemaining(time));
    s.on("game-over", ({ players }) => {
      setPlayers(players);
      setStatus("finished");
    });
    s.on("chat-message", (msg) => addChatMessage(msg));
    s.on("ai-hint", (hint) => addChatMessage({ userId: "ai", name: "AI Mentor", text: hint }));

    return () => {
      s.off("room-state");
      s.off("player-joined");
      s.off("player-left");
      s.off("score-update");
      s.off("game-start");
      s.off("timer-tick");
      s.off("game-over");
      s.off("chat-message");
      s.off("ai-hint");
    };
  }, [roomId]);

  return { socket: getSocket() };
}
