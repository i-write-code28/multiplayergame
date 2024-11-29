const createBoard = (pieceChoice) => {
  const arr = Array(8)
    .fill()
    .map(() => Array(8).fill("_"));

  // Initialize the center pieces
  arr[3][3] = "w";
  arr[4][4] = "w";
  arr[3][4] = "b";
  arr[4][3] = "b";

  const inversePieceChoice = pieceChoice === "b" ? "w" : "b";

  return { arr, inversePieceChoice };
};

const isMoveValid = (rowNumber, colNumber, pieceChoice, board) => {
  if (isCellEmpty(rowNumber, colNumber, board)) {
    if (
      isAdjacentMovementAllowed(rowNumber, colNumber, pieceChoice, board) ||
      isDiagonalAllowed(rowNumber, colNumber, pieceChoice, board)
    ) {
      // board.arr[rowNumber][colNumber] = pieceChoice;
      // flipPieces(rowNumber, colNumber, pieceChoice, board);
      return true;
    }
  }
  return false;
};
const makeMove = (rowNumber, colNumber, pieceChoice, board) => {
  if (isMoveValid(rowNumber, colNumber, pieceChoice, board)) {
    flipPieces(rowNumber, colNumber, pieceChoice, board);
    board.arr[rowNumber][colNumber] = pieceChoice;
    return true;
  } else {
    return false;
  }
};
const isCellEmpty = (rowNumber, colNumber, board) => {
  return board.arr[rowNumber][colNumber] === "_";
};

// Check if a move is valid in any adjacent direction (top, bottom, left, right)
const isAdjacentMovementAllowed = (
  rowNumber,
  colNumber,
  pieceChoice,
  board
) => {
  return (
    isTopValid(rowNumber, colNumber, pieceChoice, board) ||
    isBottomValid(rowNumber, colNumber, pieceChoice, board) ||
    isLeftValid(rowNumber, colNumber, pieceChoice, board) ||
    isRightValid(rowNumber, colNumber, pieceChoice, board)
  );
};

// Check vertical (top) direction
const isTopValid = (rowNumber, colNumber, pieceChoice, board) => {
  let count = 0;
  for (let i = rowNumber - 1; i >= 0; i--) {
    if (board.arr[i][colNumber] === "_") {
      return false;
    } else if (board.arr[i][colNumber] === pieceChoice) {
      return count > 0;
    } else if (board.arr[i][colNumber] === board.inversePieceChoice) {
      count++;
    }
  }
  return false;
};

// Check vertical (bottom) direction
const isBottomValid = (rowNumber, colNumber, pieceChoice, board) => {
  let count = 0;
  for (let i = rowNumber + 1; i < board.arr.length; i++) {
    if (board.arr[i][colNumber] === "_") {
      return false;
    } else if (board.arr[i][colNumber] === pieceChoice) {
      return count > 0;
    } else if (board.arr[i][colNumber] === board.inversePieceChoice) {
      count++;
    }
  }
  return false;
};

// Check horizontal (left) direction
const isLeftValid = (rowNumber, colNumber, pieceChoice, board) => {
  let count = 0;
  for (let i = colNumber - 1; i >= 0; i--) {
    if (board.arr[rowNumber][i] === "_") {
      return false;
    } else if (board.arr[rowNumber][i] === pieceChoice) {
      return count > 0;
    } else if (board.arr[rowNumber][i] === board.inversePieceChoice) {
      count++;
    }
  }
  return false;
};

// Check horizontal (right) direction
const isRightValid = (rowNumber, colNumber, pieceChoice, board) => {
  let count = 0;
  for (let i = colNumber + 1; i < board.arr.length; i++) {
    if (board.arr[rowNumber][i] === "_") {
      return false;
    } else if (board.arr[rowNumber][i] === pieceChoice) {
      return count > 0;
    } else if (board.arr[rowNumber][i] === board.inversePieceChoice) {
      count++;
    }
  }
  return false;
};

// Check if a move is valid in any diagonal direction (top-left, top-right, bottom-left, bottom-right)
const isDiagonalAllowed = (rowNumber, colNumber, pieceChoice, board) => {
  return (
    isTopLeftDiagonalValid(rowNumber, colNumber, pieceChoice, board) ||
    isTopRightDiagonalValid(rowNumber, colNumber, pieceChoice, board) ||
    isBottomLeftDiagonalValid(rowNumber, colNumber, pieceChoice, board) ||
    isBottomRightDiagonalValid(rowNumber, colNumber, pieceChoice, board)
  );
};

