import { UserChat } from "../models/user";

export const saveChat = async (
  username: string,
  character: string,
  role: string,
  content: string
): Promise<void> => {
  try {
    process.nextTick(async () => {
      await UserChat.updateOne(
        { username, character },
        {
          $push: {
            messages: {
              role,
              content,
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
