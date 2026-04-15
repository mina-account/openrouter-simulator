import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import request from "supertest";
import { createApp } from "../server";

vi.mock("../csv", () => ({
  loadCsv: vi.fn(),
  findResponse: vi.fn(),
}));

import { findResponse } from "../csv";

const app = createApp();

describe("POST /api/v1/chat/completions", () => {
  const originalDefault = process.env.DEFAULT_RESPONSE;

  beforeEach(() => {
    process.env.DEFAULT_RESPONSE = "Default reply.";
    vi.mocked(findResponse).mockReturnValue(null);
  });

  afterEach(() => {
    process.env.DEFAULT_RESPONSE = originalDefault;
    vi.clearAllMocks();
  });

  it("returns the default response when no CSV match", async () => {
    const res = await request(app)
      .post("/api/v1/chat/completions")
      .send({ model: "gpt-test", messages: [{ role: "user", content: "hello" }] });

    expect(res.status).toBe(200);
    expect(res.body.choices[0].message.content).toBe("Default reply.");
    expect(res.body.choices[0].message.role).toBe("assistant");
  });

  it("returns the CSV-matched response", async () => {
    vi.mocked(findResponse).mockReturnValue("Hey from CSV!");

    const res = await request(app)
      .post("/api/v1/chat/completions")
      .send({ model: "gpt-test", messages: [{ role: "user", content: "hi" }] });

    expect(res.status).toBe(200);
    expect(res.body.choices[0].message.content).toBe("Hey from CSV!");
  });

  it("echoes back the request model", async () => {
    const res = await request(app)
      .post("/api/v1/chat/completions")
      .send({ model: "my-model", messages: [{ role: "user", content: "x" }] });

    expect(res.body.model).toBe("my-model");
  });

  it("falls back to 'simulator' when no model is provided", async () => {
    const res = await request(app)
      .post("/api/v1/chat/completions")
      .send({ messages: [{ role: "user", content: "x" }] });

    expect(res.body.model).toBe("simulator");
  });

  it("uses the last user message for lookup", async () => {
    const res = await request(app)
      .post("/api/v1/chat/completions")
      .send({
        model: "test",
        messages: [
          { role: "user", content: "first" },
          { role: "assistant", content: "reply" },
          { role: "user", content: "last" },
        ],
      });

    expect(vi.mocked(findResponse)).toHaveBeenCalledWith("last");
    expect(res.status).toBe(200);
  });

  it("handles missing messages array gracefully", async () => {
    const res = await request(app)
      .post("/api/v1/chat/completions")
      .send({ model: "test" });

    expect(res.status).toBe(200);
    expect(res.body.choices[0].message.content).toBe("Default reply.");
  });

  it("returns correct OpenRouter response shape", async () => {
    const res = await request(app)
      .post("/api/v1/chat/completions")
      .send({ model: "test", messages: [{ role: "user", content: "x" }] });

    const body = res.body;
    expect(body.object).toBe("chat.completion");
    expect(body.id).toMatch(/^sim-/);
    expect(typeof body.created).toBe("number");
    expect(body.usage).toEqual({
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
      cache_creation_input_tokens: null,
      cache_read_input_tokens: null,
    });
    expect(body.service_tier).toBeNull();
    expect(body.choices[0].finish_reason).toBe("stop");
    expect(body.choices[0].logprobs).toBeNull();
    expect(body.choices[0].index).toBe(0);
  });

  it("responds to GET / with status ok", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});
