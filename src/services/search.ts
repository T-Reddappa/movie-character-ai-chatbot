import { Redis } from "@upstash/redis";
import dotenv from "dotenv";

import pinecone from "./pinecone";
import { generateEmbedding } from "./embedding";

dotenv.config();

const index = pinecone.index("chatbot-rag");
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export const searchDialogue = async (query: string) => {
  const cacheKey = `dialogue:${query}`;

  //try retrieveing from Redis cache
  const cachedData = await redis.get(cacheKey);
  if (cachedData) {
    console.log("Cached data:", cachedData);
    return cachedData;
  }

  //if not in cache, fetch from vector db
  const queryEmbedding = await generateEmbedding(query);
  if (!queryEmbedding) {
    throw new Error("Failed to generate embedding for the query");
  }

  const result = await index.query({
    vector: queryEmbedding,
    topK: 3,
    includeMetadata: true,
  });

  console.log(
    "Top results:",
    result.matches.map((match) => match.metadata)
  );
  const topMatches = result.matches.map((match) => match.metadata);
  const matchedDialogue = topMatches[0]?.dialogue || "";
  console.log(matchedDialogue);

  //store in redis cache
  await redis.set(cacheKey, matchedDialogue, { ex: 3600 });

  return matchedDialogue;
};
