import "dotenv/config";
import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { PrismaClient, Prisma } from "./src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { runTestCases, runMarkupTestCases } from "./src/lib/piston";
import { calculateScore, generateRoomCode, type Difficulty } from "./src/lib/gameLogic";

const dev = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT ?? "3000", 10);

const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

type RoomPlayer = {
  userId: string;
  socketId: string;
  connected: boolean;
  name: string;
  image: string | null;
  score: number;
  solved: boolean;
  color: string;
};

type RoomProblem = {
  id: string;
  title: string;
  difficulty: string;
  category: string;
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  testCases: { input: string; expected: string }[];
  starterCode: string;
};

type Room = {
  code: string;
  players: Map<string, RoomPlayer>;
  spectators: Set<string>;
  problem: RoomProblem | null;
  status: string;
  timeRemaining: number;
  timer: NodeJS.Timeout | null;
  cleanupTimer: NodeJS.Timeout | null;
};

const prismaAdapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter: prismaAdapter });

const rooms = new Map<string, Room>();

let matchQueue: { socketId: string; name: string; userId: string }[] = [];

async function fetchRandomProblem(category?: string, difficulty?: string) {
  const where: Prisma.ProblemWhereInput = {};
  if (category && category !== "all") where.category = category;
  if (difficulty && difficulty !== "all") where.difficulty = difficulty;
  const problemCount = await prisma.problem.count({ where });
  if (problemCount === 0) return null;
  const skip = Math.floor(Math.random() * problemCount);
  const dbProblem = await prisma.problem.findFirst({ where, skip });
  if (!dbProblem) return null;
  return {
    id: dbProblem.id,
    title: dbProblem.title,
    difficulty: dbProblem.difficulty,
    category: dbProblem.category,
    description: dbProblem.description,
    examples: typeof dbProblem.examples === "string" ? JSON.parse(dbProblem.examples) : dbProblem.examples,
    testCases: typeof dbProblem.testCases === "string" ? JSON.parse(dbProblem.testCases) : dbProblem.testCases,
    starterCode: dbProblem.starterCode,
  };
}

async function updateLeaderboard(roomId: string) {
  const room = rooms.get(roomId);
  if (!room) return;
  for (const p of room.players.values()) {
    if (p.score > 0) {
      try {
        await prisma.leaderboardEntry.create({
          data: { name: p.name, score: p.score, userId: p.userId ?? null, roomId },
        });
      } catch (err) {
        console.error("Failed to save leaderboard entry:", err);
      }
    }
  }
}