// Check main diagonal (top-left) direction
const isTopLeftDiagonalValid = (rowNumber, colNumber, pieceChoice, board) => {
  let count = 0;
  for (let i = rowNumber - 1, j = colNumber - 1; i >= 0 && j >= 0; i--, j--) {
    if (board.arr[i][j] === "_") {
      return false;
    } else if (board.arr[i][j] === pieceChoice) {
      return count > 0;
    } else if (board.arr[i][j] === board.inversePieceChoice) {
      count++;
    }
  }
  return false;
};

// Check main diagonal (top-right) direction
const isTopRightDiagonalValid = (rowNumber, colNumber, pieceChoice, board) => {
  let count = 0;
  for (
    let i = rowNumber - 1, j = colNumber + 1;
    i >= 0 && j < board.arr.length;
    i--, j++
  ) {
    if (board.arr[i][j] === "_") {
      return false;
    } else if (board.arr[i][j] === pieceChoice) {
      return count > 0;
    } else if (board.arr[i][j] === board.inversePieceChoice) {
      count++;
    }
  }
  return false;
};

// Check off diagonal (bottom-left) direction
const isBottomLeftDiagonalValid = (
  rowNumber,
  colNumber,
  pieceChoice,
  board
) => {
  let count = 0;
  for (
    let i = rowNumber + 1, j = colNumber - 1;
    i < board.arr.length && j >= 0;
    i++, j--
  ) {
    if (board.arr[i][j] === "_") {
      return false;
    } else if (board.arr[i][j] === pieceChoice) {
      return count > 0;
    } else if (board.arr[i][j] === board.inversePieceChoice) {
      count++;
    }
  }
  return false;
};

// Check off diagonal (bottom-right) direction
const isBottomRightDiagonalValid = (
  rowNumber,
  colNumber,
  pieceChoice,
  board
) => {
  let count = 0;
  for (
    let i = rowNumber + 1, j = colNumber + 1;
    i < board.arr.length && j < board.arr.length;
    i++, j++
  ) {
    if (board.arr[i][j] === "_") {
      return false;
    } else if (board.arr[i][j] === pieceChoice) {
      return count > 0;
    } else if (board.arr[i][j] === board.inversePieceChoice) {
      count++;
    }
  }
  return false;
};

// Flip pieces in all valid directions
const flipPieces = (rowNumber, colNumber, pieceChoice, board) => {
  // Flip vertically
  flipInDirection(rowNumber, colNumber, pieceChoice, board, "vertical");
  // Flip horizontally
  flipInDirection(rowNumber, colNumber, pieceChoice, board, "horizontal");
  // Flip diagonally
  flipInDirection(rowNumber, colNumber, pieceChoice, board, "diagonal");
};

