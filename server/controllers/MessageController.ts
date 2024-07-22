import { Request, Response } from "express";
import db from "../config/config";
import { io } from "../server";

interface ErrorResponse {
  status: string;
  errors: string[];
}

// Define types for the success response
interface SuccessResponse {
  status: string;
  msg: string;
  message: {
    id: number;
    content: string; 
    username: string;
  };
}

export const NewMessage = (req: Request, res: Response) => {
  const { senderId, content, room, username } = req.body;

  // Check if any of the required fields are missing
  if (!senderId || !content || !room || !username) {
    return res.status(200).json({
      status: "failed",
      error: "All fields (senderId, username, content, room) are required.",
    });
  }

  const insertQuery =
    "INSERT INTO messages (sender_id,room, content,username) VALUES (?,?,?,?)";
  db.query(insertQuery, [senderId, room, content, username], (err, results) => {
    if (err) {
      console.error("Error inserting data:", err);
      return res.status(400).json({ error: "Failed to insert data" });
    }

    const messageId = results.insertId;

    const successResponse: SuccessResponse = {
      status: "success",
      msg: "Message sent successfully",
      message: {
        id:messageId,
        content: content,       
        username: username,
      },
    };

    io.to(room).emit("newMessage", successResponse.message);

    return res.status(200).json(successResponse);
  });
};

export const ChatRoom = (req: Request, res: Response) => {
  const { room } = req.params;

  const Query =
    "SELECT * FROM messages WHERE room = ? ORDER BY created_at DESC LIMIT 100";
  db.query(Query, [room], (err, results) => {
    if (err) {
      console.error("Error inserting data:", err);
      return res.status(400).json({ error: "Failed to insert data" });
    }

    return res.status(200).json({ data: results });
  });
};
