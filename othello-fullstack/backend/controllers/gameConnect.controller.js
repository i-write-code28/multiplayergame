import { redis } from "../db/connectRedisDB.js";
import { othelloGameManager } from "./othelloGameManager.controller.js";
import { InitHandler, generateInitResponse } from "./gameInit.controller.js";
import { nanoid } from "nanoid";
import { GAMEEXPIRYTIME, PLAYERWAITTIME } from "../constants.js";

// Handle the reconnection of players
async function reconnectPlayer(playerId, roomId, gameIo) {
    const gameDetailsString = await redis.get(roomId);
    if (!gameDetailsString) {
        return;
    }
    
    const gameDetails = JSON.parse(gameDetailsString);

    if (gameDetails.currentMatchStatus === "waiting for player") {
        const socket = gameIo.sockets.get(playerId);
        if (socket) {
            // Join the game room
            socket.join(roomId);
            gameIo.to(playerId).emit("reconnect_success", gameDetails);

            // Now that the player has rejoined, update the game status
            const updatedGameDetails = {
                ...gameDetails,
                currentMatchStatus: "in progress"
            };
            await redis.set(roomId, JSON.stringify(updatedGameDetails));
            gameIo.to(roomId).emit("game_update", updatedGameDetails);
        }
    } else {
        // If the game isn't waiting for a player (i.e., it's already over or in progress)
        gameIo.to(playerId).emit("reconnect_failed", "Game already in progress or over.");
    }
}

// Handle the disconnect of a player
async function handleDisconnect(player, opponent, gameDetails, gameIo) {
    const newGameDetails = {
        ...gameDetails,
        currentMatchStatus: "waiting for player",
        reason: "Player disconnected"
    };

    gameIo.to(gameDetails.roomId).emit("game_update", newGameDetails);
    
    // Add the disconnecting player to the reconnect list
    await redis.sadd("reconnect", `${player.id}#-#${gameDetails.roomId}`);
    
    // Set a timer to check for reconnection or game timeout
    setTimeout(async () => {
        const isPlayerReconnected = await redis.sismember("reconnect", `${player.id}#-#${gameDetails.roomId}`);
        
        if (isPlayerReconnected) {
            const gameOverData = {
                ...gameDetails,
                currentMatchStatus: "game_over",
                winner: opponent.color,
                reason: "Player disconnected"
            };
            await redis.set(gameDetails.roomId, JSON.stringify(gameOverData));
            gameIo.to(gameDetails.roomId).emit("game_over", gameOverData);
        } else {
            await redis.srem("reconnect", `${player.id}#-#${gameDetails.roomId}`);
        }
    }, 40000); // Reconnection timeout after 40 seconds
}

async function playersConnect(gameIo, socket) {
    socket.on("reconnect", async (playerId) => {
        let cursor = '0';
        do {
            const [newCursor, results] = await redis.sscan('reconnect', cursor, 'MATCH', `${playerId}#-#`);
            cursor = newCursor;
            for (const key of results) {
                const parts = key.split('#-#');
                if (parts[0] === playerId) {
                    const roomId = parts[1];
                    gameIo.in(socket.id).socketsJoin(roomId);
                    await reconnectPlayer(playerId, roomId, gameIo);
                    break;
                }
            }
        } while (cursor !== '0'); // Continue scanning until cursor is back to 0
    });
    
    socket.on("getmyid", () => {
        const playerID = `${socket?.user?._id || socket.id}#-#${socket.id}`;
        socket.emit("yourid", playerID.split("#-#")[0]);
    });

    socket.on("join-room", async (roomId) => {
        if (await redis.exists(roomId)) {
            await redis.sadd("activePlayers", playerID);
            gameIo.in(playerID).socketsJoin(roomId);
            socket.emit("join-room", { status: 200, message: "Joined the room successfully" });
        } else {
            socket.emit("join-room", { status: 408, message: "Room not found" });
        }
    });

    socket.on("othello-init", async () => {
        const playerID = `${socket?.user?._id || socket.id}#-#${socket.id}`;
        if (await redis.sismember("activePlayers", playerID)) {
            socket.emit("othello-init", generateInitResponse(403, "Already in an active game", "error"));
        } else {
            await redis.sadd("players", playerID);
            await redis.sadd("activePlayers", playerID);
            gameIo.to(playerID).emit("othello-init", generateInitResponse(200, "Game board Initialized", "pending"));

            // Timer to wait for another player
            setTimeout(async () => {
                const connectedPlayers = await redis.scard("players");
                if (connectedPlayers === 1) {
                    await redis.spop("players");
                    await redis.srem("activePlayers", playerID);
                    socket.emit("othello-init", generateInitResponse(408, "No player found", "timeout"));
                }
            }, PLAYERWAITTIME);

            const connectedPlayers = await redis.scard("players");
            if (connectedPlayers >= 2) {
                const player1 = await redis.spop("players");
                const player2 = await redis.spop("players");
                const gameDetails = InitHandler(player1, player2);
                const player1socketId = player1.split("#-#")[1];
                const player2socketId = player2.split("#-#")[1];

                gameIo.to(player1socketId).emit("match-fixed", gameDetails);
                gameIo.to(player2socketId).emit("match-fixed", gameDetails);
                gameIo.in([player1socketId, player2socketId]).socketsJoin(gameDetails.roomId);
                await redis.set(gameDetails.roomId, JSON.stringify(gameDetails), "EX", GAMEEXPIRYTIME);
                othelloGameManager(gameIo, gameDetails);
            }
        }
    });
}

export { playersConnect };
