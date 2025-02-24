import express, { Request, Response } from "express";
import { generateCharacterResponse } from "../services/openai";
import { Dialogue } from "../models/dialogue";
import { searchDocuments } from "../services/search";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  const { character, user_message } = req.body;

  if (!character || !user_message) {
    res
      .status(400)
      .json({ error: "character and user_message properties are required." });
  }

  try {
    const retrievedDocs = await searchDocuments(user_message);
    const context = String(retrievedDocs[0]?.dialogue || "");
    console.log("context#:", context);

    //ai response
    const aiResponse = await generateCharacterResponse(
      character,
      user_message,
      context
    );

    if (!aiResponse) {
      res.status(404).json({ error: "No response generated" });
      return;
    }

    res.status(200).json({ response: aiResponse });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
