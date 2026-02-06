import { getWinner, announceDraw, type GameState } from "../tic-tac-toe";
import styles from "../App.module.css";

type GamePreviewProps = {
  game: GameState;
  onOpenGame?: (id: string) => void;
};

function GamePreview({ game, onOpenGame }: GamePreviewProps) {
  const winner = getWinner(game);
  const drawMessage = announceDraw(game);

  const statusText = winner
    ? `${winner} won`
    : drawMessage
      ? "Draw"
      : `${game.currentPlayer}'s turn`;

  return (
    <div
      style={{
        border: "2px solid var(--screen-border, #2a2a4a)",
        borderRadius: 8,
        padding: 8,
        background: "var(--screen-bg, #0a0a1a)",
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: "var(--neon-green, #39ff14)",
          marginBottom: 6,
          textAlign: "center",
        }}
      >
        {game.id.slice(0, 8)}
      </div>
      <table
        style={{
          borderCollapse: "collapse",
          margin: "0 auto 8px",
        }}
      >
        <tbody>
          {[0, 1, 2].map((row) => (
            <tr key={row}>
              {[0, 1, 2].map((col) => {
                const position = row * 3 + col;
                const cell = game.board[position];
                return (
                  <td
                    key={col}
                    style={{
                      width: 24,
                      height: 24,
                      border: "1px solid var(--grid-line, #39ff14)",
                      textAlign: "center",
                      verticalAlign: "middle",
                      fontSize: 14,
                      color: cell === "X" ? "var(--neon-pink, #ff2e63)" : cell === "O" ? "var(--neon-blue, #08d9d6)" : undefined,
                    }}
                  >
                    {cell ?? "·"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div
        style={{
          fontSize: 8,
          color: "var(--neon-yellow, #eeff00)",
          textAlign: "center",
          marginBottom: 6,
        }}
      >
        {statusText}
      </div>
      {onOpenGame && (
        <button
          type="button"
          className={styles.btnNewGame}
          style={{ width: "100%", padding: "6px 8px", fontSize: 8 }}
          onClick={() => onOpenGame(game.id)}
        >
          Watch
        </button>
      )}
    </div>
  );
}

export default GamePreview;