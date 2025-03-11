import express from "express";
import { Character } from "../models/user";

const charactersRoute = express.Router();

charactersRoute.get("/", async (req, res) => {
  try {
    const characters = await Character.find({});
    console.log(characters);
    res.status(200).json({ characters });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default charactersRoute;