// Generalized flip in any direction
const flipInDirection = (
  rowNumber,
  colNumber,
  pieceChoice,
  board,
  direction
) => {
  let directions = [];
  if (direction === "vertical") {
    directions = [
      { stepRow: -1, stepCol: 0 }, // top
      { stepRow: 1, stepCol: 0 }, // bottom
    ];
  } else if (direction === "horizontal") {
    directions = [
      { stepRow: 0, stepCol: -1 }, // left
      { stepRow: 0, stepCol: 1 }, // right
    ];
  } else if (direction === "diagonal") {
    directions = [
      { stepRow: -1, stepCol: -1 }, // top-left
      { stepRow: -1, stepCol: 1 }, // top-right
      { stepRow: 1, stepCol: -1 }, // bottom-left
      { stepRow: 1, stepCol: 1 }, // bottom-right
    ];
  }

  directions.forEach((dir) => {
    let i = rowNumber + dir.stepRow;
    let j = colNumber + dir.stepCol;
    let flipPositions = [];
    while (i >= 0 && i < 8 && j >= 0 && j < 8) {
      if (board.arr[i][j] === pieceChoice) {
        flipPositions.forEach(([x, y]) => {
          board.arr[x][y] = pieceChoice;
        });
        break;
      }
      if (board.arr[i][j] === "_") {
        break;
      }
      flipPositions.push([i, j]);
      i += dir.stepRow;
      j += dir.stepCol;
    }
  });
};
const playerPiecesBlendBg = (count, currplayer) => {
  if (currplayer === "b") {
    for (let i = 0; i < count; i++) {
      document.querySelectorAll(`.show-player-piece[data-player="1"]`)[
        i
      ].style.background = "none";
    }
  } else if (currplayer === "w") {
    for (let i = 0; i < count; i++) {
      document.querySelectorAll(`.show-player-piece[data-player="2"]`)[
        i
      ].style.background = "none";
    }
  }
};
const displayCurrentPlayer = (currplayer) => {
  document.querySelector(".player1").style.border = "none";
  document.querySelector(".player2").style.border = "none";
  if (currplayer === "b") {
    document.querySelector(".player1").style.border = "2px solid #fff";
  } else {
    document.querySelector(".player2").style.border = "2px solid #fff";
  }
};
const handleTurnSkipping = () => {
  let hints = getHintsLocation(pieceChoice);

  // If current player has no valid moves
  if (!hints.flat().some((hint) => hint === true)) {
    // Inform the player of skipped turn
    let msgPopup = document.querySelector(".message-popup");
    msgPopup.dataset.severity = "warning";
    msgPopup.style.bottom = "10px";
    msgPopup.innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="color:yellow; margin:0px 10px 0px 0px"></i> No valid move left for player ${pieceChoice}. Turn skipped.`;

    // Skip the turn and update the UI
    setTimeout(() => {
      msgPopup.style.bottom = "-100px";
    }, 2000);

    // Switch to the other player
    pieceChoice = pieceChoice === "b" ? "w" : "b";
    board.inversePieceChoice = pieceChoice === "b" ? "w" : "b";

    // Update player piece UI and current player display
    displayCurrentPlayer(pieceChoice);
    showHints(); // Show hints for the new player (if enabled)

    console.log(`No valid moves for player ${pieceChoice}. Turn is skipped.`);
  }
};

let rowNumber,
  colNumber,
  pieceChoice = "b";
let board = createBoard(pieceChoice);

let playerPiecesUsed = { b: 2, w: 2 }; // Track pieces used by each player
playerPiecesBlendBg(2, "b");
playerPiecesBlendBg(2, "w");
displayCurrentPlayer(pieceChoice);

document.querySelectorAll(".cell").forEach((cell) => {
  cell.addEventListener("click", function () {
    rowNumber = parseInt(this.getAttribute("data-row"));
    colNumber = parseInt(this.getAttribute("data-column"));
    const hints = getHintsLocation(pieceChoice);
    if (hints.flat().some((hint) => hint === true)) {
      if (makeMove(rowNumber, colNumber, pieceChoice, board)) {
        playerPiecesUsed[pieceChoice]++;
        playerPiecesBlendBg(playerPiecesUsed[pieceChoice], pieceChoice);

        printBoard(); // Update board visuals
        pieceChoice = pieceChoice === "b" ? "w" : "b"; // Toggle player turn
        board.inversePieceChoice = pieceChoice === "b" ? "w" : "b";
        if (hintCheckbox.checked) {
          showHints();
        } else {
          clearHints();
        }

        console.log(`Current player: ${pieceChoice}`);
        let Winner = scoreWinner();
        displayScores(Winner.blackScore, Winner.whiteScore, Winner.winner);
        displayCurrentPlayer(pieceChoice);
      } else {
        let msgPopup = document.querySelector(".message-popup");
        msgPopup.dataset.severity = "error";
        msgPopup.style.bottom = "10px";
        msgPopup.innerHTML = `<i class="fa-solid fa-circle-exclamation" style="color:red; margin:0px 10px 0px 0px"></i> Invalid move!`;
        setTimeout(() => {
          msgPopup.style.bottom = "-100px";
        }, 2000);
      }
    } else {
      handleTurnSkipping();
    }
  });
});

const pieceHtml = ` <div class="piece">
                    <input type="checkbox" class="black-piece">
                    <input type="checkbox" class="white-piece">
                   </div>`;

const printBoard = () => {
  board.arr.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      const cellElement = document.querySelector(
        `.cell[data-row="${rowIndex}"][data-column="${colIndex}"]`
      );

      if (cell === "w") {
        if (cellElement) {
          cellElement.innerHTML = pieceHtml;

          const whitePiece = cellElement.querySelector(".white-piece");
          if (whitePiece) {
            whitePiece.checked = true;
          }
          const blackPiece = cellElement.querySelector(".black-piece");
          if (blackPiece) {
            blackPiece.checked = false;
          }
        }
      } else if (cell === "b") {
        if (cellElement) {
          cellElement.innerHTML = pieceHtml;

          const blackPiece = cellElement.querySelector(".black-piece");
          if (blackPiece) {
            blackPiece.checked = true;
          }
          const whitePiece = cellElement.querySelector(".white-piece");
          if (whitePiece) {
            whitePiece.checked = false;
          }
        }
      } else {
        if (cellElement) {
          cellElement.innerHTML = "";
        }
      }
    });
  });
};

printBoard();
const checkEndCondition = () => {
  let count = 0;
  for (const row of board.arr) {
    for (const cell of row) {
      if (cell === "_") {
        count++;
        if (count != 0) {
          if (getHintsLocation(pieceChoice)) {
            return false;
          }
          if (!getHintsLocation(pieceChoice)) {
            if (getHintsLocation(inversePieceChoice)) {
              return false;
            } else {
              return true;
            }
          }
        }
      }
    }
  }
  return true;
};
const scoreWinner = () => {
  let blackScore = 0,
    whiteScore = 0;
  if (checkEndCondition()) {
    board.arr.forEach((row) => {
      row.forEach((cell) => {
        if (cell === "b") {
          blackScore++;
        } else {
          whiteScore++;
        }
      });
    });
  }
  let winner;
  if (!(blackScore === 0 && whiteScore === 0)) {
    if (blackScore > whiteScore) {
      winner = "b";
    } else if (whiteScore === blackScore) {
      winner = "s";
    } else {
      winner = "w";
    }
  }
  displayScores(blackScore, whiteScore, winner);
  return { blackScore, whiteScore, winner };
};
let hintsLocations = [];
const getHintsLocation = (pieceChoice) => {
  hintsLocations = Array.from({ length: board.arr.length }, () =>
    Array(board.arr[0].length).fill(false)
  );

  for (let i = 0; i < board.arr.length; i++) {
    for (let j = 0; j < board.arr[i].length; j++) {
      hintsLocations[i][j] = isMoveValid(i, j, pieceChoice, board);
    }
  }
  return hintsLocations;
};
const showHints = () => {
  const hints = getHintsLocation(pieceChoice);
  for (let i = 0; i < hints.length; i++) {
    for (let j = 0; j < hints[i].length; j++) {
      const cellElement = document.querySelector(
        `.cell[data-row="${i}"][data-column="${j}"]`
      );
      if (hints[i][j] && cellElement) {
        cellElement.style.border = "thin solid #ADFF2F";
      } else if (cellElement) {
        cellElement.style.border = "none";
      }
    }
  }
};
const clearHints = () => {
  document.querySelectorAll(".cell").forEach((cell) => {
    cell.style.border = "none";
  });
};
const hintCheckbox = document.querySelector("#showHints");
hintCheckbox.addEventListener("change", () => {
  if (hintCheckbox.checked) {
    // If the checkbox is checked, show the hints
    showHints();
  } else {
    // If the checkbox is unchecked, clear the hints from the board
    clearHints();
  }
});
const displayScores = (blackScore, whiteScore, winner) => {
  let winnerName;
  if (winner === "b") {
    winnerName = `Player1(black) wins by ${Math.abs(
      blackScore - whiteScore
    )} over Player2(white)`;
  } else if (winner === "w") {
    winnerName = `Player2(white) wins by ${Math.abs(
      blackScore - whiteScore
    )} over Player1(black)`;
  } else {
    winnerName = "Its a stalement";
  }
  if (blackScore != 0 && whiteScore != 0) {
    ScoreboardHTML = ` <div class="scoreboard-content">
  <h1 class="winner-name wood-burn">${winnerName}</h1>
  <span class="black-score wood-burn">Black Score:${blackScore}</span>
  <span class="white-score wood-burn"> White Score:${whiteScore}</span>
  </div>
  <div class="half top-half"></div>
<div class="half bottom-half"></div>`;
    showBackdrop();
    document.querySelector(".scoreboard").style.display = "block";
    document.querySelector(".scoreboard").innerHTML = ScoreboardHTML;
  }
};
const showBackdrop = () => {
  document.querySelector(".backdrop").style.display = "block";
};
const hideBackdrop = () => {
  document.querySelector(".backdrop").style.display = "none";
};
let gameMode;
// const showModes=()=>{
//   showBackdrop();
// document.querySelector("#start-button").addEventListener('click',()=>{
//   if(document.querySelector("#player-v-computer").checked){
//     gameMode="computer"
//   }
//   else{
//     gameMode="player"
//   }
//   document.querySelector(".modes-selector-outer").innerHTML=` <div class="half top-half-reverse"></div>
// <div class="half bottom-half-reverse"></div>`;
// document.querySelector(".modes-selector-outer").style.animation='fadeIn 0.5s ease-in 1.2s reverse';
// document.querySelector(".modes-selector-outer").style.top='25%';
// setTimeout(() => {
//   document.querySelector(".modes-selector-outer").style.opacity='0';
// }, 1700);
// })
// };
// showModes();
