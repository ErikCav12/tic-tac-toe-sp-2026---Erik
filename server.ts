import express, { Request, Response } from "express";
import ViteExpress from "vite-express";

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

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
  res.status(201).json(newGame);
});

// Start server with ViteExpress
ViteExpress.listen(app, 3000, () => {
  console.log("Server is listening on port 3000...");
});