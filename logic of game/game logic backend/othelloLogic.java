import java.util.Scanner;

public class othelloLogic {
    char[][] board = new char[8][8];
    char currentTurn;

    othelloLogic() {
        initializeBoard();
        currentTurn = 'b'; // Black starts
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
    void initializeBoard() {
        for (int i = 0; i < board.length; i++) {
            for (int j = 0; j < board[i].length; j++) {
                board[i][j] = '_';
            }
        }
        board[3][3] = 'w';
        board[4][4] = 'w';
        board[3][4] = 'b';
        board[4][3] = 'b';
    }

    /**
     * Checks if a move is valid. A move is valid if it is in the 8x8 grid, the
     * cell is empty, and there is at least one opponent's piece that can be
     * flipped.
     * 
     * @param row the row of the move
     * @param col the column of the move
     * @param piece the piece to be moved
     * @return true if the move is valid, false otherwise
     */
    boolean isMoveValid(int row, int col, char piece) {
        if (row < 0 || row >= 8 || col < 0 || col >= 8 || board[row][col] != '_') {
            return false;
        }
        return checkDirection(row, col, piece, true);
    }

    /**
     * Checks if placing a piece at the given position would capture at least 
     * one of the opponent's pieces in any direction on the board.
     * 
     * This method iterates through all possible directions (vertical, horizontal, 
     * and diagonal) from the specified position. It checks if there are any 
     * opponent pieces that can be captured by the current player's piece.
     * 
     * @param row the row index of the move
     * @param col the column index of the move
     * @param piece the current player's piece ('b' for black, 'w' for white)
     * @param stopAtFirstValid if true, the function returns immediately upon 
     *                         finding the first valid capture direction
     * @return true if there is at least one valid capture direction, false otherwise
     */

    boolean checkDirection(int row, int col, char piece, boolean stopAtFirstValid) {
        boolean isValid = false;
        char opponent = (piece == 'b') ? 'w' : 'b';
        int[][] directions = { { -1, 0 }, { 1, 0 }, { 0, -1 }, { 0, 1 }, // Verticals and horizontals
                { -1, -1 }, { -1, 1 }, { 1, -1 }, { 1, 1 } }; // Diagonals

        for (int[] dir : directions) {
            int dx = dir[0], dy = dir[1];
            int x = row + dx, y = col + dy;
            boolean hasOpponent = false;

            while (x >= 0 && x < 8 && y >= 0 && y < 8) {
                if (board[x][y] == opponent) {
                    hasOpponent = true;
                } else if (board[x][y] == piece && hasOpponent) {
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
 * This method checks all possible directions (vertical, horizontal, and diagonal)
 * from the specified position and flips the opponent's pieces to the current player's 
 * piece if they are bounded by the current player's pieces in that direction.
 * 
 * @param row the row index of the move
 * @param col the column index of the move
 * @param piece the current player's piece ('b' for black, 'w' for white)
 */

    void flipPieces(int row, int col, char piece) {
        char opponent = (piece == 'b') ? 'w' : 'b';
        int[][] directions = { { -1, 0 }, { 1, 0 }, { 0, -1 }, { 0, 1 }, // Verticals and horizontals
                { -1, -1 }, { -1, 1 }, { 1, -1 }, { 1, 1 } }; // Diagonals

        for (int[] dir : directions) {
            int dx = dir[0], dy = dir[1];
            int x = row + dx, y = col + dy;
            boolean hasOpponent = false;

            while (x >= 0 && x < 8 && y >= 0 && y < 8) {
                if (board[x][y] == opponent) {
                    hasOpponent = true;
                } else if (board[x][y] == piece && hasOpponent) {
                    // Flip pieces along this direction
                    int flipX = row + dx, flipY = col + dy;
                    while (flipX != x || flipY != y) {
                        board[flipX][flipY] = piece;
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
     * @param piece the current player's piece ('b' for black, 'w' for white)
     * @return true if there is a valid move for the given piece, false otherwise
     */
    boolean hasValidMove(char piece) {
        for (int i = 0; i < 8; i++) {
            for (int j = 0; j < 8; j++) {
                if (isMoveValid(i, j, piece)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Play a turn on the current board.
     * 
     * @param row     the row of the move (0-7)
     * @param col     the column of the move (0-7)
     * @param current the current player's piece ('b' for black, 'w' for white)
     */
    void playTurn(int row, int col) {
        if (isMoveValid(row, col, currentTurn)) {
            board[row][col] = currentTurn;
            flipPieces(row, col, currentTurn);
            currentTurn = (currentTurn == 'b') ? 'w' : 'b';
        } else {
            System.out.println("Invalid move! Try again.");
        }
    }

    /**
     * Prints the current state of the board to the console.
     * 
     * This method iterates over each cell of the board and prints
     * the contents, with each row printed on a new line. Each cell
     * is separated by a space.
     */

    void printBoard() {
        for (char[] row : board) {
            for (char cell : row) {
                System.out.print(cell + " ");
            }
            System.out.println();
        }
    }

    /**
     * Checks if the game is over.
     * 
     * A game is over when neither player has a valid move.
     * 
     * @return true if the game is over, false otherwise
     */
    boolean isGameOver() {
        return !hasValidMove('b') && !hasValidMove('w');
    }

    public static void main(String[] args) {
        othelloLogic game = new othelloLogic();
        Scanner sc = new Scanner(System.in);

        System.out.println("Othello Game Started!");
        game.printBoard();

        while (!game.isGameOver()) {
            System.out.println("Current Turn: " + game.currentTurn);
            System.out.println("Enter your move (row and column): ");
            int row = sc.nextInt();
            int col = sc.nextInt();

            if (game.isMoveValid(row, col, game.currentTurn)) {
                game.playTurn(row, col);
                game.printBoard();
            } else {
                System.out.println("Invalid move. Please try again.");
            }
        }

        System.out.println("Game Over!");
        int blackCount = 0, whiteCount = 0;
        for (char[] row : game.board) {
            for (char cell : row) {
                if (cell == 'b') blackCount++;
                if (cell == 'w') whiteCount++;
            }
        }
        System.out.println("Black: " + blackCount + " | White: " + whiteCount);
        System.out.println((blackCount > whiteCount) ? "Black Wins!" : (whiteCount > blackCount) ? "White Wins!" : "It's a tie!");
        sc.close();
    }
}
