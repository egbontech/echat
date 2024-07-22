import { Request, Response } from "express";
import db from "../config/config";
import bcrypt from "bcrypt";

// Define the type for the error response
interface ErrorResponse {
  status: string;
  errors: string[];
}

// Define the type for the success response
interface SuccessResponse {
  status: string;
  msg: string;
  user?: { id: number; username: string; name: string };
}

export const NewUser = (req: Request, res: Response) => {
  const { name, username, password } = req.body;
  const errors: string[] = [];

  // Check if the username already exists if there are no previous errors

  const checkQuery = "SELECT * FROM users WHERE username = ?";
  db.query(checkQuery, [username], async (err, results) => {
    if (err) {
      console.error("Error checking username:", err);
      return res.status(400).json({ error: "Failed to check username" });
    }

    if (results.length > 0) {
      errors.push("Username already exists");
    }

    // If there are any errors, return them
    if (errors.length > 0) {
      const errorResponse: ErrorResponse = { status: "error", errors };
      return res.status(200).json(errorResponse);
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      // Insert the new user if the username is unique and there are no errors
      const insertQuery =
        "INSERT INTO users (name, username, password) VALUES (?,?,?)";
      db.query(insertQuery, [name, username, hashedPassword], (err, result) => {
        if (err) {
          console.error("Error inserting data:", err);
          return res.status(400).json({ error: "Failed to insert data" });
        }

        const successResponse: SuccessResponse = {
          status: "success",
          msg: "Registration successful",
        };
        return res.status(200).json(successResponse);
      });
    } catch (error) {
      console.error("Error hashing password");
      return res.status(500).json({ error: "Failed to hash password" });
    }
  });
};

export const Login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const checkQuery = "SELECT * FROM users WHERE username = (?)";
  db.query(checkQuery, [username], async (err, results) => {
    if (err) {
      console.error("Error checking username:", err);
      return res.status(400).json({ error: "Failed to check username" });
    }

    if (results.length === 0) {
      const successResponse: SuccessResponse = {
        status: "failed",
        msg: "No user found!",
      };
      return res.status(200).json(successResponse);
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      const successResponse: SuccessResponse = {
        status: "failed",
        msg: "Wrong Password!",
      };
      return res.status(200).json(successResponse);
    }

    const successResponse: SuccessResponse = {
      status: "success",
      msg: "Login successful",
      user: { id: user.id, username: user.username, name: user.name },
    };
    return res.status(200).json(successResponse);
  });
};
