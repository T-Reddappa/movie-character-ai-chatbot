import dotenv from "dotenv";
dotenv.config();

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
export const MONGO_URI = process.env.MONGO_URI;
export const PORT = process.env.PORT || 3000;
export const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
export const UPSTASH_REDIS_URL = process.env.UPSTASH_REDIS_URL;
export const JWT_SECRET = process.env.JWT_SECRET!;
