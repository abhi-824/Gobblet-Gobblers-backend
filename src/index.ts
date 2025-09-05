import express from "express";
import cors from "cors";
import { gameRouter } from "./routes/gameRoutes"; 


const app = express();
app.use(cors({
  origin: "https://gobblet.netlify.app"
}));
app.use(express.json());

// Simple request id generator
const rid = () => Math.random().toString(36).slice(2);

// Request logger
app.use((req, res, next) => {
  const requestId = (req.headers["x-request-id"] as string) || rid();
  (req as any).requestId = requestId;
  const startedAt = Date.now();
  console.log(`[REQ] ${requestId} ${req.method} ${req.originalUrl}`);
  if (Object.keys(req.body ?? {}).length) {
    console.log(`[REQ] ${requestId} body`, req.body);
  }
  res.on("finish", () => {
    console.log(`[RES] ${requestId} ${res.statusCode} in ${Date.now() - startedAt}ms`);
  });
  next();
});

app.use("/games", gameRouter);

// Global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const requestId = (req as any).requestId || "unknown";
  const status = err.statusCode || err.status || 500;
  const isZod = err?.issues && err?.name === "ZodError";
  const payload = {
    error: {
      message: isZod ? "Invalid request payload" : err.message || "Internal Server Error",
      details: isZod ? err.issues : undefined,
      requestId,
    },
  };
  console.error(`[ERR] ${requestId}`, {
    message: err.message,
    stack: err.stack,
    status,
    route: req.originalUrl,
    method: req.method,
  });
  res.status(status).json(payload);
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => {
  console.log(`API on http://localhost:${PORT}`);
});
