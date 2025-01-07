import OthelloRenderer from "./utils/OthelloRenderer"
import './css/othello.css'
import SideOptions from "./SideOptions"
function OthelloPlayer({playerId}) {
  return(
    <div className={`player${playerId} shake-effect`}>
          <div className="player-details" data-player={`${playerId}`}>
            <i className="fa-solid fa-user"></i>
            <span className="player-name">Player {playerId}</span>
          </div>
          {
  Array(8).fill().map((_, i) => (
    <ul className="player-pieces-outer" data-player={`${playerId}`} key={i}>
     {
      Array(4).fill().map((_, j) => (
        <li className="player-pieces" data-player={`${playerId}`} key={j}>

          <div className="show-player-piece" data-player={`${playerId}`}></div>
        </li>
      ))
     }
    </ul>
  ))
}
       </div>
  )
}
function Othello() {
  return (
    <>
    <div className="othello-container shake-effect">
      <OthelloPlayer playerId={1} />
   <OthelloRenderer className="othello-board" row={8} column={8} rowClassName="row" columnClassName="cell" />
   <OthelloPlayer playerId={2} />
   </div>
   <SideOptions/>
   </>
  )
}

export default Othello