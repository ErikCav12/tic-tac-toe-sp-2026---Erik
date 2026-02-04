import { useState } from "react";
import { createGame, makeMove, getWinner, announceDraw } from "./tic-tac-toe";
import styles from './App.module.css'


function App() {
  let [gameState, setGameState] = useState(getInitialGame())

  const handleCellClick = (position: number) => {
    setGameState(makeMove(gameState, position));
  }

  const winner = getWinner(gameState)

  const drawMessage = announceDraw(gameState)


  // TODO: display the gameState, and call `makeMove` when a player clicks a button
  // add in the winner is

  return (
    <div className={styles.layout}>
      <h1 className={styles.title}>Welcome to the World Championships of tic-tac-toe</h1>
      <h2 className={styles.playerTurn}>Your turn Player {gameState.currentPlayer}</h2>

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
                  >
                    {gameState.board[position] || "__"}
                    </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>


      {winner ? (
        <h2 className={styles.statusOfGame}>And the Winner is: {winner}</h2>
      ) : drawMessage ? (
        <h2 className={styles.statusOfGame}>{drawMessage}</h2>
      ) : (
        <h3 className={styles.statusOfGame}>Game in progress...</h3>
      )}

      <button className={styles.btnNewGame} onClick={() => setGameState(createGame())}>New Game</button>

    </div>
  )
}

function getInitialGame() {
  let initialGameState = createGame()
  return initialGameState
}

export default App;
