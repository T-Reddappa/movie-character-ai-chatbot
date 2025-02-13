import express, { Request, Response } from "express";
import { generateCharacterResponse } from "../services/openai";
import { searchDialogue } from "../services/search";

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
    //ai response
    const aiResponse = await generateCharacterResponse(
      character,
      user_message,
      context
    );
    res.status(200).json({ response: aiResponse });
  } catch (error) {
    -res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

//db search
// const existingDialogue = await Dialogue.findOne({
//   character: character,
//   dialogues: { $regex: new RegExp(user_message, "i") },
// });

// if (existingDialogue) {
//   const matchedDialogue = existingDialogue.dialogues.find((dialogue) =>
//     new RegExp(user_message, "i").test(dialogue)
//   );
//   res.json({ response: matchedDialogue });
//   return;
// }
