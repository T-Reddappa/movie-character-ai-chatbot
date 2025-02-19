import { Pinecone } from "@pinecone-database/pinecone";
import { PINECONE_API_KEY } from "../utils/config";

if (!PINECONE_API_KEY) {
  throw new Error("PINECONE_API_KEY not found");
}

const pinecone = new Pinecone({
  apiKey: PINECONE_API_KEY,
});

export default pinecone;
