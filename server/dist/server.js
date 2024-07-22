"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const users_1 = __importDefault(require("./routes/users"));
const cors_1 = __importDefault(require("cors"));
const messages_1 = __importDefault(require("./routes/messages"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const port = 5000;
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
exports.io = new socket_io_1.Server(server, {
    cors: {
        origin: "*", // For real production applications only specified domain would be allowed
        methods: ["GET", "POST"],
    },
});
const corsOptions = {
    origin: "*", // For real production applications only specified domain would be allowed
    optionsSuccessStatus: 200,
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.get("/", (req, res) => {
    res.send("Node js app is running!");
});
app.use("/api/", users_1.default);
app.use("/api/", messages_1.default);
// Socket.IO connection
exports.io.on("connection", (socket) => {
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
