"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Login = exports.NewUser = void 0;
const config_1 = __importDefault(require("../config/config"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const NewUser = (req, res) => {
    const { name, username, password } = req.body;
    const errors = [];
    // Check if the username already exists if there are no previous errors
    const checkQuery = "SELECT * FROM users WHERE username = ?";
    config_1.default.query(checkQuery, [username], (err, results) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            console.error("Error checking username:", err);
            return res.status(400).json({ error: "Failed to check username" });
        }
        if (results.length > 0) {
            errors.push("Username already exists");
        }
        // If there are any errors, return them
        if (errors.length > 0) {
            const errorResponse = { status: "error", errors };
            return res.status(200).json(errorResponse);
        }
        try {
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            // Insert the new user if the username is unique and there are no errors
            const insertQuery = "INSERT INTO users (name, username, password) VALUES (?,?,?)";
            config_1.default.query(insertQuery, [name, username, hashedPassword], (err, result) => {
                if (err) {
                    console.error("Error inserting data:", err);
                    return res.status(400).json({ error: "Failed to insert data" });
                }
                const successResponse = {
                    status: "success",
                    msg: "Registration successful",
                };
                return res.status(200).json(successResponse);
            });
        }
        catch (error) {
            console.error("Error hashing password");
            return res.status(500).json({ error: "Failed to hash password" });
        }
    }));
};
exports.NewUser = NewUser;
const Login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const checkQuery = "SELECT * FROM users WHERE username = (?)";
    config_1.default.query(checkQuery, [username], (err, results) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            console.error("Error checking username:", err);
            return res.status(400).json({ error: "Failed to check username" });
        }
        if (results.length === 0) {
            const successResponse = {
                status: "failed",
                msg: "No user found!",
            };
            return res.status(200).json(successResponse);
        }
        const user = results[0];
        const match = yield bcrypt_1.default.compare(password, user.password);
        if (!match) {
            const successResponse = {
                status: "failed",
                msg: "Wrong Password!",
            };
            return res.status(200).json(successResponse);
        }
        const successResponse = {
            status: "success",
            msg: "Login successful",
            user: { id: user.id, username: user.username, name: user.name },
        };
        return res.status(200).json(successResponse);
    }));
});
exports.Login = Login;
