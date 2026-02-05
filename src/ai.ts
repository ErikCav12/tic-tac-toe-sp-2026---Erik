import { createGame, makeMove, getWinner } from "./tic-tac-toe";
import type { GameState, Player, Board } from "./tic-tac-toe";

export function getAIMove(state: GameState): number {
    const board = state.board;
    const aiPlayer = state.currentPlayer; // AI is the current player
    const humanPlayer = aiPlayer === "X" ? "O" : "X";
    
    // Helper: Get all empty positions
    const getEmptyPositions = (): number[] => {
      return board
        .map((cell, index) => (cell === null ? index : null))
        .filter((index): index is number => index !== null);
    };
    
    // Helper: Check if a move would result in a win for a player
    const wouldWin = (position: number, player: Player): boolean => {
      const testBoard = [...board];
      testBoard[position] = player;
      const testState: GameState = { board: testBoard as Board, currentPlayer: player };
      return getWinner(testState) === player;
    };
    
    const emptyPositions = getEmptyPositions();
    
    // 1. Try to win - if AI can win, take that move
    for (const pos of emptyPositions) {
      if (wouldWin(pos, aiPlayer)) {
        return pos;
      }
    }
    
    // 2. Block opponent - if human can win, block them
    for (const pos of emptyPositions) {
      if (wouldWin(pos, humanPlayer)) {
        return pos;
      }
    }
    
    // 3. Take center if available
    if (board[4] === null) {
      return 4;
    }
    
    // 4. Take a corner if available
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(pos => board[pos] === null);
    if (availableCorners.length > 0) {
      return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }
    
    // 5. Take any available position (random)
    return emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
  }