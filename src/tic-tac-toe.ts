export type Player = "X" | "O"; // States that the player will either have a value of X or 0

export type Cell = Player | null; // States that the player will either have a value of Player(variable) or null

// Board is a 3x3 grid, represented as a 9-element array.
// Indices map to positions:
//  0 | 1 | 2
//  ---------
//  3 | 4 | 5
//  ---------
//  6 | 7 | 8
export type Board = [Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell]; // explicitly defines that there must be nine values to the board (cells)

// GameState bundles together everything that you need to describe the game at any moment in time. Two key pieces of information, the board (which cells and by whom) and the player

export type GameState = {
  id: string;
  board: Board;
  currentPlayer: Player;
};

// Function that defines the snapshot at the beginning of the game

export function createGame(): GameState {
  return {
    board: [null, null, null, null, null, null, null, null, null],
    currentPlayer: "X",
  };
}

// makeMove takes the current gamestate and a position and its job is to return a new game state reflecting that move

export function makeMove(state: GameState, position: number): GameState {
  // validation steps
  if (position < 0 || position > 8) throw new Error("Position must be between 0 and 8")
  if (getWinner(state) !== null) throw new Error("Game is already over")
  if (!Number.isInteger(position)) throw new Error("Position must be an integer")
  if (state.board[position] !== null) throw new Error("Position is already occupied")




  const newBoard: Board = [...state.board]
  newBoard[position] = state.currentPlayer

  const nextPlayer: Player = state.currentPlayer === "X" ? "O" : "X";

  return {
    board: newBoard,
    currentPlayer: nextPlayer,
  }
}

// takes a gamestate and checks whether someone has won

export function getWinner(state: GameState): Player | null {
  const board = state.board

  const winningCombinations = [
    // rows
    [0, 1, 2], //top row
    [3, 4, 5], //middle row
    [6, 7, 8], //bottom row
    //Columns
    [0, 3, 6], //left column
    [1, 4, 7], //middle column
    [2, 5, 8], //right column
    //diagonals
    [0, 4, 8],
    [2, 4, 6]
  ];  

  // Chekc each winning combination
  for (const combo of winningCombinations) {
    const [a, b, c] = combo;
    if (board[a] !== null && board[a] === board[b] && board[b] === board[c]) {
      return board[a] as Player; // return the winner
    } 
  }
  return null;
}

export function announceDraw(state: GameState): string | null {
  const boardIsFull = state.board.every((cell) => cell !== null);
  const noWinner = getWinner(state) === null;

  if (boardIsFull && noWinner) {
    return "It's a draw!";
  }
  return null;
}