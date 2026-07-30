import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url ?? "", true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  const rooms = new Map<string, {
    code: string;
    players: Map<string, any>;
    problem: any;
    status: string;
    timeRemaining: number;
    timer: NodeJS.Timeout | null;
  }>();

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("create-room", ({ code }, callback) => {
      const roomId = `${code}-${Date.now()}`;
      rooms.set(roomId, {
        code,
        players: new Map(),
        problem: null,
        status: "waiting",
        timeRemaining: 0,
        timer: null,
      });

      const player = {
        userId: socket.id,
        name: `Player_${socket.id.slice(0, 4)}`,
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

    socket.on("join-room", ({ code, roomId: existingRoomId }, callback) => {
      // Find room by code or ID
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
        callback({ error: "Room not found" });
        return;
      }

      const room = rooms.get(roomId)!;
      if (room.players.size >= 4) {
        callback({ error: "Room is full" });
        return;
      }
      if (room.status !== "waiting") {
        callback({ error: "Game already in progress" });
        return;
      }

      const player = {
        userId: socket.id,
        name: `Player_${socket.id.slice(0, 4)}`,
        image: null,
        score: 0,
        solved: false,
        color: ["#ef4444", "#22c55e", "#eab308", "#a855f7"][room.players.size],
      };
      room.players.set(socket.id, player);

      socket.join(roomId);

      const playersArr = Array.from(room.players.values());
      io.to(roomId).emit("player-joined", player);
      socket.emit("room-state", {
        players: playersArr,
        problem: room.problem,
        status: room.status,
        timeRemaining: room.timeRemaining,
      });

      callback({ roomId, userId: socket.id });
    });

    socket.on("start-game", ({ roomId }) => {
      const room = rooms.get(roomId);
      if (!room || room.status !== "waiting") return;

      room.status = "playing";
      room.timeRemaining = 600;
      room.problem = {
        id: "two-sum",
        title: "Two Sum",
        difficulty: "easy",
        description: `<p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.</p><p>You may assume that each input would have exactly one solution, and you may not use the same element twice.</p>`,
        examples: [
          { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
          { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
        ],
        testCases: [],
        starterCode: `function twoSum(nums, target) {\n  // Your code here\n};`,
      };

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
          io.to(roomId).emit("game-over", {
            players: Array.from(room.players.values()),
          });
        }
      }, 1000);
    });

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
      // Find which room this socket is in
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

    socket.on("submit-code", ({ roomId, code }) => {
      if (!roomId) return;
      const room = rooms.get(roomId);
      if (!room || room.status !== "playing") return;

      const player = room.players.get(socket.id);
      if (!player || player.solved) return;

      player.solved = true;
      player.score += 200;

      io.to(roomId).emit("score-update", { userId: socket.id, score: player.score });

      // Check if all solved
      const allSolved = Array.from(room.players.values()).every((p) => p.solved);
      if (allSolved) {
        clearInterval(room.timer!);
        room.timer = null;
        room.status = "finished";
        io.to(roomId).emit("game-over", {
          players: Array.from(room.players.values()),
        });
      }
    });

    socket.on("disconnect", () => {
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

  const port = parseInt(process.env.PORT ?? "3001", 10);
  server.listen(port, () => {
    console.log(`> Server ready on http://localhost:${port}`);
  });
});
