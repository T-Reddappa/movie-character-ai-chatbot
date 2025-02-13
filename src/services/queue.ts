import { Queue, QueueEvents, Worker } from "bullmq";
import Redis from "ioredis";
import dotenv from "dotenv";
import { generateCharacterResponse } from "./openai";
import { generateEmbedding } from "./embedding";

dotenv.config();

const connection = new Redis(process.env.UPSTASH_REDIS_URL!, {
  maxRetriesPerRequest: null,
});

export const aiResponseQueue = new Queue("aiResponseQueue", { connection });

export const embeddingQueue = new Queue("embeddingQueue", { connection });

export const aiResponseQueueEvents = new QueueEvents("aiResponseQueue", {
  connection,
});
export const embeddingQueueEvents = new QueueEvents("embeddingQueue", {
  connection,
});

new Worker(
  "aiResponseQueue",
  async (job) => {
    console.log(" AIWORKER, processing job in aiResponseQueue");

    const aiResponse = await generateCharacterResponse(
      job.data.character,
      job.data.user_message,
      job.data.context
    );

    return aiResponse;
  },
  {
    connection,
  }
);

new Worker(
  "embeddingQueue",
  async (job) => {
    console.log("EMBEDDEDWORKER, Generating embedding for query");
    return await generateEmbedding(job.data.text);
  },
  { connection }
);
