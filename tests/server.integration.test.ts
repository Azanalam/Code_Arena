import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawn, type ChildProcess } from "node:child_process";
import path from "node:path";
import "dotenv/config";
import { io, type Socket } from "socket.io-client";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const PORT = 3211;
const BASE = `http://localhost:${PORT}`;
const ROOM_CODE = `E${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
const TEST_CATEGORY = `e2e-cat-${Date.now()}`;
const CORRECT_CODE = "function main(...nums) { return nums.reduce((a, b) => a + b, 0); }";
const WRONG_CODE = "function main(nums) { return 42; }";
const DB_AVAILABLE = !!process.env.DATABASE_URL;

let server: ChildProcess;
let prisma: PrismaClient;
const sockets: Socket[] = [];
const createdRoomIds: string[] = [];

function connect(): Promise<Socket> {
  return new Promise((resolve, reject) => {
    const s = io(BASE, { transports: ["websocket"], forceNew: true, reconnection: false });
    sockets.push(s);
    const timer = setTimeout(() => {
      s.close();
      reject(new Error("connect timeout"));
    }, 10_000);
    s.on("connect", () => {
      clearTimeout(timer);
      resolve(s);
    });
    s.on("connect_error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

function eventOnce<T>(socket: Socket, event: string, timeoutMs = 15_000): Promise<T> {
  return new Promise((resolve, reject) => {
    const handler = (payload: T) => {
      clearTimeout(timer);
      socket.off(event, handler as never);
      resolve(payload);
    };
    const timer = setTimeout(() => {
      socket.off(event, handler as never);
      reject(new Error(`timeout waiting for "${event}"`));
    }, timeoutMs);
    socket.on(event, handler as never);
  });
}

function emitAck<T = unknown>(socket: Socket, event: string, payload: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    socket.timeout(10_000).emit(event, payload, (err: Error | null, res: T) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
}

async function waitForServer(maxMs = 30_000): Promise<void> {
  const deadline = Date.now() + maxMs;
  while (Date.now() < deadline) {
    try {
      const s = await connect();
      s.close();
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw new Error("server did not start in time");
}

before(async () => {
  if (!DB_AVAILABLE) return;
  prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  server = spawn(process.execPath, ["--import", "tsx", "server.ts"], {
    cwd: path.resolve(__dirname, ".."),
    env: { ...process.env, PORT: String(PORT), NODE_ENV: "test" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  server.stdout?.on("data", () => {});
  server.stderr?.on("data", () => {});

  await waitForServer();
});

after(async () => {
  if (!DB_AVAILABLE) return;
  for (const s of sockets) s.close();
  if (prisma) {
    await prisma.problem
      .deleteMany({ where: { category: TEST_CATEGORY } })
      .catch(() => {});
    await prisma.leaderboardEntry
      .deleteMany({ where: { roomId: { in: createdRoomIds } } })
      .catch(() => {});
    await prisma.$disconnect().catch(() => {});
  }
  if (server) server.kill();
});

describe("socket server flow", { skip: !DB_AVAILABLE }, () => {
  it("creates a room, joins it, chats, gets hints, and spectates", async () => {
    const host = await connect();
    const stateP = eventOnce<{ players: unknown[]; status: string }>(host, "room-state");
    const { roomId } = await emitAck<{ roomId: string }>(host, "create-room", {
      code: ROOM_CODE,
      name: "Alice",
      userId: "alice-e2e",
    });
    assert.ok(roomId);
    createdRoomIds.push(roomId);

    const state = await stateP;
    assert.equal(state.status, "waiting");
    assert.equal(state.players.length, 1);

    const guest = await connect();
    const joinStateP = eventOnce<{ players: unknown[] }>(guest, "room-state");
    const joinedBroadcastP = eventOnce<{ name: string }>(host, "player-joined");
    const { roomId: joinedRoom } = await emitAck<{ roomId: string }>(guest, "join-room", {
      code: ROOM_CODE,
      name: "Bob",
      userId: "bob-e2e",
    });
    assert.equal(joinedRoom, roomId);
    const joinState = await joinStateP;
    assert.equal(joinState.players.length, 2);
    const joined = await joinedBroadcastP;
    assert.equal(joined.name, "Bob");

    const chatP = eventOnce<{ userId: string; name: string; text: string }>(host, "chat-message");
    guest.emit("chat-message", { roomId, text: "hello there" });
    const chat = await chatP;
    assert.equal(chat.name, "Bob");
    assert.equal(chat.text, "hello there");

    const hintP = eventOnce<{ name: string }>(host, "ai-hint");
    host.emit("request-hint");
    const hint = await hintP;
    assert.equal(hint.name, "AI Mentor");

    const spectator = await connect();
    const spectate = await emitAck<{ roomId: string }>(spectator, "spectate-room", {
      roomId,
    });
    assert.equal(spectate.roomId, roomId);

    guest.emit("leave-room", { roomId });
    const leftP = eventOnce<string>(host, "player-left");
    const left = await leftP;
    assert.equal(left, "bob-e2e");

    host.emit("leave-room", { roomId });
    const gone = await emitAck<{ error: string }>(
      spectator,
      "spectate-room",
      { roomId }
    ).catch((err) => err);
    assert.ok(gone.error, "room should be cleaned up after all players leave");
  });

  it("plays a full game: start, wrong submit, correct submit, score, game-over", async () => {
    await prisma.problem.create({
      data: {
        title: "E2E Sum Test",
        slug: `e2e-sum-${Date.now()}`,
        difficulty: "easy",
        category: TEST_CATEGORY,
        description: "<p>Sum an array of numbers.</p>",
        examples: [{ input: "[1,2]", output: "3" }],
        testCases: [{ input: "[2,3,4]", expected: "9" }],
        starterCode: "function main(nums) { return 0; }",
      },
    });

    const host = await connect();
    const guest = await connect();
    const { roomId } = await emitAck<{ roomId: string }>(host, "create-room", {
      code: ROOM_CODE + "G",
      name: "Alice",
      userId: "alice-game",
    });
    createdRoomIds.push(roomId);
    await emitAck<{ roomId: string }>(guest, "join-room", {
      code: ROOM_CODE + "G",
      name: "Bob",
      userId: "bob-game",
    });

    const gameStartP = eventOnce<{ problem: { id: string; title: string; testCases: unknown[] } }>(host, "game-start");
    host.emit("start-game", { roomId, category: TEST_CATEGORY, difficulty: "easy" });
    const game = await gameStartP;
    assert.equal(game.problem.title, "E2E Sum Test");
    assert.equal(game.problem.testCases.length, 1);

    const failedP = eventOnce<{ passed: boolean; results: { passed: boolean }[] }>(host, "test-results");
    host.emit("submit-code", { roomId, code: WRONG_CODE, userId: "alice-game" });
    const failed = await failedP;
    assert.equal(failed.passed, false);
    assert.equal(failed.results[0].passed, false);

    const scoreP = eventOnce<{ userId: string; score: number }>(guest, "score-update");
    const solvedChatP = eventOnce<{ userId: string; text: string }>(guest, "chat-message");
    const passedP = eventOnce<{ passed: boolean }>(host, "test-results");
    host.emit("submit-code", { roomId, code: CORRECT_CODE, userId: "alice-game" });
    const passed = await passedP;
    assert.equal(passed.passed, true);
    const score = await scoreP;
    assert.equal(score.userId, "alice-game");
    assert.ok(score.score >= 100 && score.score <= 200, `score ${score.score} in easy range`);
    const solvedChat = await solvedChatP;
    assert.match(solvedChat.text, /solved/);

    const gameOverP = eventOnce<{ players: { score: number }[] }>(host, "game-over");
    guest.emit("submit-code", { roomId, code: CORRECT_CODE, userId: "bob-game" });
    const gameOver = await gameOverP;
    assert.equal(gameOver.players.length, 2);
    assert.ok(gameOver.players.every((p) => p.score > 0));
  });
});
