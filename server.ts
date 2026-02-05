import express, { Request, Response } from "express";
import type { GameState } from "./src/tic-tac-toe"
import { createGame, makeMove } from "./src/tic-tac-toe"

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Store Live Games

const gameStore: Record<string, GameState> = {};

export function resetGameStore() {
  for (const key of Object.keys(gameStore)) {
    delete gameStore[key];
  }
}


// In-memory storage 
const games: Array<{
  id: string;
  winner: "X" | "O" | null;
  moves: number;
  timestamp: string;
}> = [];

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
    winRate: Math.round(winRate * 100) / 100 // Round to 2 decimal places
  });
});

// GET /api/games - Get all games
app.get("/api/games", (_req: Request, res: Response) => {
  res.json(games);
});

// POST /api/games - Save a completed game
app.post("/api/games", (req: Request, res: Response) => {
  const { winner, moves } = req.body;
  
  const newGame = {
    id: Date.now().toString(),
    winner: winner || null,
    moves: moves || 0,
    timestamp: new Date().toISOString()
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

// Get a single live game dea
app.get("/game/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const game = gameStore[id];
  if (!game) {
    return res.status(404).send();
  }
  res.status(200).json(game);
});


// POST /move/:id - Apply a move to a live game
app.post("/move/:id", (req: Request, res: Response) => {
  const id = req.params.id as string
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
    const updated = { ...nextState, id: game.id };
    gameStore[id] = updated;
    return res.status(200).json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid move";
    return res.status(400).json({ error: message });
  }
});

// Export the app so tests can import it
export default app;

// Only start the server if this file is run directly (not when imported by tests)
if (import.meta.main && !process.env.VITEST) {
    const ViteExpress = (await import("vite-express")).default;
    ViteExpress.listen(app, 3000, () => {
      console.log("Server is listening on port 3000...");
    });
  }