function setupSocketServer(httpServer: import("http").Server) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN ?? true,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on("create-room", ({ code, name, userId }, callback) => {
    const roomId = `${code}-${Date.now()}`;
    const uid = userId || socket.id;
    socket.data.userId = uid;
    rooms.set(roomId, {
      code,
      players: new Map(),
      spectators: new Set<string>(),
      problem: null,
      status: "waiting",
      timeRemaining: 0,
      timer: null,
      cleanupTimer: null,
    });

    const player = {
      userId: uid,
      socketId: socket.id,
      connected: true,
      name: name || `Player_${uid.slice(0, 4)}`,
      image: null,
      score: 0,
      solved: false,
      color: "#3b82f6",
    };
    rooms.get(roomId)!.players.set(uid, player);

    socket.join(roomId);
    socket.emit("room-state", {
      players: [player],
      problem: null,
      status: "waiting",
      timeRemaining: 0,
      userId: uid,
    });

    callback({ roomId, userId: uid });
  });

  socket.on("join-room", ({ code, roomId: existingRoomId, name, userId }, callback) => {
    let roomId = existingRoomId;
    if (!roomId) {
      for (const [id, room] of rooms) {
        if (room.code === code) {
          roomId = id;
          break;
        }
      }
    }

    if (!roomId || !rooms.has(roomId)) {
      callback?.({ error: "Room not found" });
      return;
    }

    const room = rooms.get(roomId)!;
    const uid = userId || socket.id;
    socket.data.userId = uid;
    const existingPlayer = room.players.get(uid);
    const isReconnect = !!existingPlayer;

    if (!existingPlayer) {
      if (room.players.size >= 4) {
        callback?.({ error: "Room is full" });
        return;
      }
      const player = {
        userId: uid,
        socketId: socket.id,
        connected: true,
        name: name || `Player_${uid.slice(0, 4)}`,
        image: null,
        score: 0,
        solved: false,
        color: "#3b82f6",
      };
      room.players.set(uid, player);
    } else {
      existingPlayer.socketId = socket.id;
      existingPlayer.connected = true;
    }

    if (room.cleanupTimer) {
      clearTimeout(room.cleanupTimer);
      room.cleanupTimer = null;
    }

    socket.join(roomId);

    const playersArr = Array.from(room.players.values());
    if (!isReconnect) {
      io.to(roomId).emit("player-joined", playersArr[playersArr.length - 1]);
    }
    socket.emit("room-state", {
      players: playersArr,
      problem: room.problem,
      status: room.status,
      timeRemaining: room.timeRemaining,
      userId: uid,
      reconnected: isReconnect,
    });

    callback?.({ roomId, userId: uid });
  });

  socket.on("spectate-room", ({ roomId: existingRoomId }, callback) => {
    for (const [id, room] of rooms) {
      if (id === existingRoomId || room.code === existingRoomId) {
        socket.join(id);
        room.spectators.add(socket.id);
        callback?.({ roomId: id });
        return;
      }
    }
    callback?.({ error: "Room not found" });
  });

  socket.on("start-game", async ({ roomId, category, difficulty }) => {
    const room = rooms.get(roomId);
    if (!room || room.status !== "waiting") return;

    const problem = await fetchRandomProblem(category, difficulty);
    if (!problem) {
      console.error(`No problems found for category=${category || "all"} difficulty=${difficulty || "all"}`);
      return;
    }
    room.problem = problem;

    startCountdown(roomId);
  });

  function startCountdown(roomId: string) {
    const room = rooms.get(roomId);
    if (!room) return;
    room.status = "countdown";
    let count = 3;
    io.to(roomId).emit("countdown", { count });

    room.timer = setInterval(() => {
      count--;
      if (count > 0) {
        io.to(roomId).emit("countdown", { count });
      } else {
        clearInterval(room.timer!);
        room.timer = null;
        room.status = "playing";
        room.timeRemaining = 600;
        io.to(roomId).emit("game-start", {
          problem: room.problem,
          timeLimit: room.timeRemaining,
        });

        room.timer = setInterval(() => {
          room.timeRemaining--;
          io.to(roomId).emit("timer-tick", room.timeRemaining);

          if (room.timeRemaining <= 0) {
            clearInterval(room.timer!);
            room.timer = null;
            room.status = "finished";
            updateLeaderboard(roomId);
            io.to(roomId).emit("game-over", {
              players: Array.from(room.players.values()),
            });
          }
        }, 1000);
      }
    }, 1000);
  }

  socket.on("chat-message", ({ roomId, text }) => {
    if (!roomId || !text) return;
    const playerName = Array.from(rooms.get(roomId)?.players.values() ?? [])
      .find((p) => p.userId === socket.data.userId)?.name ?? "Unknown";
    io.to(roomId).emit("chat-message", {
      userId: socket.data.userId,
      name: playerName,
      text,
    });
  });

  socket.on("request-hint", () => {
    for (const room of rooms.values()) {
      if (room.players.has(socket.data.userId)) {
        socket.emit("ai-hint", {
          userId: "ai",
          name: "AI Mentor",
          text: "Try breaking the problem into smaller steps. What output format is expected?",
        });
        break;
      }
    }
  });

  socket.on("submit-code", async ({ roomId, code, userId }) => {
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room || room.status !== "playing") return;

    const player = room.players.get(socket.data.userId);
    if (!player || player.solved) return;

    const testCases = room.problem?.testCases ?? [];
    if (testCases.length === 0) {
      player.solved = true;
      player.score += 200;
      io.to(roomId).emit("score-update", { userId: socket.data.userId, score: player.score });
      if (userId && room.problem?.id) {
        try {
          await prisma.submission.create({
            data: { userId, problemId: room.problem.id, roomId, code, language: room.problem.category ?? "javascript", passed: true, score: 200 },
          });
        } catch (err) { console.error("Failed to save submission:", err); }
      }
    } else {
      const category = room.problem?.category ?? "javascript";
      const result = category === "html" || category === "css"
        ? runMarkupTestCases(code, testCases, category)
        : await runTestCases(code, testCases);

      socket.emit("test-results", result);

      if (result.passed) {
        player.solved = true;
        const timeSpent = room.problem
          ? 600 - room.timeRemaining
          : 300;
        const difficulty = room.problem?.difficulty ?? "easy";
        const score = calculateScore(timeSpent, 600, difficulty as Difficulty);

        player.score += score;
        io.to(roomId).emit("score-update", { userId: socket.data.userId, score: player.score });
        io.to(roomId).emit("chat-message", {
          userId: "system",
          name: "System",
          text: `${player.name} solved the problem!`,
        });

        if (userId && room.problem?.id) {
          try {
            await prisma.submission.create({
              data: { userId, problemId: room.problem.id, roomId, code, language: room.problem.category ?? "javascript", passed: true, score },
            });
          } catch (err) { console.error("Failed to save submission:", err); }
        }
      } else if (userId && room.problem?.id) {
        try {
          await prisma.submission.create({
            data: {
              userId, problemId: room.problem.id, roomId, code, language: room.problem.category ?? "javascript",
              passed: false, score: 0,
              output: (result.results.find((r) => !r.passed)?.actual ?? "").slice(0, 500),
            },
          });
        } catch (err) { console.error("Failed to save submission:", err); }
      }
    }

    const allSolved = Array.from(room.players.values()).every((p) => p.solved);
    if (allSolved) {
      clearInterval(room.timer!);
      room.timer = null;
      room.status = "finished";
      updateLeaderboard(roomId);
      io.to(roomId).emit("game-over", {
        players: Array.from(room.players.values()),
      });
    }
  });

  socket.on("get-leaderboard", async (_, callback) => {
    try {
      const entries = await prisma.leaderboardEntry.findMany({
        orderBy: [{ score: "desc" }, { createdAt: "asc" }],
        take: 100,
      });
      callback?.(entries.map((e) => ({ name: e.name, score: e.score, date: e.createdAt.getTime() })));
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
      callback?.([]);
    }
  });

  socket.on("get-problems", async (_, callback) => {
    try {
      const problems = await prisma.problem.findMany({ orderBy: { createdAt: "asc" } });
      callback?.(problems.map((p) => ({
        id: p.id, title: p.title, slug: p.slug,
        difficulty: p.difficulty, category: p.category,
      })));
    } catch {
      callback?.([]);
    }
  });

  socket.on("practice-start", async ({ slug, userId }, callback) => {
    try {
      const dbProblem = await prisma.problem.findUnique({ where: { slug } });
      if (!dbProblem) return callback?.({ error: "Problem not found" });
      const roomId = `practice-${slug}-${Date.now()}`;
      const uid = userId || socket.id;
      socket.data.userId = uid;
      const room = {
        code: roomId,
        players: new Map(),
        spectators: new Set<string>(),
        problem: {
          id: dbProblem.id, title: dbProblem.title, difficulty: dbProblem.difficulty,
          category: dbProblem.category, description: dbProblem.description,
          examples: typeof dbProblem.examples === "string" ? JSON.parse(dbProblem.examples) : dbProblem.examples,
          testCases: typeof dbProblem.testCases === "string" ? JSON.parse(dbProblem.testCases) : dbProblem.testCases,
          starterCode: dbProblem.starterCode,
        },
        status: "playing" as const,
        timeRemaining: 0,
        timer: null,
        cleanupTimer: null,
      };
      rooms.set(roomId, room);
      socket.join(roomId);
      room.players.set(uid, {
        userId: uid, socketId: socket.id, connected: true, name: "You", image: null, score: 0, solved: false, color: "#3b82f6",
      });
      return callback?.({ roomId, userId: uid });
    } catch {
      return callback?.({ error: "Failed to start practice" });
    }
  });

  socket.on("quick-match", ({ name, userId }, callback) => {
    const uid = userId || socket.id;
    socket.data.userId = uid;
    matchQueue = matchQueue.filter((q) => q.socketId !== socket.id);
    matchQueue.push({ socketId: socket.id, name: name || `Player_${uid.slice(0, 4)}`, userId: uid });
    socket.emit("matchmaking-status", { searching: true, queueSize: matchQueue.length });
    callback?.({ queued: true, userId: uid });
    io.emit("matchmaking-queue", matchQueue.length);

    if (matchQueue.length >= 2) {
      const [a, b] = matchQueue.splice(0, 2);
      const aSocket = io.sockets.sockets.get(a.socketId);
      const bSocket = io.sockets.sockets.get(b.socketId);
      if (!aSocket || !bSocket) {
        if (aSocket) matchQueue.push(a);
        if (bSocket) matchQueue.push(b);
        return;
      }

      aSocket.data.userId = a.userId;
      bSocket.data.userId = b.userId;

      const code = generateRoomCode();
      const roomId = `quick-${code}-${Date.now()}`;
      const room: Room = {
        code,
        players: new Map<string, RoomPlayer>(),
        spectators: new Set<string>(),
        problem: null,
        status: "waiting",
        timeRemaining: 0,
        timer: null,
        cleanupTimer: null,
      };
      rooms.set(roomId, room);

      room.players.set(a.userId, {
        userId: a.userId, socketId: a.socketId, connected: true, name: a.name, image: null, score: 0, solved: false, color: "#ef4444",
      });
      room.players.set(b.userId, {
        userId: b.userId, socketId: b.socketId, connected: true, name: b.name, image: null, score: 0, solved: false, color: "#3b82f6",
      });
      aSocket.join(roomId);
      bSocket.join(roomId);
      io.to(roomId).emit("match-found", { roomId });

      (async () => {
        const problem = await fetchRandomProblem();
        if (!problem) return;
        room.problem = problem;
        startCountdown(roomId);
      })();
    }
  });

  socket.on("cancel-match", () => {
    matchQueue = matchQueue.filter((q) => q.socketId !== socket.id);
    socket.emit("matchmaking-status", { searching: false, queueSize: matchQueue.length });
    io.emit("matchmaking-queue", matchQueue.length);
  });

  socket.on("get-submissions", async ({ userId }, callback) => {
    if (!userId) return callback?.({ error: "Not signed in" });
    try {
      const subs = await prisma.submission.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      const ids = [...new Set(subs.map((s) => s.problemId))];
      const problems = await prisma.problem.findMany({ where: { id: { in: ids } } });
      const problemMap = new Map(problems.map((p) => [p.id, p]));
      return subs.map((s) => ({
        id: s.id,
        problemId: s.problemId,
        title: problemMap.get(s.problemId)?.title ?? "Unknown",
        difficulty: problemMap.get(s.problemId)?.difficulty ?? "",
        category: problemMap.get(s.problemId)?.category ?? "",
        code: s.code,
        language: s.language,
        passed: s.passed,
        score: s.score,
        output: s.output,
        createdAt: s.createdAt,
      }));
    } catch {
      callback?.([]);
    }
  });

  socket.on("forfeit", ({ roomId }) => {
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room || room.status !== "playing") return;
    const player = room.players.get(socket.data.userId);
    if (!player || player.solved) return;

    player.solved = true;
    player.score = 0;
    io.to(roomId).emit("score-update", { userId: socket.data.userId, score: 0 });
    io.to(roomId).emit("chat-message", {
      userId: "system",
      name: "System",
      text: `${player.name} forfeited!`,
    });

    const allSolved = Array.from(room.players.values()).every((p) => p.solved);
    if (allSolved) {
      clearInterval(room.timer!);
      room.timer = null;
      room.status = "finished";
      updateLeaderboard(roomId);
      io.to(roomId).emit("game-over", {
        players: Array.from(room.players.values()),
      });
    }
  });

  socket.on("leave-room", ({ roomId }) => {
    const room = rooms.get(roomId);
    const uid = socket.data?.userId;
    if (!room || !uid) return;
    if (room.players.delete(uid)) {
      io.to(roomId).emit("player-left", uid);
    }
    room.spectators.delete(socket.id);
    if (room.players.size === 0) {
      clearInterval(room.timer!);
      if (room.cleanupTimer) clearTimeout(room.cleanupTimer);
      rooms.delete(roomId);
    }
  });

  socket.on("disconnect", () => {
    matchQueue = matchQueue.filter((q) => q.socketId !== socket.id);
    io.emit("matchmaking-queue", matchQueue.length);
    const uid = socket.data?.userId;
    for (const [roomId, room] of rooms) {
      room.spectators.delete(socket.id);
      const player = uid ? room.players.get(uid) : null;
      if (player) {
        if (player.socketId === socket.id) {
          player.connected = false;
        }
        const anyConnected = Array.from(room.players.values()).some((p) => p.connected);
        if (!anyConnected) {
          if (room.cleanupTimer) clearTimeout(room.cleanupTimer);
          room.cleanupTimer = setTimeout(() => {
            const roomNow = rooms.get(roomId);
            if (roomNow && Array.from(roomNow.players.values()).every((p) => !p.connected)) {
              clearInterval(roomNow.timer!);
              rooms.delete(roomId);
            }
          }, 60_000);
        }
        break;
      }
    }
  });
  });

  return io;
}

nextApp.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res);
  });
  setupSocketServer(httpServer);
  httpServer.listen(port, () => {
    console.log(`> CodeArena ready on http://localhost:${port} [${dev ? "dev" : "production"}]`);
  });
});
