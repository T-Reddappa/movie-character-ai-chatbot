import express, { Request, Response } from "express";
import { searchDialogue } from "../services/search";
import { aiResponseQueue, aiResponseQueueEvents } from "../services/queue";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  const { character, user_message } = req.body;

  if (!character || !user_message) {
    res
      .status(400)
      .json({ error: "character and user_message properties are required." });
  }

  try {
    const retrievedDialogue = await searchDialogue(user_message);
    const context = String(retrievedDialogue);
    console.log("context#:", context);

    //ai response - bullmq queue
    const job = await aiResponseQueue.add("generateResponse", {
      character,
      user_message,
      context,
    });

    const response = await job.waitUntilFinished(aiResponseQueueEvents, 20000);

    res.status(200).json({ response });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
