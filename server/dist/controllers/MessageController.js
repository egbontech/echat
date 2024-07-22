"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatRoom = exports.NewMessage = void 0;
const config_1 = __importDefault(require("../config/config"));
const server_1 = require("../server");
const NewMessage = (req, res) => {
    const { senderId, content, room, username } = req.body;
    // Check if any of the required fields are missing
    if (!senderId || !content || !room || !username) {
        return res.status(200).json({
            status: "failed",
            error: "All fields (senderId, username, content, room) are required.",
        });
    }
    const insertQuery = "INSERT INTO messages (sender_id,room, content,username) VALUES (?,?,?,?)";
    config_1.default.query(insertQuery, [senderId, room, content, username], (err, results) => {
        if (err) {
            console.error("Error inserting data:", err);
            return res.status(400).json({ error: "Failed to insert data" });
        }
        const messageId = results.insertId;
        const successResponse = {
            status: "success",
            msg: "Message sent successfully",
            message: {
                id: messageId,
                content: content,
                username: username,
            },
        };
        server_1.io.to(room).emit("newMessage", successResponse.message);
        return res.status(200).json(successResponse);
    });
};
exports.NewMessage = NewMessage;
const ChatRoom = (req, res) => {
    const { room } = req.params;
    const Query = "SELECT * FROM messages WHERE room = ? ORDER BY created_at DESC LIMIT 100";
    config_1.default.query(Query, [room], (err, results) => {
        if (err) {
            console.error("Error inserting data:", err);
            return res.status(400).json({ error: "Failed to insert data" });
        }
        return res.status(200).json({ data: results });
    });
};
exports.ChatRoom = ChatRoom;
