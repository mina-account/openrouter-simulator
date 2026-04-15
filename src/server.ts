import express from "express";
import { authMiddleware } from "./middleware/auth";
import chatRouter from "./routes/chat";

export function createApp(): express.Application {
  const app = express();

  app.use(express.json());
  app.use(authMiddleware);

  app.get("/", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/v1/chat/completions", chatRouter);

  return app;
}
