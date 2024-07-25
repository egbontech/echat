import dotenv from "dotenv";
dotenv.config();

import express, { Express, Request, Response } from "express";
import UserRoutes from "./routes/users";
import cors from "cors";
import MessagesRoutes from "./routes/messages";
import http from "http";
import { Server } from "socket.io";

const port = 5000;

const app: Express = express();

const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "*", // For real production applications only specified domain would be allowed
    methods: ["GET", "POST"],
  },
});

const corsOptions = {
  origin: "*", // For real production applications only specified domain would be allowed
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req: Request, res: Response) => {
  res.send("Node js app is running!");
});

app.use("/api/", UserRoutes);
app.use("/api/", MessagesRoutes);

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("a user connected");

  // Listen for joinRoom event and add the user to the room
  socket.on("joinRoom", ({ room, username }) => {
    socket.join(room);
    console.log(`${username} joined room: ${room}`);

    // Notify others in the room
    socket.to(room).emit("userNotification", {
      username,
      content: `${username} has joined the chat`,
    });  
  });

  // Listen for leftRoom event and remove the user from the room
  socket.on("leftRoom", ({ room, username }) => {
    socket.leave(room);
    console.log(`${username} left room: ${room}`);

    // Notify others in the room
    socket.to(room).emit("userNotification", {
      username,
      content: `${username} has left the chat`,
    });
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");    
  });
});

server.listen(port, () => {
  // Use server.listen instead of app.listen
  console.log(`Server is running on port ${port}`);
});
