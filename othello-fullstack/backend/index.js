import {io, app,server} from "./app.js";
import { playersConnect } from "./controllers/gameConnect.controller.js";
import { connectDB } from "./db/connectDB.js";
import { connectRedisDB ,redis} from "./db/connectRedisDB.js";
import { verifyAUTH } from "./middlewares/auth.socket.middleware.js";

connectDB();
// connectRedisDB();
const gameIo=io.of("/api/v1/game")
gameIo.use(verifyAUTH)
gameIo.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id} , user: ${socket?.user?._id}`);
    playersConnect(gameIo,socket);
})
// gameIo.on("disconnect", (socket) => {
//     console.log(`Socket disconnected: ${socket.id}`);
// })
server.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT || 3000}`);
});
