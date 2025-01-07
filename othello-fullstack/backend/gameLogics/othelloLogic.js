export default class OthelloGame {
    constructor() {
      this.board = this.initializeBoard();
      this.currentTurn = 'b'; // Black starts
    }
  
    /**
     * Initializes the game board with the starting positions of the pieces.
     * The board is 8x8 with the pieces in the middle.
     * The top-left corner is at (0,0) and the bottom-right corner is at (7,7).
     * The pieces are placed as follows:
     *    b  |  w
     *  -----------
     *    w  |  b
     */
    initializeBoard() {
      const board = Array.from({ length: 8 }, () => Array(8).fill('_'));
  
      board[3][3] = 'w';
      board[4][4] = 'w';
      board[3][4] = 'b';
      board[4][3] = 'b';
  
      return board;
    }
  
    /**
     * Checks if a move is valid. A move is valid if it is in the 8x8 grid, the
     * cell is empty, and there is at least one opponent's piece that can be
     * flipped.
     * 
     * @param {number} row the row of the move
     * @param {number} col the column of the move
     * @param {string} piece the piece to be moved
     * @returns {boolean} true if the move is valid, false otherwise
     */
    isMoveValid(row, col, piece) {
      if (row < 0 || row >= 8 || col < 0 || col >= 8 || this.board[row][col] !== '_') {
        return false;
      }
      return this.checkDirection(row, col, piece, true);
    }
  
    /**
     * Checks if placing a piece at the given position would capture at least 
     * one of the opponent's pieces in any direction on the board.
     * 
     * @param {number} row the row index of the move
     * @param {number} col the column index of the move
     * @param {string} piece the current player's piece ('b' for black, 'w' for white)
     * @param {boolean} stopAtFirstValid if true, the function returns immediately upon 
     *                         finding the first valid capture direction
     * @returns {boolean} true if there is at least one valid capture direction, false otherwise
     */
    checkDirection(row, col, piece, stopAtFirstValid) {
      let isValid = false;
      const opponent = piece === 'b' ? 'w' : 'b';
      const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1], // Verticals and horizontals
        [-1, -1], [-1, 1], [1, -1], [1, 1] // Diagonals
      ];
  
      for (const [dx, dy] of directions) {
        let x = row + dx, y = col + dy;
        let hasOpponent = false;
  
        while (x >= 0 && x < 8 && y >= 0 && y < 8) {
          if (this.board[x][y] === opponent) {
            hasOpponent = true;
          } else if (this.board[x][y] === piece && hasOpponent) {
            if (stopAtFirstValid) return true;
            isValid = true;
            break;
          } else {
            break;
          }
          x += dx;
          y += dy;
        }
      }
      return isValid;
    }
  
    /**
     * Flips opponent's pieces on the board in all valid directions starting from 
     * the specified position, following a valid move by the current player.
     * 
     * @param {number} row the row index of the move
     * @param {number} col the column index of the move
     * @param {string} piece the current player's piece ('b' for black, 'w' for white)
     */
    flipPieces(row, col, piece) {
      const opponent = piece === 'b' ? 'w' : 'b';
      const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1], // Verticals and horizontals
        [-1, -1], [-1, 1], [1, -1], [1, 1] // Diagonals
      ];
  
      for (const [dx, dy] of directions) {
        let x = row + dx, y = col + dy;
        let hasOpponent = false;
  
        while (x >= 0 && x < 8 && y >= 0 && y < 8) {
          if (this.board[x][y] === opponent) {
            hasOpponent = true;
          } else if (this.board[x][y] === piece && hasOpponent) {
            let flipX = row + dx, flipY = col + dy;
            while (flipX !== x || flipY !== y) {
              this.board[flipX][flipY] = piece;
              flipX += dx;
              flipY += dy;
            }
            break;
          } else {
            break;
          }
          x += dx;
          y += dy;
        }
      }
    }
  
    /**
     * Check if there is a valid move for the given piece ('b' for black, 'w' for white)
     * on the current board.
     * 
     * @param {string} piece the current player's piece ('b' for black, 'w' for white)
     * @returns {boolean} true if there is a valid move for the given piece, false otherwise
     */
    hasValidMove(piece) {
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          if (this.isMoveValid(i, j, piece)) {
            return true;
          }
        }
      }
      return false;
    }
  
    /**
     * Play a turn on the current board.
     * 
     * @param {number} row the row of the move (0-7)
     * @param {number} col the column of the move (0-7)
     */
    playTurn(row, col) {
      if (this.isMoveValid(row, col, this.currentTurn)) {
        this.board[row][col] = this.currentTurn;
        this.flipPieces(row, col, this.currentTurn);
        this.currentTurn = this.currentTurn === 'b' ? 'w' : 'b';
        return true;
      } else {
        console.log("Invalid move! Try again.");
        return false;
      }
    }
  
    /**
     * Prints the current state of the board to the console.
     */
    printBoard() {
      for (const row of this.board) {
        console.log(row.join(' '));
      }
    }
  
    /**
     * Checks if the game is over.
     * 
     * A game is over when neither player has a valid move.
     * 
     * @returns {boolean} true if the game is over, false otherwise
     */
    isGameOver() {
      return !this.hasValidMove('b') && !this.hasValidMove('w');
    }
  }