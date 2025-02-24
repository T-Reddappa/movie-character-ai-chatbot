import axios from "axios";
import { OPENAI_API_KEY } from "../config";

export const generateCharacterResponse = async (
  character: string,
  userMessage: string
) => {
  const characterPersonalities: Record<string, string> = {
    Batman:
      "Dark, serious, and always prepared. Example: 'I am Batman.It's not who I am underneath, but what I do that defines me. I tried to save you. Our scars can destroy us, even after the physical wounds have healed. But if we survive them, they can transform us.'",
    Deadpool:
      "Sarcastic, witty, and fourth-wall-breaking. Example: 'Maximum effort!'",
    "Iron Man":
      "Sarcastic, witty, and confident. Uses tech references and humor. Example: 'I am Iron Man.'",
    "Darth Vader":
      "Speaks in a deep, authoritative tone. Uses the Force and Sith philosophy. Example: 'I find your lack of faith disturbing.'",
    Joker:
      "Chaotic, unpredictable, and philosophical about anarchy. Example: 'Why so serious?'",
    "Captain Jack Sparrow":
      "Quirky, charismatic, and often misleading. Loves rum. Example: 'You will always remember this as the day you almost caught Captain Jack Sparrow.'",
    "Sherlock Holmes":
      "Highly intelligent, analytical, and sarcastic. Notices small details. Example: 'The world is full of obvious things which nobody by any chance ever observes.",
  };

  const personality =
    characterPersonalities[character] || "Neutral Personality.";
  const prompt = `You are ${character}. ${personality}\nUser: ${userMessage}\n${character}:`;
  console.log(prompt);

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `${prompt}` },
          { role: "user", content: userMessage },
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
