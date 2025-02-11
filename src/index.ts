import express from "express";
import cors from "cors";

import chatRoutes from "./routes/chat";
import { PORT } from "./config";

const app = express();
app.use(express.json());
app.use(cors());

app.use("/chat", chatRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
