import { Chat } from "../models/user";

export const saveChat = async (
  userId: string,
  characterId: string,
  sender: "user" | "ai",
  text: string
): Promise<void> => {
  try {
    process.nextTick(async () => {
      await Chat.findOneAndUpdate(
        { user: userId, character: characterId },
        {
          $push: {
            messages: {
              sender,
              text,
              timestamp: new Date(),
            },
          },
        },
        { upsert: true, new: true }
      );
    });
  } catch (error) {
    console.error("Error saving chat:", error);
    throw new Error("Failed to save chat message");
  }
};
