/// <reference path="./express-ws.d.ts" />
import express, { Request, Response } from "express";
import ViteExpress from "vite-express";
import type { GameState } from "./src/tic-tac-toe"
import { createGame, makeMove } from "./src/tic-tac-toe"
import http from "http"
import type { WebSocket } from "ws";

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// --- Completed games (for stats / history) ---
const games: Array<{
  id: string;
  winner: "X" | "O" | null;
  moves: number;
  timestamp: string;
}> = [];

// --- Live games (in progress) ---
const gameStore: Record<string, GameState> = {};
export function resetGameStore() {
  for (const key of Object.keys(gameStore)) {
    delete gameStore[key];
  }
}

// --- WebSocket: who is subscribed to which game (GameId => Set of clients) ---
const subscriptions = new Map<string, Set<WebSocket>>();

// API Routes

// GET /api/stats - Get game statistics
app.get("/api/stats", (_req: Request, res: Response) => {
  const wins = games.filter(g => g.winner === "X").length;
  const losses = games.filter(g => g.winner === "O").length;
  const draws = games.filter(g => g.winner === null).length;
  const totalGames = games.length;
  const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;

  res.json({
    totalGames,
    wins,
    losses,
    draws,
    winRate: Math.round(winRate * 100) / 100,
  });
});

// GET /api/games - Get all completed games
app.get("/api/games", (_req: Request, res: Response) => {
  res.json(games);
});

// POST /api/games - Save a completed game
app.post("/api/games", (req: Request, res: Response) => {
  const { winner, moves } = req.body;

  const newGame = {
    id: Date.now().toString(),
    winner: winner ?? null,
    moves: moves ?? 0,
    timestamp: new Date().toISOString(),
  };

  games.push(newGame);
  res.status(200).json(newGame);
});

// POST /create - Create a new game
app.post("/create", (_req: Request, res: Response) => {
  const id = crypto.randomUUID();
  const newGame: GameState = {
    id,
    board: [null, null, null, null, null, null, null, null, null],
    currentPlayer: "X"
  };
  gameStore[id] = newGame;
  res.status(200).json(newGame);
})

 // GET /games - List all live games
app.get("/games", (_req: Request, res: Response) => {
  const allGames = Object.values(gameStore);
  res.json(allGames);
});

// --- Live game API (for Lobby and game screen) ---

// GET /games - List all live games
app.get("/games", (_req: Request, res: Response) => {
  res.json(Object.values(gameStore));
});

// POST /create - Create a new live game
app.post("/create", (_req: Request, res: Response) => {
  const id = crypto.randomUUID();
  const newGame: GameState = {
    id,
    board: [null, null, null, null, null, null, null, null, null],
    currentPlayer: "X",
  };
  gameStore[id] = newGame;
  res.status(200).json(newGame);
});

// GET /game/:id - Get a single live game
app.get("/game/:id", (req: Request, res: Response) => {
  const id = req.params.id as string;
  const game = gameStore[id];
  if (!game) {
    return res.status(404).send();
  }
  res.status(200).json(game);
});

// POST /move/:id - Apply a move to a live game
app.post("/move/:id", (req: Request, res: Response) => {
  const id = req.params.id as string;
  const game = gameStore[id];
  if (!game) {
    return res.status(404).send();
  }

  const position = req.body?.position;
  if (position === undefined || position === null) {
    return res.status(400).json({ error: "position is required" });
  }
  const pos = Number(position);
  if (!Number.isInteger(pos) || pos < 0 || pos > 8) {
    return res.status(400).json({ error: "position must be an integer between 0 and 8" });
  }

  try {
    const nextState = makeMove(game, pos);
    const updated: GameState = { ...nextState, id: game.id };
    gameStore[id] = updated;
    broadcastGameUpdate(id, updated);
    return res.status(200).json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid move";
    return res.status(400).json({ error: message });
  }
});

export default app

// --- WebSocket: subscribe by gameId, broadcast on game update ---
import expressWs from "express-ws";

const server = http.createServer(app);
expressWs(app, server);

// Subscribe on first message; remove on close so we don't leak or send to dead connections.
app.ws("/ws", (ws, _req) => {
  let gameId: string | null = null;

  ws.on("message", (raw) => {
    try {
      const msg = JSON.parse(raw.toString()) as { type?: string; gameId?: string };
      if (msg.type !== "subscribe" || typeof msg.gameId !== "string") return;
      if (!gameStore[msg.gameId]) return; // only subscribe to existing games
      gameId = msg.gameId;
      if (!subscriptions.has(gameId)) subscriptions.set(gameId, new Set());
      subscriptions.get(gameId)!.add(ws);
    } catch {
      // ignore invalid JSON
    }
  });

  ws.on("close", () => {
    if (gameId) {
      subscriptions.get(gameId)?.delete(ws);
      if (subscriptions.get(gameId)?.size === 0) subscriptions.delete(gameId);
    }
  });
});

// Send update: broadcast new game state to all clients subscribed to this game.
function broadcastGameUpdate(gameId: string, state: GameState) {
  const payload = JSON.stringify(state);
  const set = subscriptions.get(gameId);
  if (!set) return;
  for (const ws of set) {
    if (ws.readyState === 1) {
      try {
        ws.send(payload);
      } catch {
        // ignore send errors
      }
    }
  }
}

export { broadcastGameUpdate };

// Start server: same port for HTTP and WebSocket; ViteExpress.bind is async.
ViteExpress.bind(app, server).then(() => {
  const port = Number(process.env.PORT) || 3000;
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server is listening on port ${port}...`);
  });
})