import express, { Request } from "express";
import cors from "cors";
import { rateLimit } from "express-rate-limit";

import chatRoutes from "./routes/chat";
import { PORT } from "./config";
import { connectDB } from "./services/database";

const app = express();
app.use(express.json());
app.use(cors());

connectDB();

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

app.use("/chat", chatRoutes);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
