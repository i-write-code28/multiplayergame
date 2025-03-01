import OthelloGame from "../../gameLogics/othelloLogic.js";
import { redis } from "../../db/connectRedisDB.js";
import { generateInitResponse } from "./gameInit.controller.js";
import { handleDisconnect } from "./gameConnect.controller.js";
async function othelloGameManager(gameIo, gameDetails) {
    const game = new OthelloGame();
    const sockets = await gameIo.in(gameDetails.roomId).fetchSockets();
    let player1, player2;

    if (sockets[0].id === gameDetails.player1.socket_id) {
        player1 = sockets[0];
        player2 = sockets[1];
    } else {
        player1 = sockets[1];
        player2 = sockets[0];
    }

    async function handleMove(player, opponent, playerDetails, data) {
        const currentGame = JSON.parse(await redis.get(gameDetails.roomId));
        if (currentGame.currentTurn === playerDetails.color.charAt(0)) {
            game.board = currentGame.board;
            game.currentTurn = currentGame.currentTurn;
            let moveHistory = currentGame.moveHistory || [];

            if (game.playTurn(data.row, data.col)) {
                let blackCount = 0, whiteCount = 0;
                game.board.forEach(row => row.forEach(cell => {
                    if (cell === "b") blackCount++;
                    if (cell === "w") whiteCount++;
                }));

                moveHistory.push({ [playerDetails.id]: `r${data.row}c${data.col}` });
                const updatedGame = {
                    ...gameDetails,
                    board: game.board,
                    currentTurn: playerDetails.color === "black" ? "w" : "b",
                    moveHistory,
                    blackCount,
                    whiteCount,
                    currentMatchStatus: "in progress"
                };

                if (game.isGameOver()) {
                    const winner = blackCount > whiteCount ? "black" : whiteCount > blackCount ? "white" : "draw";
                    const gameOverData = { ...updatedGame, currentMatchStatus: "game_over", winner, finalScores: { black: blackCount, white: whiteCount } };
                    await redis.set(gameDetails.roomId, JSON.stringify(gameOverData));
                    gameIo.to(gameDetails.roomId).emit('game_over', gameOverData);
                } else {
                    await redis.set(gameDetails.roomId, JSON.stringify(updatedGame));
                    gameIo.to(gameDetails.roomId).emit('game_update', { ...updatedGame, status: 200, message: "Move accepted" });
                }
            } else {
                player.emit('game_update', generateInitResponse(400, "Invalid Move", "in progress"));
            }
        } else {
            player.emit('game_update', generateInitResponse(400, "Not your turn", "in progress"));
        }
    }

    player1.on("move", (data) => handleMove(player1, player2, gameDetails.player1, data));
    player2.on("move", (data) => handleMove(player2, player1, gameDetails.player2, data));
    player1.on("disconnect",()=>{
        handleDisconnect(gameDetails.player1,gameDetails.player2,gameDetails,gameIo)
    })
    player2.on("disconnect",()=>{
        handleDisconnect(gameDetails.player2,gameDetails.player1,gameDetails,gameIo)
    })
    player1.on("resign", () => handleResign(player1, player2));
    player2.on("resign", () => handleResign(player2, player1));
}

async function handleResign(player, opponent) {
    const currentGame = JSON.parse(await redis.get(gameDetails.roomId));
    const gameOverData = {
        ...currentGame,
        currentMatchStatus: "game_over",
        winner: opponent.color,
        reason: "Player resigned"
    };
    await redis.set(gameDetails.roomId, JSON.stringify(gameOverData));
    gameIo.to(gameDetails.roomId).emit('game_over', gameOverData);
}

export { othelloGameManager };
