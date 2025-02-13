import express, { Request } from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import { rateLimit } from "express-rate-limit";

import chatRoutes from "./routes/chat";
import { PORT } from "./config";
import { connectDB } from "./scripts/database";
import { searchDialogue } from "./services/search";
import { aiResponseQueue, aiResponseQueueEvents } from "./services/queue";

// const app = express();
// app.use(express.json());
// app.use(cors());

connectDB();

const wss = new WebSocketServer({ port: 8080 });

//rate limiting(5 requests/sec per user)
const rateLimiter = rateLimit({
  windowMs: 1000,
  limit: 5,
  message: { error: "Too many requests, please try again later" },
  keyGenerator: (req: Request) => req.ip || "unknown",
  standardHeaders: true,
  legacyHeaders: false,
});

// app.use(rateLimiter);

// app.use("/chat", chatRoutes);
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

wss.on("connection", (ws) => {
  console.log("new websocket connection");
  ws.on("message", async (message) => {
    console.log(message);
    try {
      const { character, user_message } = JSON.parse(message.toString());
      ws.send(character, user_message);

      if (!character || !user_message) {
        ws.send(
          JSON.stringify({ error: "character and user_message required" })
        );
        return;
      }

      const retrievedDialogue = await searchDialogue(user_message);
      const context = String(retrievedDialogue);
      console.log("context#:", context);

      //ai response - bullmq queue
      const job = await aiResponseQueue.add("generateResponse", {
        character,
        user_message,
        context,
      });

      const response = await job.waitUntilFinished(
        aiResponseQueueEvents,
        20000
      );
      ws.send(JSON.stringify({ character: character, response: response }));
    } catch (error) {
      ws.send(JSON.stringify({ error: "Internal server error" }));
    }
  });

  ws.on("close", () => {
    console.log(`Connection closed`);
  });
});

wss.on("error", (error) => {
  console.error("WebSocket server error:", error);
});
