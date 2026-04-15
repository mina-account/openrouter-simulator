import { Router, Request, Response } from "express";
import { randomUUID } from "crypto";
import { findResponse } from "../csv";

const router = Router();

interface Message {
  role: string;
  content: string;
}

interface ChatRequest {
  model?: string;
  messages?: Message[];
}

router.post("/", (req: Request, res: Response): void => {
  const body = req.body as ChatRequest;
  const messages = body.messages ?? [];
  const model = body.model ?? "simulator";

  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
  const input = lastUserMessage?.content ?? "";

  const defaultResponse =
    process.env.DEFAULT_RESPONSE ?? "Hello, you reached OpenRouter Simulator.";
  const content = findResponse(input) ?? defaultResponse;

  res.json({
    id: `sim-${randomUUID()}`,
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [
      {
        index: 0,
        message: { role: "assistant", content },
        finish_reason: "stop",
        logprobs: null,
      },
    ],
    usage: {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
      cache_creation_input_tokens: null,
      cache_read_input_tokens: null,
    },
    service_tier: null,
  });
});

export default router;
