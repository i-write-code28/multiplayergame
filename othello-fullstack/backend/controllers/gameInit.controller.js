import OthelloGame from "../gameLogics/othelloLogic.js";
import { redis } from "../db/connectRedisDB.js";
import { nanoid } from "nanoid";
import { GAMEEXPIRYTIME, NANOIDLENGTH, PLAYERWAITTIME } from "../constants.js";
import { othelloGameManager } from "./othelloGameManager.controller.js";
const InitHandler = (player1ID, player2ID,) => {
    const game = new OthelloGame();
    const player1Color = Math.random() < 0.5 ? "black" : "white";
    const gameDetails = {
        board: game.board,
        player1: {
            id: player1ID,
            name: "Player 1",
            color: player1Color
        },
        player2: {
            id: player2ID,
            name: "Player 2",
            color: player1Color === "black" ? "white" : "black"
        },
        roomId: nanoid(NANOIDLENGTH),
        currentTurn:"b",
        blackCount:2,
        whiteCount:2,
        currentMatchStatus: "matched"
    };
    return gameDetails;
};

const generateInitResponse = (status, message, currentMatchStatus) => {
    const responseStatus = {
        status: status,
        message: message,
        currentMatchStatus: currentMatchStatus
    };
    return responseStatus;
};

async function playersConnect(gameIo, socket) {
    socket.on("getmyid",()=>{
        socket.emit("yourid",socket.id);
    })

    socket.on("join-room", async (roomId) => {
        if(await redis.exists(roomId)){
            await redis.sadd("activePlayers", socket.id);
        gameIo.in(socket.id).socketsJoin(roomId);
        socket.emit("join-room",{status:200,message:"Joined the room successfully"});
        }
        else{
            socket.emit("join-room",{status:408,message:"Room not found"});
        }
    });
    socket.on("othello-init", async () => {
        if(await redis.sismember("activePlayers",socket.id)){
            socket.emit("othello-init", generateInitResponse(403, "Already in an active game", "error"));
        }
        else{
        await redis.sadd("players", socket.id);
        await redis.sadd("activePlayers", socket.id);
        gameIo.to(socket.id).emit("othello-init", generateInitResponse(200, "Game board Initialized", "pending"));
//add a timer to wait for another player to join in 10 seconds if not then remove the player from the list
        setTimeout(async () => {
            const connectedPlayers = await redis.scard("players");
            if (connectedPlayers === 1) {
                await redis.spop("players");
                await redis.srem("activePlayers", socket.id);
                socket.emit("othello-init", generateInitResponse(408, "No player found", "timeout"));
            }
        }, PLAYERWAITTIME);
        const connectedPlayers = await redis.scard("players");
        if (connectedPlayers >= 2) {
            const player1 = await redis.spop("players");
            const player2 = await redis.spop("players");
            const gameDetails = InitHandler(player1, player2);

            gameIo.to(player1).emit("match-fixed", gameDetails);
            gameIo.to(player2).emit("match-fixed", gameDetails);
            gameIo.in([player1,player2]).socketsJoin(gameDetails.roomId);
            await redis.set(gameDetails.roomId, JSON.stringify(gameDetails),"EX",GAMEEXPIRYTIME);
            othelloGameManager(gameIo, gameDetails);
            
        }
    }
    });
}

export { InitHandler, playersConnect ,generateInitResponse};
