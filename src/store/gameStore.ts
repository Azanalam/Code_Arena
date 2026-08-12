import { create } from "zustand";
import type { PlayerState, ProblemData } from "@/lib/gameLogic";
import { getPlayerId } from "@/lib/gameLogic";

export interface ChatMessage {
  userId: string;
  name: string;
  text: string;
  timestamp?: number;
}

export interface TestResult {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
}

interface GameStore {
  roomId: string | null;
  players: PlayerState[];
  problem: ProblemData | null;
  status: "waiting" | "countdown" | "playing" | "review" | "finished";
  timeRemaining: number;
  code: string;
  chatMessages: ChatMessage[];
  myUserId: string | null;
  myName: string;
  testResults: TestResult[] | null;
  submitting: boolean;
  connecting: boolean;
  countdown: number;
  language: string;

  setRoomId: (id: string) => void;
  setPlayers: (players: PlayerState[]) => void;
  setProblem: (problem: ProblemData | null) => void;
  setStatus: (status: GameStore["status"]) => void;
  setTimeRemaining: (time: number) => void;
  setCode: (code: string) => void;
  setMyUserId: (id: string) => void;
  setMyName: (name: string) => void;
  setTestResults: (results: TestResult[] | null) => void;
  setSubmitting: (v: boolean) => void;
  setConnecting: (v: boolean) => void;
  setCountdown: (count: number) => void;
  setLanguage: (language: string) => void;

  addPlayer: (player: PlayerState) => void;
  removePlayer: (userId: string) => void;
  updatePlayerScore: (userId: string, score: number) => void;
  updatePlayerSolved: (userId: string, solved: boolean) => void;
  addChatMessage: (msg: ChatMessage) => void;
  reset: () => void;
}

const initialState = {
  roomId: null,
  players: [],
  problem: null,
  status: "waiting" as const,
  timeRemaining: 0,
  code: "",
  chatMessages: [],
  myUserId: getPlayerId() || null,
  myName: "",
  testResults: null,
  submitting: false,
  connecting: true,
  countdown: 0,
  language: "javascript",
};

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,

  setRoomId: (roomId) =>
    set(() => {
      let code = "";
      if (typeof window !== "undefined") {
        const saved = window.localStorage.getItem(`codearena_code_${roomId}`);
        if (saved !== null) code = saved;
      }
      return { roomId, code };
    }),
  setPlayers: (players) => set({ players }),
  setProblem: (problem) => set({ problem }),
  setStatus: (status) => set({ status }),
  setTimeRemaining: (timeRemaining) => set({ timeRemaining }),
  setCode: (code) =>
    set((state) => {
      if (typeof window !== "undefined" && state.roomId) {
        window.localStorage.setItem(`codearena_code_${state.roomId}`, code);
      }
      return { code };
    }),
  setMyUserId: (myUserId) => set({ myUserId }),
  setMyName: (myName) => set({ myName }),
  setTestResults: (testResults) => set({ testResults }),
  setSubmitting: (submitting) => set({ submitting }),
  setConnecting: (connecting) => set({ connecting }),
  setCountdown: (countdown) => set({ countdown }),
  setLanguage: (language) => set({ language }),

  addPlayer: (player) =>
    set((state) => ({
      players: state.players.some((p) => p.userId === player.userId)
        ? state.players
        : [...state.players, player],
    })),
  removePlayer: (userId) =>
    set((state) => ({
      players: state.players.filter((p) => p.userId !== userId),
    })),
  updatePlayerScore: (userId, score) =>
    set((state) => ({
      players: state.players.map((p) =>
        p.userId === userId ? { ...p, score } : p
      ),
    })),
  updatePlayerSolved: (userId, solved) =>
    set((state) => ({
      players: state.players.map((p) =>
        p.userId === userId ? { ...p, solved } : p
      ),
    })),
  addChatMessage: (msg) =>
    set((state) => ({
      chatMessages: [...state.chatMessages, { ...msg, timestamp: Date.now() }],
    })),
  reset: () =>
    set((state) => {
      if (typeof window !== "undefined" && state.roomId) {
        window.localStorage.removeItem(`codearena_code_${state.roomId}`);
      }
      return { ...initialState, myUserId: getPlayerId() || null };
    }),
}));
