import { create } from "zustand";
import type { PlayerState, ProblemData } from "@/lib/gameLogic";

export interface ChatMessage {
  userId: string;
  name: string;
  text: string;
  timestamp?: number;
}

interface GameStore {
  roomId: string | null;
  players: PlayerState[];
  problem: ProblemData | null;
  status: "waiting" | "playing" | "review" | "finished";
  timeRemaining: number;
  code: string;
  chatMessages: ChatMessage[];
  myUserId: string | null;

  setRoomId: (id: string) => void;
  setPlayers: (players: PlayerState[]) => void;
  setProblem: (problem: ProblemData | null) => void;
  setStatus: (status: GameStore["status"]) => void;
  setTimeRemaining: (time: number) => void;
  setCode: (code: string) => void;
  setMyUserId: (id: string) => void;

  addPlayer: (player: PlayerState) => void;
  removePlayer: (userId: string) => void;
  updatePlayerScore: (userId: string, score: number) => void;
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
  myUserId: null,
};

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,

  setRoomId: (roomId) => set({ roomId }),
  setPlayers: (players) => set({ players }),
  setProblem: (problem) => set({ problem }),
  setStatus: (status) => set({ status }),
  setTimeRemaining: (timeRemaining) => set({ timeRemaining }),
  setCode: (code) => set({ code }),
  setMyUserId: (myUserId) => set({ myUserId }),

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
  addChatMessage: (msg) =>
    set((state) => ({
      chatMessages: [...state.chatMessages, { ...msg, timestamp: Date.now() }],
    })),
  reset: () => set(initialState),
}));
