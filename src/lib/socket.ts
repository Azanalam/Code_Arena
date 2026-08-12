"use client";

import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useGameStore, type ChatMessage, type TestResult } from "@/store/gameStore";
import { getPlayerId, type PlayerState, type ProblemData } from "@/lib/gameLogic";
import { playPass, playFail, playGameOver } from "./sounds";

let socket: Socket | null = null;

interface RoomStatePayload {
  players: PlayerState[];
  problem: ProblemData | null;
  status: "waiting" | "countdown" | "playing" | "review" | "finished";
  timeRemaining: number;
  userId?: string;
  reconnected?: boolean;
}

interface TestResultsPayload {
  results: TestResult[];
  passed: boolean;
}

interface GameStartPayload {
  problem: ProblemData;
  timeLimit: number;
}

interface GameOverPayload {
  players: PlayerState[];
}

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
    setConnecting, setTestResults, setSubmitting,
    setCode, setCountdown, setMyUserId, setLanguage,
  } = useGameStore();

  useEffect(() => {
    const s = getSocket();

    const resolvePlayerId = () => useGameStore.getState().myUserId ?? getPlayerId();

    const handleConnect = () => {
      setConnecting(false);
      s.emit("join-room", { roomId, userId: resolvePlayerId() });
    };

    const handleRoomState = (state: RoomStatePayload) => {
      setPlayers(state.players);
      setProblem(state.problem);
      setStatus(state.status);
      setTimeRemaining(state.timeRemaining);
      setCountdown(0);
      setConnecting(false);
      if (state.userId) setMyUserId(state.userId);
      if (state.problem?.languages?.length) {
        const langs = state.problem.languages;
        const current = useGameStore.getState().language;
        if (!langs.includes(current)) setLanguage(langs[0]);
      }
    };

    const handleTestResults = (results: TestResultsPayload) => {
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
    s.on("player-joined", (player: PlayerState) => addPlayer(player));
    s.on("player-left", (userId: string) => removePlayer(userId));
    s.on("score-update", ({ userId, score }: { userId: string; score: number }) => updatePlayerScore(userId, score));
    s.on("countdown", ({ count }: { count: number }) => {
      setCountdown(count);
      setStatus("countdown");
    });
    s.on("game-start", ({ problem, timeLimit }: GameStartPayload) => {
      setProblem(problem);
      setStatus("playing");
      setTimeRemaining(timeLimit);
      setCountdown(0);
      const langs = problem?.languages?.length ? problem.languages : [problem?.category ?? "javascript"];
      const current = useGameStore.getState().language;
      const next = langs.includes(current) ? current : langs[0];
      if (next !== current) setLanguage(next);
      const starter =
        problem?.starterCodes?.[next] ??
        problem?.starterCodes?.[langs[0]] ??
        problem?.starterCode;
      if (starter) setCode(starter);
    });
    s.on("timer-tick", (time: number) => setTimeRemaining(time));
    s.on("game-over", ({ players }: GameOverPayload) => {
      setPlayers(players);
      setStatus("finished");
      playGameOver();
    });
    s.on("chat-message", (msg: ChatMessage) => addChatMessage(msg));
    s.on("ai-hint", (hint: string) => addChatMessage({ userId: "ai", name: "AI Mentor", text: hint }));
    s.on("test-results", handleTestResults);

    if (s.connected) {
      setConnecting(false);
      s.emit("join-room", { roomId, userId: resolvePlayerId() });
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
  }, [
    roomId,
    setPlayers,
    setProblem,
    setStatus,
    setTimeRemaining,
    setCountdown,
    setConnecting,
    setMyUserId,
    setCode,
    setSubmitting,
    setTestResults,
    setLanguage,
    addChatMessage,
    addPlayer,
    removePlayer,
    updatePlayerScore,
  ]);

  return { socket: getSocket() };
}
