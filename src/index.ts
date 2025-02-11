import express from "express";
import cors from "cors";

import chatRoutes from "./routes/chat";
import { PORT } from "./config";
import { connectDB } from "./services/database";

const app = express();
app.use(express.json());
app.use(cors());

connectDB();

app.use("/chat", chatRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
