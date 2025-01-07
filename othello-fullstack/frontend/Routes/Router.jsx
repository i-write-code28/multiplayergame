import { createBrowserRouter ,createRoutesFromElements,Route } from "react-router-dom";
import App from "../src/App";
import OthelloHome from "../Pages/OhtelloHome";
import WaitingRoom from "../Pages/WaitingRoom";
import Gamelist from "../Pages/GameList";

const Router = createBrowserRouter(
  createRoutesFromElements(
<Route path="/">
<Route path="" element={<App/>}/>
<Route path="games" element={<Gamelist/>}/>
<Route path="games/othello" element={<OthelloHome/>}/>
<Route path={`games/waiting-room/*`} element={<WaitingRoom/>}/>
</Route>
    )
);
export default Router;