import { useState, useEffect } from "react";
import type { GameState } from "../tic-tac-toe";
import GamePreview from "./GamePreview";
import styles from "../App.module.css";

type LobbyProps = {
  onNewGame?: (id: string) => void;
  onOpenGame?: (id: string) => void;
};

function Lobby({ onNewGame, onOpenGame }: LobbyProps) {
  const [games, setGames] = useState<GameState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/games");
      if (!r.ok) throw new Error();
      const data = await r.json();
      setGames(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load games");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  useEffect(() => {
    const id = setInterval(fetchGames, 3000);
    return () => clearInterval(id);
  }, []);

  const handleNewGame = async () => {
    setError(null);
    try {
      const r = await fetch("/create", { method: "POST" });
      if (!r.ok) throw new Error();
      const data = await r.json();
      onNewGame?.(data.id);
    } catch {
      setError("Failed to create game");
    }
  };

  if (loading && games.length === 0) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <h1 style={{ width: "100%", marginBottom: "1rem", color: "var(--neon-green, #39ff14)" }}>Lobby</h1>        <p className={styles.statusOfGame}>Loading…</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", textAlign: "center" }}>
        <h1 style={{ width: "100%", marginBottom: "1rem", color: "var(--neon-green, #39ff14)" }}>Lobby</h1>      {error && (
        <p style={{ color: "var(--neon-pink, #f24)", marginBottom: "0.5rem" }}>
          {error}
        </p>
      )}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1.5rem",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          className={styles.btnNewGame}
          onClick={handleNewGame}
        >
          New Game
        </button>
        <button
          type="button"
          className={styles.btnNewGame}
          onClick={fetchGames}
        >
          Refresh
        </button>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "1.5rem",
          padding: "16px 0",
          justifyContent: "center",
        }}
      >
        {games.map((g) => (
          <GamePreview key={g.id} game={g} onOpenGame={onOpenGame} />
        ))}
      </div>
      {games.length === 0 && !error && (
        <p style={{ width: "100%", marginBottom: "1rem", color: "var(--neon-green, #39ff14)", lineHeight: "1.5" }}>No games yet. Click New Game.</p>
      )}
    </div>
)};

export default Lobby;