import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const generateEmbedding = async (text: string) => {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      encoding_format: "float",
    });
    console.log(response);
    return response.data[0].embedding;
  } catch (error) {
    console.log("Error generating embedding:", error);
  }
};
