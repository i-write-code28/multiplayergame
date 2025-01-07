import {useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import socket from "../ApiResponse/socketManager"
function GameList() {
  const navigate = useNavigate()
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