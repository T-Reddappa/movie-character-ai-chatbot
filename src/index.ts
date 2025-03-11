import express, { Request } from "express";
import cors from "cors";
import { createServer } from "node:http";
import { WebSocketServer } from "ws";
import { rateLimit } from "express-rate-limit";
import jwt from "jsonwebtoken";
import { LRUCache } from "lru-cache";
import { IncomingMessage } from "node:http";

import { JWT_SECRET, PORT } from "./utils/config";
import { connectDB } from "./scripts/database";
import { searchDialogue } from "./services/search";
import { aiResponseQueue, aiResponseQueueEvents } from "./services/queue";
import { Character, User } from "./models/user";
import authRouter from "./routes/auth";
import { saveChat } from "./services/saveChat";
import { ExtendedWebSocket } from "./utils/types";
import charactersRoute from "./routes/character";

const app = express();
app.use(express.json());
app.use(cors());

const server = createServer(app);

connectDB();

const wss = new WebSocketServer({ server });

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
app.get("/", (req, res) => {
  res.send(`<h1 style="text-align:center">AI Movie Character Chatbot</h1>`);
});

app.use("/auth", authRouter);
app.use("/characters", charactersRoute);

app.use((req, res, next) => {
  if (req.headers.upgrade === "websocket") return;
  next();
});
// app.use("/chat", chatRouter);

const tokenCache = new LRUCache<string, any>({ max: 1000 });

wss.on("connection", async (ws: ExtendedWebSocket, req: IncomingMessage) => {
  try {
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const token = url.searchParams.get("token");
    if (!token) {
      ws.send(JSON.stringify({ error: "Authentication token required" }));
      ws.close();
      return;
    }

    let decoded = jwt.verify(token, JWT_SECRET);
    tokenCache.set(token, decoded);
    console.log("WS**DECODED**:", decoded);

    const user = await User.findOne({ username: decoded });
    console.log("DECODED USER", user);

    if (!user) {
      ws.send(JSON.stringify({ error: "User not found" }));
      ws.close();
      return;
    }

    const userId = user._id;
    console.log(userId.toString());
    console.log(
      `New WebSocket connection established for user: ${user.username}`
    );

    ws.on("message", async (message) => {
      console.log(message);
      try {
        const { userId, characterId, user_message } = JSON.parse(
          message.toString()
        );

        if (!userId || !characterId || !user_message) {
          ws.send(JSON.stringify({ error: "Missing required fields" }));
          return;
        }

        ws.send(
          JSON.stringify({ character: user.username, response: user_message })
        );

        const characterData = await Character.findById(characterId);
        if (!characterData) {
          ws.send(JSON.stringify({ error: "Character not found" }));
          return;
        }

        const characterName = characterData.name;

        await saveChat(userId!.toString(), characterId, "user", user_message);

        const retrievedDialogue = await searchDialogue(user_message);
        const context = String(retrievedDialogue);

        //ai response - bullmq queue
        const job = await aiResponseQueue.add("generateResponse", {
          characterName,
          user_message,
          context,
        });

        const response = await job.waitUntilFinished(
          aiResponseQueueEvents,
          15000
        );

        await saveChat(userId!.toString(), characterId, "ai", response);

        ws.send(
          JSON.stringify({ character: characterName, response: response })
        );
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

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
