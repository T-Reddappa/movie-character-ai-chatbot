import express, { Request, Response } from "express";
import { generateCharacterResponse } from "../services/openai";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  const { character, user_message } = req.body;

  if (!character || !user_message) {
    res
      .status(400)
      .json({ error: "character and user_message properties are required." });
  }

  try {
    const response = await generateCharacterResponse(character, user_message);
    if (!response) {
      return res.status(404).json({ error: "No response generated" });
    }

    res.status(200).json({ response });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
