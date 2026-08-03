<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Commands

- `npm run dev` — dev server (Next.js + Socket.io) on port 3000
- `npm run build` — prisma generate + production build
- `npm run lint` — `eslint . --ext .ts,.tsx`
- `npm run test` — `node --import tsx --test "tests/*.test.ts"` (unit + socket integration tests; integration test needs a reachable DATABASE_URL)

# Conventions

- Server is `server.ts` at the repo root: a Socket.io server hosting the Next app and all game state in memory (`rooms` Map). Event handlers: `create-room`, `join-room`, `start-game`, `submit-code`, `chat-message`, `request-hint`, `quick-match`, `forfeit`, `leave-room`, `spectate-room`.
- Game logic used by both client and server lives in `src/lib/gameLogic.ts` — import from there instead of duplicating formulas (e.g. `calculateScore`, `generateRoomCode`).
- Code execution for submissions is local (node:vm) in `src/lib/piston.ts` — no external sandbox.
- Tests live in `tests/` using `node:test`; the integration test spawns the real server as a child process on port 3211.
