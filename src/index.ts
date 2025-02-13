import express, { Request } from "express";
import cors from "cors";
import { WebSocketServer, WebSocket } from "ws";
import { rateLimit } from "express-rate-limit";
import jwt from "jsonwebtoken";

import { JWT_SECRET, PORT } from "./config";
import { connectDB } from "./scripts/database";
import { searchDialogue } from "./services/search";
import { aiResponseQueue, aiResponseQueueEvents } from "./services/queue";
import { User, UserChat } from "./models/user";
import authRouter from "./routes/auth";
import { IncomingMessage } from "node:http";
import { LRUCache } from "lru-cache";

const app = express();
app.use(express.json());
app.use(cors());

connectDB();

// Extend WebSocket to include username property
interface ExtendedWebSocket extends WebSocket {
  username?: string;
}

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

app.use(rateLimiter);
app.use("/auth", authRouter);

// app.use("/chat", chatRouter);

const tokenCache = new LRUCache<string, any>({ max: 1000 });

async function saveChat(
  username: string,
  character: string,
  role: string,
  content: string
): Promise<void> {
  try {
    process.nextTick(async () => {
      await UserChat.updateOne(
        { username, character },
        {
          $push: {
            messages: {
              role,
              content,
              timestamp: new Date(),
            },
          },
        },
        { upsert: true, new: true }
      );
    });
  } catch (error) {
    console.error("Error saving chat:", error);
    throw new Error("Failed to save chat message");
  }
}

wss.on("connection", async (ws: ExtendedWebSocket, req: IncomingMessage) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      ws.send(JSON.stringify({ error: "Authentication token required" }));
      ws.close();
      return;
    }

    let decoded = tokenCache.get(token);
    if (!decoded) {
      decoded = jwt.verify(token, JWT_SECRET);
      tokenCache.set(token, decoded);
    }
    console.log("WS**DECODED**:", decoded);

    const user = await User.findOne(decoded.username);

    console.log("DECODED USER", user);

    if (!user) {
      ws.send(JSON.stringify({ error: "User not found" }));
      ws.close();
      return;
    }

    ws.username = user.username;
    console.log(
      `New WebSocket connection established for user: ${ws.username}`
    );

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

        await saveChat(ws.username!, character, "user", user_message);

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
          15000
        );

        await saveChat(ws.username!, character, "assistant", response);

        ws.send(JSON.stringify({ character: character, response: response }));
      } catch (error) {
        console.error("Error processing message:", error);
        ws.send(
          JSON.stringify({
            error: "Internal server error",
            details: error instanceof Error ? error.message : "Unknown error",
          })
        );
      }
    });

    ws.on("close", () => {
      console.log(`Connection closed for user: ${ws.username}`);
    });
  } catch (error) {
    console.error("Connection error:", error);
    ws.send(JSON.stringify({ error: "Invalid token" }));
    ws.close();
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
