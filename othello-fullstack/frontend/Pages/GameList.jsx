import {useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import socket from "../ApiResponse/socketManager.js"
function GameList() {
  const navigate = useNavigate()
  // useEffect(() => {
  //   console.log("in gamelist useeffect")
  //   console.log(socket)
  //  socket.disconnect();
  // }, [])
  
  const joinGame=({game})=>{
    navigate(`/games/${game}`)
  }

  return (
    <div>
      GameList
      <button onClick={()=>joinGame({game:"othello"})}>Join</button>
    </div>
  )
}

export default GameList