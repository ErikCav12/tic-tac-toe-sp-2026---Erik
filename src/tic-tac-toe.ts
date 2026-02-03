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

//

export type GameState = {
  board: Board;
  currentPlayer: Player;
};

export function createGame(): GameState {
  return {
    board: [null, null, null, null, null, null, null, null, null],
    currentPlayer: "X",
  };
}

export function makeMove(state: GameState, position: number): GameState {
  return state
}

export function getWinner(state: GameState): Player | null {
  return null;
}
