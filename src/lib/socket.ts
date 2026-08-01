"use client";

import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useGameStore } from "@/store/gameStore";
import { playPass, playFail, playSubmit, playGameOver } from "./sounds";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const url = process.env.NEXT_PUBLIC_SOCKET_URL;
    socket = url ? io(url, { autoConnect: false }) : io({ autoConnect: false });
  }
  return socket;
}

export function useSocket(roomId: string) {
  const {
    setPlayers, setProblem, setStatus, setTimeRemaining,
    addChatMessage, addPlayer, removePlayer, updatePlayerScore,
    setConnecting, setTestResults, setSubmitting, updatePlayerSolved,
    setCode, setCountdown,
  } = useGameStore();

  useEffect(() => {
    const s = getSocket();

    const handleConnect = () => {
      setConnecting(false);
      s.emit("join-room", { roomId });
    };

    const handleRoomState = (state: any) => {
      setPlayers(state.players);
      setProblem(state.problem);
      setStatus(state.status);
      setTimeRemaining(state.timeRemaining);
      setCountdown(0);
      setConnecting(false);
    };

    const handleTestResults = (results: any) => {
      setTestResults(results.results);
      setSubmitting(false);
      if (results.passed) {
        playPass();
        addChatMessage({ userId: "system", name: "System", text: "All tests passed!" });
      } else {
        playFail();
      }
    };

    s.on("connect", handleConnect);
    s.on("disconnect", () => setConnecting(true));
    s.on("room-state", handleRoomState);
    s.on("player-joined", (player) => addPlayer(player));
    s.on("player-left", (userId) => removePlayer(userId));
    s.on("score-update", ({ userId, score }) => updatePlayerScore(userId, score));
    s.on("countdown", ({ count }) => {
      setCountdown(count);
      setStatus("countdown");
    });
    s.on("game-start", ({ problem, timeLimit }) => {
      setProblem(problem);
      setStatus("playing");
      setTimeRemaining(timeLimit);
      setCountdown(0);
      if (problem?.starterCode) setCode(problem.starterCode);
    });
    s.on("timer-tick", (time) => setTimeRemaining(time));
    s.on("game-over", ({ players }) => {
      setPlayers(players);
      setStatus("finished");
      playGameOver();
    });
    s.on("chat-message", (msg) => addChatMessage(msg));
    s.on("ai-hint", (hint) => addChatMessage({ userId: "ai", name: "AI Mentor", text: hint }));
    s.on("test-results", handleTestResults);

    if (s.connected) {
      setConnecting(false);
      s.emit("join-room", { roomId });
    } else {
      s.connect();
    }

    return () => {
      s.off("connect", handleConnect);
      s.off("disconnect");
      s.off("room-state", handleRoomState);
      s.off("player-joined");
      s.off("player-left");
      s.off("score-update");
      s.off("countdown");
      s.off("game-start");
      s.off("timer-tick");
      s.off("game-over");
      s.off("chat-message");
      s.off("ai-hint");
      s.off("test-results", handleTestResults);
    };
  }, [roomId]);

  return { socket: getSocket() };
}
