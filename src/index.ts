import express from "express";
import cors from "cors";
import { gameRouter } from "./routes/gameRoutes"; 


const app = express();
app.use(cors());
app.use(express.json());

app.use("/games", gameRouter);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
