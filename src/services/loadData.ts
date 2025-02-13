import { v4 as uuidv4 } from "uuid";
import pinecone from "../scripts/pinecone";
import { generateEmbedding } from "./embedding";

const index = pinecone.index("chatbot-rag");

interface DialogueData {
  id: string;
  character: string;
  dialogues: string[];
}

const dialogData: DialogueData[] = [
  {
    id: "1",
    character: "Batman",
    dialogues: [
      "It's not who I am underneath, but what I do that defines me.",
      "I tried to save you.",
      "Our scars can destroy us, even after the physical wounds have healed. But if we survive them, they can transform us.",
      "I wear a mask. I don't wear a cape.",
      "You either die a hero, or live long enough to see yourself become the villain.",
    ],
  },
  {
    id: "2",
    character: "Iron Man",
    dialogues: [
      "I am Iron Man.",
      "I love you 3000.",
      "Sometimes you gotta run before you can walk.",
      "I am just a man in a can.",
      "If we can't protect the Earth, you can be damn sure we'll avenge it.",
    ],
  },
];

const loadData = async () => {
  for (const { id, character, dialogues } of dialogData) {
    for (const dialogue of dialogues) {
      const embedding = await generateEmbedding(dialogue);

      if (embedding) {
        const uniqueId = uuidv4();
        await index.upsert([
          {
            id: `${id}-${uniqueId}`,
            values: embedding,
            metadata: { character, dialogue },
          },
        ]);
      } else {
        console.error(
          `Failed to generate embedding for dialogue: "${dialogue}"`
        );
      }
    }
    console.log("Embeddings stored in Pinecone");
  }
};

loadData();
