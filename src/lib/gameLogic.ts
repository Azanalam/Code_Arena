export type Difficulty = "easy" | "medium" | "hard";

export interface TestCase {
  input: string;
  expected: string;
}

export interface ProblemData {
  id: string;
  title: string;
  difficulty: Difficulty;
  category: string;
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  testCases: TestCase[];
  starterCode: string;
  languages?: string[];
  starterCodes?: Record<string, string> | null;
}

export interface GameState {
  roomId: string;
  players: PlayerState[];
  problem: ProblemData | null;
  status: "waiting" | "playing" | "review" | "finished";
  timeRemaining: number;
  startedAt: number | null;
}

export interface PlayerState {
  userId: string;
  name: string;
  image: string | null;
  score: number;
  solved: boolean;
  color: string;
}

const PLAYER_COLORS = [
  "#ef4444", "#3b82f6", "#22c55e", "#eab308",
  "#a855f7", "#ec4899", "#14b8a6", "#f97316",
];

export function assignPlayerColors(count: number): string[] {
  return PLAYER_COLORS.slice(0, count);
}

export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function getPlayerId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem("codearena_player_id");
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem("codearena_player_id", id);
  }
  return id;
}

export function calculateScore(
  timeSpent: number,
  totalTime: number,
  difficulty: Difficulty
): number {
  const base = difficulty === "easy" ? 100 : difficulty === "medium" ? 250 : 500;
  const timeBonus = Math.max(0, Math.floor((1 - timeSpent / totalTime) * base));
  return base + timeBonus;
}
