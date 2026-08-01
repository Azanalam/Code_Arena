import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import { PrismaClient } from "./src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { runTestCases, runMarkupTestCases } from "./src/lib/piston";

const prismaAdapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter: prismaAdapter });

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const rooms = new Map<string, {
  code: string;
  players: Map<string, any>;
  spectators: Set<string>;
  problem: any;
  status: string;
  timeRemaining: number;
  timer: NodeJS.Timeout | null;
}>();

const leaderboard: { name: string; score: number; date: number }[] = [];

let matchQueue: { socketId: string; name: string }[] = [];

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function fetchRandomProblem(category?: string, difficulty?: string) {
  const where: any = {};
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

function updateLeaderboard(roomId: string) {
  const room = rooms.get(roomId);
  if (!room) return;
  for (const p of room.players.values()) {
    if (p.score > 0) {
      leaderboard.push({ name: p.name, score: p.score, date: Date.now() });
    }
  }
  leaderboard.sort((a, b) => b.score - a.score);
  if (leaderboard.length > 100) leaderboard.length = 100;
}

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on("create-room", ({ code, name }, callback) => {
    const roomId = `${code}-${Date.now()}`;
    rooms.set(roomId, {
      code,
      players: new Map(),
      spectators: new Set<string>(),
      problem: null,
      status: "waiting",
      timeRemaining: 0,
      timer: null,
    });

    const player = {
      userId: socket.id,
      name: name || `Player_${socket.id.slice(0, 4)}`,
      image: null,
      score: 0,
      solved: false,
      color: "#3b82f6",
    };
    rooms.get(roomId)!.players.set(socket.id, player);

    socket.join(roomId);
    socket.emit("room-state", {
      players: [player],
      problem: null,
      status: "waiting",
      timeRemaining: 0,
    });

    callback({ roomId, userId: socket.id });
  });

  socket.on("join-room", ({ code, roomId: existingRoomId, name }, callback) => {
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
    if (room.players.size >= 4) {
      callback?.({ error: "Room is full" });
      return;
    }

    const existingPlayer = room.players.get(socket.id);
    if (!existingPlayer) {
      const player = {
        userId: socket.id,
        name: name || `Player_${socket.id.slice(0, 4)}`,
        image: null,
        score: 0,
        solved: false,
        color: "#3b82f6",
      };
      room.players.set(socket.id, player);
    }

    socket.join(roomId);

    const playersArr = Array.from(room.players.values());
    if (!existingPlayer) {
      io.to(roomId).emit("player-joined", playersArr[playersArr.length - 1]);
    }
    socket.emit("room-state", {
      players: playersArr,
      problem: room.problem,
      status: room.status,
      timeRemaining: room.timeRemaining,
    });

    callback?.({ roomId, userId: socket.id });
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
      .find((p) => p.userId === socket.id)?.name ?? "Unknown";
    io.to(roomId).emit("chat-message", {
      userId: socket.id,
      name: playerName,
      text,
    });
  });

  socket.on("request-hint", () => {
    for (const [roomId, room] of rooms) {
      if (room.players.has(socket.id)) {
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

    const player = room.players.get(socket.id);
    if (!player || player.solved) return;

    const testCases = room.problem?.testCases ?? [];
    if (testCases.length === 0) {
      player.solved = true;
      player.score += 200;
      io.to(roomId).emit("score-update", { userId: socket.id, score: player.score });
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
        const score =
          difficulty === "easy" ? 100 + Math.max(0, Math.floor((1 - timeSpent / 600) * 100)) :
          difficulty === "medium" ? 250 + Math.max(0, Math.floor((1 - timeSpent / 600) * 250)) :
          500 + Math.max(0, Math.floor((1 - timeSpent / 600) * 500));

        player.score += score;
        io.to(roomId).emit("score-update", { userId: socket.id, score: player.score });
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

  socket.on("get-leaderboard", (_, callback) => {
    if (typeof callback === "function") callback([...leaderboard]);
  });

  socket.on("get-problems", async (_, callback) => {
    try {
      const problems = await prisma.problem.findMany({ orderBy: { createdAt: "asc" } });
      callback?.(problems.map((p) => ({
        id: p.id, title: p.title, slug: p.slug,
        difficulty: p.difficulty, category: p.category,
      })));
    } catch { callback?.([]); }
  });

  socket.on("practice-start", async ({ slug }, callback) => {
    try {
      const dbProblem = await prisma.problem.findUnique({ where: { slug } });
      if (!dbProblem) { callback?.({ error: "Problem not found" }); return; }
      const roomId = `practice-${slug}-${Date.now()}`;
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
      };
      rooms.set(roomId, room);
      socket.join(roomId);
      room.players.set(socket.id, {
        userId: socket.id, name: "You", image: null, score: 0, solved: false, color: "#3b82f6",
      });
      callback?.({ roomId });
    } catch { callback?.({ error: "Failed to start practice" }); }
  });

  socket.on("quick-match", ({ name }, callback) => {
    matchQueue = matchQueue.filter((q) => q.socketId !== socket.id);
    matchQueue.push({ socketId: socket.id, name: name || `Player_${socket.id.slice(0, 4)}` });
    socket.emit("matchmaking-status", { searching: true, queueSize: matchQueue.length });
    callback?.({ queued: true });
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

      const code = generateRoomCode();
      const roomId = `quick-${code}-${Date.now()}`;
      const room: {
        code: string;
        players: Map<string, any>;
        spectators: Set<string>;
        problem: any;
        status: string;
        timeRemaining: number;
        timer: NodeJS.Timeout | null;
      } = {
        code,
        players: new Map<string, any>(),
        spectators: new Set<string>(),
        problem: null,
        status: "waiting",
        timeRemaining: 0,
        timer: null,
      };
      rooms.set(roomId, room);

      room.players.set(a.socketId, {
        userId: a.socketId, name: a.name, image: null, score: 0, solved: false, color: "#ef4444",
      });
      room.players.set(b.socketId, {
        userId: b.socketId, name: b.name, image: null, score: 0, solved: false, color: "#3b82f6",
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
    if (!userId) { callback?.({ error: "Not signed in" }); return; }
    try {
      const subs = await prisma.submission.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      const ids = [...new Set(subs.map((s) => s.problemId))];
      const problems = await prisma.problem.findMany({ where: { id: { in: ids } } });
      const problemMap = new Map(problems.map((p) => [p.id, p]));
      callback?.(subs.map((s) => ({
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
      })));
    } catch { callback?.([]); }
  });

  socket.on("forfeit", ({ roomId }) => {
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room || room.status !== "playing") return;
    const player = room.players.get(socket.id);
    if (!player || player.solved) return;

    player.solved = true;
    player.score = 0;
    io.to(roomId).emit("score-update", { userId: socket.id, score: 0 });
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

  socket.on("disconnect", () => {
    matchQueue = matchQueue.filter((q) => q.socketId !== socket.id);
    io.emit("matchmaking-queue", matchQueue.length);
    for (const [roomId, room] of rooms) {
      if (room.players.has(socket.id)) {
        room.players.delete(socket.id);
        io.to(roomId).emit("player-left", socket.id);

        if (room.players.size === 0) {
          clearInterval(room.timer!);
          rooms.delete(roomId);
        }
        break;
      }
    }
  });
});

const SOCKET_PORT = parseInt(process.env.SOCKET_PORT ?? "3002", 10);
httpServer.listen(SOCKET_PORT, () => {
  console.log(`> Socket.io server ready on http://localhost:${SOCKET_PORT}`);
});
