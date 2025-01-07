import {io, app,server} from "./app.js";
import { playersConnect } from "./controllers/gameInit.controller.js";
import { connectDB } from "./db/connectDB.js";
import { connectRedisDB ,redis} from "./db/connectRedisDB.js";

// connectDB();
connectRedisDB();
const gameIo=io.of("/api/v1/game")
gameIo.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    playersConnect(gameIo,socket);
})

server.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT || 3000}`);
});
