import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
const app = express();
app.use(cors({origin:'*'}));
app.use(express.json({limit:'16kb'}))
app.use(express.urlencoded({extended:true,limit:'16kb'}));
app.use(cookieParser());
//routes import
import userRouter from "./routes/user.routes.js";
app.use("/api/v1/users",userRouter)
app.use(cors({origin:'*'}))
const server = http.createServer(app);
const io =new Server(server,{
  cors:{
    origin:'*',
    methods:["GET","POST"],
    credentials:true
  }
});
export {io,app,server};


