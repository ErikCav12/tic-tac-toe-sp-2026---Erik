import { useState, useEffect } from "react";
import { createGame, makeMove, getWinner, announceDraw, type GameState, type Player } from "./tic-tac-toe";
import { getAIMove } from "./ai";
import styles from "./App.module.css";

type AppProps = {
  gameId?: string | null;
  onBackToLobby?: () => void;
};

const HUMAN: Player = "X";
const AI: Player = "O";

function App({ gameId = null, onBackToLobby }: AppProps) {
  const [gameState, setGameState] = useState(createGame);
  const [loading, setLoading] = useState(!!gameId);
  const [stats, setStats] = useState({ totalGames: 0, wins: 0, losses: 0, draws: 0, winRate: 0 });

  const winner = getWinner(gameState);
  const drawMessage = announceDraw(gameState);
  const gameOver = winner !== null || drawMessage !== null;

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!gameId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/game/${gameId}`)
      .then((r) => {
        if (r.status === 404) {
          onBackToLobby?.();
          return null;
        }
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data: GameState | null) => {
        if (data) setGameState(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [gameId, onBackToLobby]);

  useEffect(() => {
    if (!gameOver) return;
    const moves = gameState.board.filter((c) => c !== null).length;
    fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winner: winner ?? null, moves }),
    })
      .then(() => fetch("/api/stats").then((r) => r.json()).then(setStats))
      .catch(() => {});
  }, [gameOver]);

  const handleCellClick = async (position: number) => {
    if (gameState.currentPlayer !== HUMAN || gameOver) return;
    if (gameId) {
      try {
        const r = await fetch(`/move/${gameId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ position }),
        });
        if (r.ok) setGameState(await r.json());
      } catch {}
      return;
    }
    setGameState(makeMove(gameState, position));
  };

  const handleNewGame = () => {
    if (gameId) return;
    setGameState(createGame());
  };

  useEffect(() => {
    if (gameState.currentPlayer !== AI || gameOver) return;
    const t = setTimeout(async () => {
      const pos = getAIMove(gameState);
      if (gameId) {
        try {
          const r = await fetch(`/move/${gameId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ position: pos }),
          });
          if (r.ok) setGameState(await r.json());
        } catch {}
      } else {
        setGameState(makeMove(gameState, pos));
      }
    }, 500);
    return () => clearTimeout(t);
  }, [gameId, gameState, gameOver]);

  if (loading) {
    return (
      <div className={styles.layout}>
        <h1 className={styles.title}>Tic-Tac-Toe</h1>
        <p className={styles.statusOfGame}>Loading game…</p>
        {onBackToLobby && (
          <button type="button" className={styles.btnNewGame} onClick={onBackToLobby}>
            Back to Lobby
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <h1 className={styles.title}>Tic-Tac-Toe</h1>
      <div className={styles.statsContainer}>
        <h3 className={styles.statsTitle}>Stats</h3>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}><span className={styles.statLabel}>Games</span><span className={styles.statValue}>{stats.totalGames}</span></div>
          <div className={styles.statItem}><span className={styles.statLabel}>Wins</span><span className={styles.statValue}>{stats.wins}</span></div>
          <div className={styles.statItem}><span className={styles.statLabel}>Losses</span><span className={styles.statValue}>{stats.losses}</span></div>
          <div className={styles.statItem}><span className={styles.statLabel}>Draws</span><span className={styles.statValue}>{stats.draws}</span></div>
          <div className={styles.statItem}><span className={styles.statLabel}>Win %</span><span className={styles.statValue}>{stats.winRate}</span></div>
        </div>
      </div>
      <h2 className={styles.playerTurn}>
        {gameState.currentPlayer === HUMAN ? "Your turn" : "AI thinking…"}
      </h2>
      <table className={styles.board}>
        <tbody>
          {[0, 1, 2].map((row) => (
            <tr key={row}>
              {[0, 1, 2].map((col) => {
                const pos = row * 3 + col;
                const canClick = gameState.currentPlayer === HUMAN && !gameOver;
                return (
                  <td
                    key={col}
                    onClick={() => handleCellClick(pos)}
                    className={styles.cell}
                    style={{ cursor: canClick ? "pointer" : "not-allowed", opacity: canClick ? 1 : 0.7 }}
                  >
                    {gameState.board[pos] ?? "_"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {winner && <h2 className={styles.statusOfGame}>{winner === HUMAN ? "You won!" : "AI won!"}</h2>}
      {drawMessage && !winner && <h2 className={styles.statusOfGame}>{drawMessage}</h2>}
      {!gameOver && <h3 className={styles.statusOfGame}>In progress…</h3>}
      {!gameId && <button className={styles.btnNewGame} onClick={handleNewGame}>New Game</button>}
      {onBackToLobby && <button type="button" className={styles.btnNewGame} onClick={onBackToLobby}>Lobby</button>}
    </div>
  );
}

export default App;