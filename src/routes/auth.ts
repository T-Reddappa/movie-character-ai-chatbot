import express, { Request, Response } from "express";
import { User } from "../models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";

const authRouter = express.Router();

authRouter.post("/signup", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: "username and password are requied" });
      return;
    }

    const existingUser = await User.findOne({
      username,
    });

    if (existingUser) {
      res.status(400).json({ error: "User with username already exist" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign(username, JWT_SECRET);
    res.status(201).json({
      token,
      username,
      message: "User signup successful",
    });
  } catch (error) {
    res.status(500).json({ error: "Error Creating User" });
  }
});

authRouter.post("/signin", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: "username and password are requied" });
      return;
    }

    const user = await User.findOne({ username });
    if (!user) {
      res.status(400).json({ error: "User with username not found" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign(user.username, JWT_SECRET);

    res.status(200).json({
      token,
      message: "User login successfull",
    });
  } catch (error) {
    res.status(500).json({ error: "Error signing in User" });
  }
});

export default authRouter;
