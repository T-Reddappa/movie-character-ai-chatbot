import axios from "axios";
import { OPENAI_API_KEY } from "../utils/config";

export const generateCharacterResponse = async (
  character: string,
  userMessage: string,
  context: string
) => {
  console.log("context***:", context);
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are ${character}. Respond in character, using the following relevant past dialogues as context for your personality and speaking style:\n\n${context}`,
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
        max_tokens: 100,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw new Error("Failed to generate response");
  }
};
