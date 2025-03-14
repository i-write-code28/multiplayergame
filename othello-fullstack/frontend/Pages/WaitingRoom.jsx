import GameLoader from '../components/GameLoader';
import Backdrop from '@mui/material/Backdrop';
import { useEffect,useState } from 'react';
import {useSelector} from "react-redux";
import "./css/waitingRoom.css";
// import {useRouteAndSocketManager} from "../ApiResponse/socketManager"
// import {useRouteAndSocketManager} from "../ApiResponse/socketManager.js"
function WaitingRoom() {
  const [data,setData]=useState({})
  const tempData=useSelector(state=>({
    status:state.gameManager.status,
    message:state.gameManager.message,
    currentMatchStatus:state.gameManager.currentMatchStatus
  }));

  useEffect(() => {
    // socket.connect();
    //socket.connected then nothing else make socket connection
   const timer=setTimeout(()=>{
    // console.log(useRouteAndSocketManager())
    // useRouteAndSocketManager();
    setData(tempData)
   },550)
  //TODO: remove timeout use if
    return () => {
      clearTimeout(timer)
      // useRouteAndSocketManager();
      //socket.disconnect();
    }
  }, [data])
  
  return (
    <Backdrop
      sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
      open={true}
    >
      <div className='waiting-room'>
        <h1>Please wait while we search for an opponent</h1>
        <GameLoader />
        {
          data.status !==undefined &&
        <h2 style={{ backgroundColor: data.status === 200 ? "green" : "red" }}>
  {data.message}
</h2>
}
      </div>
    </Backdrop>
  );
}

export default WaitingRoom;
