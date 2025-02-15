import {io} from 'socket.io-client'
import config from "../config/config"
import {store} from '../Redux/Store/Store';
import {setInitResponse,setMyId,setGameOver,setGameDetails,updateGameMoves,updateGameBoard,resetGame} from '../Redux/Reducers/gameManagerSlice';

const socket=io(config.BackendGameUrl);

// Listen to socket events and dispatch actions
socket.on('othello-init', (data) => {
  console.log("othelloManager", data);
  store.dispatch(setInitResponse(data));
});

socket.on('match-fixed', (data) => {
  store.dispatch(setGameDetails(data));
});

socket.on('game_update', (data) => {
  store.dispatch(updateGameBoard(data.board));
  store.dispatch(updateGameMoves(data));
});

socket.on('game_over', (data) => {
  store.dispatch(setGameOver(data));
});
socket.on('game_over_disconnect', (data) => {
  store.dispatch(setGameOver(data));
});
socket.on('yourid', (data) => {
  store.dispatch(setMyId(data));
});

socket.on('join-room', (data) => {
store.dispatch(setMyId(data));
});

// othello-init
// match-fixed
// game_update
// yourid
// join-room
// currentboard
// game_over_disconnect
// game_over

export default socket;
//TODO:fix this 

// import { useEffect } from 'react';
// import { useLocation } from 'react-router-dom';
// import { useDispatch } from 'react-redux';


// export function useRouteAndSocketManager() {
//   const location = useLocation();
//   // const dispatch = useDispatch();

//   useEffect(() => {
//     // Handle socket connection for `/games/*` routes
//     if (location.pathname.startsWith('/games/')) {
//       if (!socket || !socket.connected) {
//         console.log('Socket connected:', socket.id);
//       }
//     }

//     // Handle route-based behavior
//     if (location.pathname === '/') {
//       // Disconnect socket when navigating to `/`
//       if (socket && socket.connected) {
//         socket.disconnect();
//         console.log('Socket disconnected');
//       }
//     } else if (!location.pathname.startsWith('/games/')) {
//       // Reset Redux state for routes outside `/games/`
//       store.dispatch(resetGame());
//     }

//     return () => {
//       // Disconnect socket when the component using this hook unmounts
//       if (socket && socket.connected) {
//         socket.disconnect();
//         console.log('Socket disconnected on cleanup');
//       }
//     };
//   }, [location, store.dispatch]);

//   return socket; // Return socket instance for further usage if needed
// }
