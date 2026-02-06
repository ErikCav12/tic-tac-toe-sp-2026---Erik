import { useState, useEffect } from "react";
import Lobby from "./components/Lobby";
import App from "./App";
import styles from "./App.module.css";

const GAME_ID_KEY = "ticTacToeGameId";

function Root() {
  const [view, setView] = useState<"lobby" | "game">("lobby");
  const [activeGameId, setActiveGameId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(GAME_ID_KEY);
    if (stored) {
      setActiveGameId(stored);
      setView("game");
    }
  }, []);

  const goToLobby = () => {
    setView("lobby");
    setActiveGameId(null);
    localStorage.removeItem(GAME_ID_KEY);
  };

  const goToGame = (gameId: string | null) => {
    setActiveGameId(gameId);
    setView("game");
    if (gameId) localStorage.setItem(GAME_ID_KEY, gameId);
    else localStorage.removeItem(GAME_ID_KEY);
  };

  return (
    <div className={styles.layout}>
      {view === "lobby" && (
        <Lobby
          onNewGame={(id) => goToGame(id)}
          onOpenGame={(id) => goToGame(id)}
        />
      )}
      {view === "game" && (
        <App
          gameId={activeGameId}
          onBackToLobby={goToLobby}
        />
      )}
    </div>
  );
}

export default Root;