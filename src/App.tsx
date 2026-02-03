import { useState } from "react";
import { createGame, makeMove, getWinner } from "./tic-tac-toe";

function App() {
  let [gameState, setGameState] = useState(getInitialGame())

  const handleCellClick = (position: number) => {
    setGameState(makeMove(gameState, position));
  }

  const winner = getWinner(gameState)


  // TODO: display the gameState, and call `makeMove` when a player clicks a button
  // add in the winner is

  return (
    <div>
      <h1>Welcome to the World Championships of tic-tac-toe</h1>
      <table>
          <tbody>
            <tr>
              <td onClick={() => handleCellClick(0)}>
                {gameState.board[0] || "__"}
              </td>
              <td onClick={() => handleCellClick(1)}>
                {gameState.board[1] || "__"}
              </td>
              <td onClick={() => setGameState(makeMove(gameState, 2))}>
                {gameState.board[2] || "__"}
              </td>
            </tr>
            <tr>
              <td onClick={() => setGameState(makeMove(gameState, 3))}>
                {gameState.board[3] || "__"}
              </td>
              <td onClick={() => setGameState(makeMove(gameState, 4))}>
                {gameState.board[4] || "__"}
              </td>
              <td onClick={() => setGameState(makeMove(gameState, 5))}>
                {gameState.board[5] || "__"}
              </td>
            </tr>
            <tr>
              <td onClick={() => setGameState(makeMove(gameState, 6))}>
                {gameState.board[6] || "__"}
              </td>
              <td onClick={() => setGameState(makeMove(gameState, 7))}>
                {gameState.board[7] || "__"}
              </td>
              <td onClick={() => setGameState(makeMove(gameState, 8))}>
                {gameState.board[8] || "__"}
              </td>
            </tr>
          </tbody>
      </table>

      <h2>Current player: {gameState.currentPlayer}</h2>

      {winner ? (
        <h2>And the Winner is: {winner}</h2>
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
