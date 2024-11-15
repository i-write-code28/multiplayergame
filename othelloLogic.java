public class othelloLogic {
    char arr[][] = new char[8][8];
    char inversePieceChoice;

    othelloLogic(char pieceChoice) {

        for (int i = 0; i < arr.length; i++) {
            for (int j = 0; j < arr.length; j++) {
                if (i == 3 && j == 3) {
                    arr[i][j] = 'w';
                } else if (i == 4 && j == 4) {
                    arr[i][j] = 'w';
                } else if (i == 3 && j == 4) {
                    arr[i][j] = 'b';
                } else if (i == 4 && j == 3) {
                    arr[i][j] = 'b';
                } else {
                    arr[i][j] = '_';
                }
            }
        }
        inversePieceChoice = (pieceChoice == 'b') ? 'w' : 'b';
    }

    boolean isMoveValid(int rowNumber, int colNumber, char pieceChoice) {
        if (isCellEmpty(rowNumber, colNumber, pieceChoice)) {
            if (isAdjacentMovementAllowed(rowNumber, colNumber, pieceChoice)) {
                arr[rowNumber][colNumber]=pieceChoice;
                return true;
            } else if (isDiagonalAllowed(rowNumber, colNumber, pieceChoice)) {
                arr[rowNumber][colNumber]=pieceChoice;
                return true;
            } else {
                return false;
            }

        }
        return false;
    }

    boolean isCellEmpty(int rowNumber, int colNumber, char pieceChoice) {
        return (arr[rowNumber][colNumber] == '_') ? true : false;
    }

    boolean isTopValid(int rowNumber, int colNumber, char pieceChoice) {

        int count = 0;
        for (int i = rowNumber - 1; i >= 0; i--) {
            if (arr[i][colNumber] == '_') {
                return false;
            } else if (arr[i][colNumber] == pieceChoice) {
                return count > 0;
            } else if (arr[i][colNumber] == inversePieceChoice) {
                count++;
            }
        }
        return false;
    }

    boolean isLeftValid(int rowNumber, int colNumber, char pieceChoice) {

        int count = 0;
        for (int i = colNumber - 1; i >= 0; i--) {
            if (arr[rowNumber][i] == '_') {
                return false;
            } else if (arr[rowNumber][i] == pieceChoice) {
                return count > 0;
            } else if (arr[rowNumber][i] == inversePieceChoice) {
                count++;
            }
        }
        return false;
    }

    boolean isBottomValid(int rowNumber, int colNumber, char pieceChoice) {

        int count = 0;
        for (int i = rowNumber + 1; i < arr.length; i++) {
            if (arr[i][colNumber] == '_') {
                return false;
            } else if (arr[i][colNumber] == pieceChoice) {
                return count > 0;
            } else if (arr[i][colNumber] == inversePieceChoice) {
                count++;
            }
        }
        return false;
    }

    boolean isRightValid(int rowNumber, int colNumber, char pieceChoice) {

        int count = 0;
        for (int i = colNumber + 1; i < arr.length; i++) {
            if (arr[rowNumber][i] == '_') {
                return false;
            } else if (arr[rowNumber][i] == pieceChoice) {
                return count > 0;
            } else if (arr[rowNumber][i] == inversePieceChoice) {
                count++;
            }
        }
        return false;
    }

    boolean isAdjacentMovementAllowed(int rowNumber, int colNumber, char pieceChoice) {
        return (isTopValid(rowNumber, colNumber, pieceChoice) || isBottomValid(rowNumber, colNumber, pieceChoice)
                || isLeftValid(rowNumber, colNumber, pieceChoice) || isRightValid(rowNumber, colNumber, pieceChoice))
                        ? true
                        : false;
    }

    boolean isTopMainDiagonalValid(int rowNumber, int colNumber, char pieceChoice) {
        int count = 0;
        for (int i = rowNumber, j = colNumber; i >= 0 && j < arr.length; i--, j++) {
            if (arr[i][j] == '_') {
                return false;
            } else if (arr[i][j] == pieceChoice) {
                return count > 0;
            } else if (arr[i][j] == inversePieceChoice) {
                count++;
            }
        }
        return false;
    }

    boolean isBottomMainDiagonalValid(int rowNumber, int colNumber, char pieceChoice) {
        int count = 0;
        for (int i = rowNumber, j = colNumber; i < arr.length && j < arr.length; i++, j++) {
            if (arr[i][j] == '_') {
                return false;
            } else if (arr[i][j] == pieceChoice) {
                return count > 0;
            } else if (arr[i][j] == inversePieceChoice) {
                count++;
            }
        }
        return false;
    }

    boolean isTopOffDiagonalValid(int rowNumber, int colNumber, char pieceChoice) {
        int count = 0;
        for (int i = rowNumber, j = colNumber; i >= 0 && j >= 0; i--, j--) {
            if (arr[i][j] == '_') {
                return false;
            } else if (arr[i][j] == pieceChoice) {
                return count > 0;
            } else if (arr[i][j] == inversePieceChoice) {
                count++;
            }
        }
        return false;
    }

    boolean isBottomOffDiagonalValid(int rowNumber, int colNumber, char pieceChoice) {
        int count = 0;
        for (int i = rowNumber, j = colNumber; j >= 0 && i < arr.length; j--, i++) {
            if (arr[i][j] == '_') {
                return false;
            } else if (arr[i][j] == pieceChoice) {
                return count > 0;
            } else if (arr[i][j] == inversePieceChoice) {
                count++;
            }
        }
        return false;
    }

    boolean isDiagonalAllowed(int rowNumber, int colNumber, char pieceChoice) {
        return (isTopMainDiagonalValid(rowNumber, colNumber, pieceChoice)
                || isBottomMainDiagonalValid(rowNumber, colNumber, pieceChoice)
                || isTopOffDiagonalValid(rowNumber, colNumber, pieceChoice)
                || isBottomOffDiagonalValid(rowNumber, colNumber, pieceChoice)) ? true : false;
    }

    // ---------------------logic for validity ends --------------------------
    void flipPieces(int rowNumber, int colNumber, char pieceChoice) {
        // Flip pieces in the upward vertical direction
        if (isTopValid(rowNumber, colNumber, pieceChoice)) {
            for (int i = rowNumber - 1; i >= 0 && arr[i][colNumber] == inversePieceChoice; i--) {
                arr[i][colNumber] = pieceChoice;
            }
        }

        // Flip pieces in the downward vertical direction
        if (isBottomValid(rowNumber, colNumber, pieceChoice)) {
            for (int i = rowNumber + 1; i < arr.length && arr[i][colNumber] == inversePieceChoice; i++) {
                arr[i][colNumber] = pieceChoice;
            }
        }

        // Flip pieces in the leftward horizontal direction
        if (isLeftValid(rowNumber, colNumber, pieceChoice)) {
            for (int i = colNumber - 1; i >= 0 && arr[rowNumber][i] == inversePieceChoice; i--) {
                arr[rowNumber][i] = pieceChoice;
            }
        }

        // Flip pieces in the rightward horizontal direction
        if (isRightValid(rowNumber, colNumber, pieceChoice)) {
            for (int i = colNumber + 1; i < arr.length && arr[rowNumber][i] == inversePieceChoice; i++) {
                arr[rowNumber][i] = pieceChoice;
            }
        }

        // Flip pieces in the upward-right main diagonal direction
        if (isTopMainDiagonalValid(rowNumber, colNumber, pieceChoice)) {
            for (int i = rowNumber - 1, j = colNumber + 1; i >= 0 && j < arr.length
                    && arr[i][j] == inversePieceChoice; i--, j++) {
                arr[i][j] = pieceChoice;
            }
        }

        // Flip pieces in the downward-right main diagonal direction
        if (isBottomMainDiagonalValid(rowNumber, colNumber, pieceChoice)) {
            for (int i = rowNumber + 1, j = colNumber + 1; i < arr.length && j < arr.length
                    && arr[i][j] == inversePieceChoice; i++, j++) {
                arr[i][j] = pieceChoice;
            }
        }

        // Flip pieces in the upward-left off-diagonal direction
        if (isTopOffDiagonalValid(rowNumber, colNumber, pieceChoice)) {
            for (int i = rowNumber - 1, j = colNumber - 1; i >= 0 && j >= 0
                    && arr[i][j] == inversePieceChoice; i--, j--) {
                arr[i][j] = pieceChoice;
            }
        }

        // Flip pieces in the downward-left off-diagonal direction
        if (isBottomOffDiagonalValid(rowNumber, colNumber, pieceChoice)) {
            for (int i = rowNumber + 1, j = colNumber - 1; i < arr.length && j >= 0
                    && arr[i][j] == inversePieceChoice; i++, j--) {
                arr[i][j] = pieceChoice;
            }
        }
    }

    public static void main(String[] args) {
       

    }
} 
