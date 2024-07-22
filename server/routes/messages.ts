import express from "express";
import { ChatRoom, NewMessage } from "../controllers/MessageController";

const router = express.Router();

router.post("/new-message", NewMessage);
router.get("/chatroom/:room",ChatRoom );

export default router;
