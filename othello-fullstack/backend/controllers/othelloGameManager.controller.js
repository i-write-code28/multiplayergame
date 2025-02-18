import { redis } from "../db/connectRedisDB.js";
import  OthelloGame  from "../gameLogics/othelloLogic.js";
import { generateInitResponse } from "./gameInit.controller.js";
async function othelloGameManager(gameIo, gameDetails) {
    const game = new OthelloGame();
    const sockets = await gameIo.in(`${gameDetails.roomId}`).fetchSockets();
    let player1,player2;
    if(sockets[0].id===gameDetails.player1.id){
        player1=sockets[0];
        player2=sockets[1];
    }else{
        player1=sockets[1];
        player2=sockets[0];
    }
player1.on(`${gameDetails.player1.id}-move`, async (data) => {
    const currentGame=JSON.parse(await redis.get(gameDetails.roomId));
if(currentGame.currentTurn===gameDetails.player1.color.charAt(0)){
    const gameBoard=currentGame.board;
    game.board=gameBoard;
    game.currentTurn=currentGame.currentTurn;
let moveHistory
if(currentGame.moveHistory){
 moveHistory=currentGame.moveHistory;
}
else{
    moveHistory=[];
}
    if(game.playTurn(data.row,data.col)){
        let blackCount=0;
        let whiteCount=0;
        for(let i=0;i<8;i++){
            for(let j=0;j<8;j++){
             if(gameBoard[i][j]=="b"){
                blackCount++;
            }
            if(gameBoard[i][j]=="w"){
                whiteCount++;
            }
        }
    }
        moveHistory.push({player1:`r${data.row}c${data.col}`});
    const updatedGame={
        ...gameDetails,
        board:game.board,
        currentTurn:gameDetails.player1.color==="black"?"w":"b",
        moveHistory:moveHistory,
        blackCount:blackCount,
        whiteCount:whiteCount,
        currentMatchStatus:"in progress"    
    }
    if (game.isGameOver()) {
        const winner =
            blackCount > whiteCount ? "black" :
            whiteCount > blackCount ? "white" :
            "draw";

        const gameOverData = {
            ...updatedGame,
            currentMatchStatus: "game_over",
            winner: winner,
            finalScores: { black: blackCount, white: whiteCount }
        };
        await redis.set(gameDetails.roomId, JSON.stringify(gameOverData));
        gameIo.to(gameDetails.roomId).emit('game_over', gameOverData);
        setTimeout( async() => {
            await redis.srem("activePlayers", player2.id);
            await redis.srem("activePlayers", player1.id);
            gameIo.socketsLeave(gameDetails.roomId);
        }, 1000*60);
       
    }
    else{
    await redis.set(gameDetails.roomId, JSON.stringify(updatedGame));
    const sendUpdatedGame = (({ board, ...rest }) =>( {...rest,status:200,message:"move accepted"}))(updatedGame);
    gameIo.to(gameDetails.roomId).emit('game_update', sendUpdatedGame);     
}
    }
else{
   player1.emit('game_update', generateInitResponse(400,"Invalid Move","in progress"))
}
}
    else{
      player1.emit('game_update',generateInitResponse(400,"Not your turn","in progress"));
}
})
player2.on(`${gameDetails.player2.id}-move`, async (data) => {
    const currentGame=JSON.parse(await redis.get(gameDetails.roomId));
if(currentGame.currentTurn===gameDetails.player2.color.charAt(0)){
    const gameBoard=currentGame.board;
    game.board=gameBoard;
    game.currentTurn=currentGame.currentTurn;
let moveHistory
if(currentGame.moveHistory){
 moveHistory=currentGame.moveHistory;
}
else{
    moveHistory=[];
}
    if(game.playTurn(data.row,data.col)){
        let blackCount=0;
        let whiteCount=0;
        for(let i=0;i<8;i++){
            for(let j=0;j<8;j++){
             if(gameBoard[i][j]=="b"){
                blackCount++;
            }
            if(gameBoard[i][j]=="w"){
                whiteCount++;
            }
        }
    }
        moveHistory.push({player2:`r${data.row}c${data.col}`});
    const updatedGame={
        ...gameDetails,
        board:game.board,
        currentTurn:gameDetails.player2.color==="black"?"w":"b",
        moveHistory:moveHistory,
        blackCount:blackCount,
        whiteCount:whiteCount,
        currentMatchStatus:"in progress"    
    }
    if (game.isGameOver()) {
        const winner =
            blackCount > whiteCount ? "black" :
            whiteCount > blackCount ? "white" :
            "draw";

        const gameOverData = {
            ...updatedGame,
            currentMatchStatus: "game_over",
            winner: winner,
            finalScores: { black: blackCount, white: whiteCount }
        };
        await redis.set(gameDetails.roomId, JSON.stringify(gameOverData));
        gameIo.to(gameDetails.roomId).emit('game_over', gameOverData);
        setTimeout( async() => {
            await redis.srem("activePlayers", player2.id);
            await redis.srem("activePlayers", player1.id);
            gameIo.socketsLeave(gameDetails.roomId);
        }, 1000*60);
    }
    else{
    await redis.set(gameDetails.roomId, JSON.stringify(updatedGame));
    const sendUpdatedGame = (({ board, ...rest }) =>( {...rest,status:200,message:"move accepted"}))(updatedGame);
     gameIo.to(gameDetails.roomId).emit('game_update', sendUpdatedGame);
}
}
else{
   player2.emit('game_update',generateInitResponse(400,"Invalid Move","in progress"));
}
}
    else{
        player2.emit('game_update',generateInitResponse(400,"Not your turn","in progress"));
}
   
})
player1.on("disconnect", async () => {
    const currentGame=JSON.parse(await redis.get(gameDetails.roomId));
    const gameOverData = {
        ...currentGame,
        currentMatchStatus: "game_over",
        winner: gameDetails.player2.color,
       reason:"player1 disconnected"
    };
    await redis.set(gameDetails.roomId, JSON.stringify(gameOverData));
    
    gameIo.to(gameDetails.roomId).emit('game_over_disconnect', gameOverData);
    setTimeout( async() => {
        await redis.srem("activePlayers", player2.id);
        await redis.srem("activePlayers", player1.id);
        gameIo.socketsLeave(gameDetails.roomId);
        
    }, 1000*60);
})
player2.on("disconnect", async () => {
    const currentGame=JSON.parse(await redis.get(gameDetails.roomId));
    const gameOverData = {
        ...currentGame,
        currentMatchStatus: "game_over",
        winner: gameDetails.player1.color,
       reason:"player2 disconnected"
    };
    await redis.set(gameDetails.roomId, JSON.stringify(gameOverData));
    gameIo.to(gameDetails.roomId).emit('game_over_disconnect', gameOverData);
    setTimeout(async() => {
        await redis.srem("activePlayers", player2.id);
        await redis.srem("activePlayers", player1.id);
        gameIo.socketsLeave(gameDetails.roomId);
    }, 1000*60);
})
player1.on("getcurrentboard",async()=>{
    const currentGame=JSON.parse(await redis.get(gameDetails.roomId));
    gameIo.to(player1.id).emit("currentboard",currentGame.board);
})
player2.on("getcurrentboard",async()=>{
    const currentGame=JSON.parse(await redis.get(gameDetails.roomId));
    gameIo.to(player2.id).emit("currentboard",currentGame.board);
})

}
export { othelloGameManager };
