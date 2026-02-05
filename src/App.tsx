import { useState, useEffect } from "react";
import { createGame, getWinner, announceDraw, type GameState, type Player } from "./tic-tac-toe";
import { getAIMove } from "./ai";
import styles from './App.module.css';

function App() {
  const [gameState, setGameState] = useState<GameState>(getInitialGame());
  const [moveCount, setMoveCount] = useState(0);
  const [gameId, setGameId] = useState<string | null>(null);
  const [stats, setStats] = useState({ 
    totalGames: 0, 
    wins: 0, 
    losses: 0, 
    draws: 0, 
    winRate: 0 
  });
  
  const AI_PLAYER: Player = "O";
  const HUMAN_PLAYER: Player = "X";

  const winner = getWinner(gameState);
  const drawMessage = announceDraw(gameState);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const totalMoves = gameState.board.filter(cell => cell !== null).length;
    setMoveCount(totalMoves);
  }, [gameState.board]);

  useEffect(() => {
    if (winner !== null || drawMessage !== null) {
      const saveGame = async () => {
        try {
          await fetch("/api/games", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              winner: winner || null,
              moves: moveCount
            })
          });
          fetchStats();
        } catch (error) {
          console.error("Failed to save game:", error);
        }
      };
      saveGame();
    }
  }, [winner, drawMessage]);

  const handleCellClick = async (position: number) => {
    if (gameId === null) return;
    if (gameState.currentPlayer !== HUMAN_PLAYER) return;
    if (winner !== null) return;

    try {
      const response = await fetch(`/move/${gameId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position }),
      });
      if (!response.ok) {
        console.error("Move failed:", await response.text());
        return;
      }
      const data: GameState = await response.json();
      setGameState(data);
    } catch (error) {
      console.error("Failed to make move:", error);
    }
  };

  const handleNewGame = async () => {
    try {
      const response = await fetch("/create", { method: "POST" });
      if (!response.ok) {
        console.error("Create game failed:", await response.text());
        return;
      }
      const data: GameState = await response.json();
      setGameId(data.id);
      setGameState(data);
      setMoveCount(0);
    } catch (error) {
      console.error("Failed to create game:", error);
    }
  };

  useEffect(() => {
    if (gameId === null) return;
    if (
      gameState.currentPlayer !== AI_PLAYER ||
      winner !== null ||
      drawMessage !== null
    ) return;

    const timer = setTimeout(async () => {
      const aiPosition = getAIMove(gameState);
      try {
        const response = await fetch(`/move/${gameId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ position: aiPosition }),
        });
        if (!response.ok) return;
        const data: GameState = await response.json();
        setGameState(data);
      } catch (error) {
        console.error("Failed to make AI move:", error);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [gameId, gameState, winner, drawMessage]);

  return (
    <div className={styles.layout}>
      <h1 className={styles.title}>Welcome to the World Championships of tic-tac-toe</h1>
      
      <div className={styles.statsContainer}>
        <h3 className={styles.statsTitle}>Your Statistics</h3>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Games:</span>
            <span className={styles.statValue}>{stats.totalGames}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Wins:</span>
            <span className={styles.statValue}>{stats.wins}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Losses:</span>
            <span className={styles.statValue}>{stats.losses}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Draws:</span>
            <span className={styles.statValue}>{stats.draws}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Win %:</span>
            <span className={styles.statValue}>{stats.winRate}</span>
          </div>
        </div>
      </div>

      <h2 className={styles.playerTurn}>
        {gameState.currentPlayer === HUMAN_PLAYER 
          ? `Your turn Player ${gameState.currentPlayer}` 
          : "AI is thinking..."}
      </h2>

      <table className={styles.board}>
        <tbody>
          {[0, 1, 2].map((row) => (
            <tr key={row}>
              {[0, 1, 2].map((col) => {
                const position = row * 3 + col;
                const canClick = gameId !== null && gameState.currentPlayer === HUMAN_PLAYER && !winner;
                return (
                  <td
                    key={col}
                    onClick={() => void handleCellClick(position)}
                    className={styles.cell}
                    style={{
                      cursor: canClick ? 'pointer' : 'not-allowed',
                      opacity: canClick ? 1 : 0.7
                    }}
                  >
                    {gameState.board[position] || "_"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {winner ? (
        <h2 className={styles.statusOfGame}>
          {winner === HUMAN_PLAYER ? "You won!" : "AI won!"}
        </h2>
      ) : drawMessage ? (
        <h2 className={styles.statusOfGame}>{drawMessage}</h2>
      ) : (
        <h3 className={styles.statusOfGame}>
          {gameId === null ? "Click New Game to start" : "Game in progress..."}
        </h3>
      )}

      <button className={styles.btnNewGame} onClick={() => void handleNewGame()}>
        New Game
      </button>
    </div>
  );
}

function getInitialGame(): GameState {
  return createGame();
}

export default App;