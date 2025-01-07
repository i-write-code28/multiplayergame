import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
const app = express();
app.use(cors({origin:'*'}));
const server = http.createServer(app);
const io =new Server(server,{
  cors:{
    origin:'*',
    methods:["GET","POST"],
    credentials:true
  }
});
export {io,app,server};


