import express from "express";
import http from "http";
import {Server} from "socket.io";
import cors from "cors";
const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});
const ROOM = "group";
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("joinRoom", async (username) => {
      console.log(`${username} is joining the group`);
      await socket.join(ROOM);
      io.to(ROOM).emit("roomNotice", username);
    });

    socket.on("isTyping",(data)=>{
      socket.in(ROOM).emit("isTyping",data);
    });

    socket.on("sendMessage", (data) => {
        socket.to(ROOM).emit("recieveMessage", data);
    });

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

server.listen(5000);
console.log("Server is running on port 5000");