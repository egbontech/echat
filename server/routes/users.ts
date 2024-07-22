import express from "express";
import { Login, NewUser } from "../controllers/UserController";

const router = express.Router();

router.post("/register", NewUser);
router.post("/login", Login);

export default router;
