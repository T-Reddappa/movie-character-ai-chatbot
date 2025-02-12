import pinecone from "./pinecone";
import { generateEmbedding } from "./embedding";

const index = pinecone.index("chatbot-rag");

export const searchDocuments = async (query: string) => {
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

  return result.matches.map((match) => match.metadata);
};
