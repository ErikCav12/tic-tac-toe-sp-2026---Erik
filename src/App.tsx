import { useState } from "react";
import { createGame, makeMove, getWinner, announceDraw } from "./tic-tac-toe";

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
    <div>
      <h1>Welcome to the World Championships of tic-tac-toe</h1>
      <table>
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

      <h2>Current player: {gameState.currentPlayer}</h2>

      {winner ? (
        <h2>And the Winner is: {winner}</h2>
      ) : drawMessage ? (
        <h2>{drawMessage}</h2>
      ) : (
        <h2>Game in progress...</h2>
      )}

      <button onClick={() => setGameState(createGame())}>Restart</button>

    </div>
  )
}

function getInitialGame() {
  let initialGameState = createGame()
  return initialGameState
}

export default App;
