import { useState, useEffect } from "react";
import { createGame, makeMove, getWinner, announceDraw, type Player } from "./tic-tac-toe";
import { getAIMove } from "./ai";
import styles from './App.module.css';

function App() {
  const [gameState, setGameState] = useState(getInitialGame());
  const [moveCount, setMoveCount] = useState(0);
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

  // Fetch stats on component mount
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

  // Track move count
  useEffect(() => {
    const totalMoves = gameState.board.filter(cell => cell !== null).length;
    setMoveCount(totalMoves);
  }, [gameState.board]);

  // Save game when it ends
  useEffect(() => {
    if (winner !== null || drawMessage !== null) {
      const saveGame = async () => {
        try {
          await fetch("/api/games", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              winner: winner || null,
              moves: moveCount  // moveCount is already in scope
            })
          });
          fetchStats();
        } catch (error) {
          console.error("Failed to save game:", error);
        }
      };
      saveGame();
    }
  }, [winner, drawMessage]);  // Remove moveCount from here
  

  const handleCellClick = (position: number) => {
    if (gameState.currentPlayer !== HUMAN_PLAYER) return;
    if (winner !== null) return;
    
    setGameState(makeMove(gameState, position));
  };

  const handleNewGame = () => {
    setGameState(createGame());
    setMoveCount(0);
  };

  // AI automatically moves when it's AI's turn
  useEffect(() => {
    if (
      gameState.currentPlayer === AI_PLAYER &&
      winner === null &&
      drawMessage === null
    ) {
      const timer = setTimeout(() => {
        const aiPosition = getAIMove(gameState);
        setGameState(makeMove(gameState, aiPosition));
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [gameState, winner, drawMessage]);

  return (
    <div className={styles.layout}>
      <h1 className={styles.title}>Welcome to the World Championships of tic-tac-toe</h1>
      
      {/* Stats Display */}
      <div className={styles.statsContainer}>
        <h3 className={styles.statsTitle}>Your Statistics</h3>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Total Games:</span>
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
            <span className={styles.statLabel}>Win Rate:</span>
            <span className={styles.statValue}>{stats.winRate}%</span>
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
                return (
                  <td
                    key={col}
                    onClick={() => handleCellClick(position)}
                    className={styles.cell}
                    style={{
                      cursor: gameState.currentPlayer === HUMAN_PLAYER && !winner ? 'pointer' : 'not-allowed',
                      opacity: gameState.currentPlayer === HUMAN_PLAYER && !winner ? 1 : 0.7
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
        <h3 className={styles.statusOfGame}>Game in progress...</h3>
      )}

      <button className={styles.btnNewGame} onClick={handleNewGame}>
        New Game
      </button>
    </div>
  );
}

function getInitialGame() {
  return createGame();
}

export default App;