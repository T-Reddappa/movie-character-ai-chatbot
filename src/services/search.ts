import Redis from "ioredis";

import pinecone from "../scripts/pinecone";
import { embeddingQueue, embeddingQueueEvents } from "./queue";
import { UPSTASH_REDIS_URL } from "../config";

const index = pinecone.index("chatbot-rag");
const redis = new Redis(UPSTASH_REDIS_URL!, {
  maxRetriesPerRequest: null,
});

export const searchDialogue = async (query: string) => {
  const cacheKey = `dialogue:${query}`;

  //try retrieveing from Redis cache
  const cachedData = await redis.get(cacheKey);
  if (cachedData) {
    console.log("Cached data:", cachedData);
    return cachedData;
  }

  //if not in cache, generate embedding using queue
  const job = await embeddingQueue.add("generateEmbedding", { text: query });
  const queryEmbedding = await job.waitUntilFinished(
    embeddingQueueEvents,
    20000
  );

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
  await redis.set(cacheKey, matchedDialogue as string, "EX", 3600);

  return matchedDialogue;
};
