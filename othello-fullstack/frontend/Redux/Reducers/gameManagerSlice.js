import { createSlice } from "@reduxjs/toolkit";
const initialState = 
    {
        "status": undefined,
        "message": undefined,
        "board": [],
        "player1": {
            "id": undefined,
            "name": undefined,
            "color": undefined
        },
        "player2": {
            "id": undefined,
            "name": undefined,
            "color": undefined
        },
        "roomId": undefined,
        "currentTurn": undefined,
        "blackCount": 0,
        "whiteCount": 0,
        "currentMatchStatus": undefined,
        "winner": undefined,
        "reason": undefined,
        "moveHistory": undefined,
        "myPlayerId":undefined,
        "role": undefined
};
export const gameManagerSlice = createSlice({
    name: "othelloBoard",
    initialState,
    reducers: {
       setInitResponse(state, action) {
           state.status = action.payload.status;
           state.message = action.payload.message;
           state.currentMatchStatus=action.payload.currentMatchStatus;
       },
       updateGameBoard(state, action) {
        state.board = action.payload.board;
       },
       setMyId(state,action){
        state.myPlayerId=action.payload.myPlayerId;
        if(action.payload.myPlayerId===state.player1.id || action.payload.myPlayerId===state.player2.id){
           state.role="player" 
        }
        else{
            state.role="viewer" 
        }
       },
       setGameOver(state, action) {
        state.currentMatchStatus=action.payload.currentMatchStatus;
        state.winner=action.payload.winner;
        state.reason=action.payload.reason;
        state.moveHistory = action.payload?.moveHistory !== undefined ? action.payload.moveHistory : state.moveHistory;
        state.blackCount = action.payload?.blackCount!== undefined? action.payload.blackCount : state.blackCount;
        state.whiteCount = action.payload?.whiteCount!== undefined? action.payload.whiteCount : state.whiteCount;
        state.currentTurn=null;
       },
       setGameDetails(state, action) {
           state.board = action.payload.board;
           state.player1 = action.payload.player1;
           state.player2 = action.payload.player2;
           state.roomId = action.payload.roomId;
           state.currentTurn = action.payload.currentTurn;
           state.blackCount = action.payload.blackCount;
           state.whiteCount = action.payload.whiteCount;
           state.currentMatchStatus = action.payload.currentMatchStatus;
       },
       updateGameMoves(state, action) {
        state.moveHistory = action.payload.moveHistory !== undefined ? action.payload.moveHistory : state.moveHistory;
        state.blackCount = action.payload?.blackCount!== undefined? action.payload.blackCount : state.blackCount;
        state.whiteCount = action.payload?.whiteCount!== undefined? action.payload.whiteCount : state.whiteCount;
        state.currentTurn = action.payload.currentTurn;
       },
       resetGame(state) {
    state.status= undefined;
     state.message= undefined;
   state.board= [],
     state.player1= {
        "id":undefined,
           "name":undefined,
          "color": undefined
        },
     state.player2= {
       "id":undefined,
       "name": undefined,
       "color": undefined
        },
    state.roomId= undefined,
        state.currentTurn= undefined,
        state.blackCount= 0,
        state.whiteCount= 0,
        state.currentMatchStatus= undefined,
        state.winner= undefined,
        state.reason= undefined,
        state.moveHistory= undefined,
        state.myPlayerId=undefined,
        state.role= undefined
       
    }
    }
})
export const {setInitResponse,setMyId,setGameOver,setGameDetails,updateGameMoves,updateGameBoard,resetGame} = gameManagerSlice.actions;
export default gameManagerSlice.reducer;