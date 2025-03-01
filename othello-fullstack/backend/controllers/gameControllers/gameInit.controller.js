import OthelloGame from "../../gameLogics/othelloLogic.js";
// import { redis } from "../db/connectRedisDB.js";
import { nanoid } from "nanoid";
import { GAMEEXPIRYTIME, NANOIDLENGTH, PLAYERWAITTIME } from "../../constants.js";
import { othelloGameManager } from "./othelloGameManager.controller.js";

const InitHandler = (player1ID, player2ID) => {
    const game = new OthelloGame();
    const player1Color = Math.random() < 0.5 ? "black" : "white";
    const socket1ID= player1ID.split("#-#")[1];
    const socket2ID= player2ID.split("#-#")[1];
    const player1Id=player1ID.split("#-#")[0];
    const player2Id=player2ID.split("#-#")[0];
    const gameDetails = {
        board: game.board,
        player1: {
            id: player1Id,
            socket_id: socket1ID,
            name: "Player 1",
            color: player1Color
        },
        player2: {
            id: player2Id,
            socket_id: socket2ID,
            name: "Player 2",
            color: player1Color === "black" ? "white" : "black"
        },
        roomId: nanoid(NANOIDLENGTH),
        currentTurn: "b",
        blackCount: 2,
        whiteCount: 2,
        currentMatchStatus: "matched"
    };
    return gameDetails;
};

const generateInitResponse = (status, message, currentMatchStatus) => {
    return {
        status,
        message,
        currentMatchStatus
    };
};

export { InitHandler, generateInitResponse };
