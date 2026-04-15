import { describe, it, expect, beforeEach, afterEach } from "vitest";
import express from "express";
import request from "supertest";
import { authMiddleware } from "../middleware/auth";

function buildApp() {
  const app = express();
  app.use(authMiddleware);
  app.get("/", (_req, res) => res.json({ ok: true }));
  return app;
}

describe("authMiddleware", () => {
  const originalToken = process.env.API_TOKEN;

  afterEach(() => {
    process.env.API_TOKEN = originalToken;
  });

  it("passes through when API_TOKEN is not set", async () => {
    delete process.env.API_TOKEN;
    const res = await request(buildApp()).get("/");
    expect(res.status).toBe(200);
  });

  it("passes through when API_TOKEN is an empty string", async () => {
    process.env.API_TOKEN = "";
    const res = await request(buildApp()).get("/");
    expect(res.status).toBe(200);
  });

  it("returns 401 when token is required but no Authorization header is sent", async () => {
    process.env.API_TOKEN = "secret";
    const res = await request(buildApp()).get("/");
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe(401);
    expect(res.body.error.message).toBe("Invalid API key");
    expect(res.body.error.metadata).toBeNull();
    expect(res.body.user_id).toBeNull();
  });

  it("returns 401 for a wrong token", async () => {
    process.env.API_TOKEN = "secret";
    const res = await request(buildApp()).get("/").set("Authorization", "Bearer wrong");
    expect(res.status).toBe(401);
  });

  it("passes through with the correct Bearer token", async () => {
    process.env.API_TOKEN = "secret";
    const res = await request(buildApp()).get("/").set("Authorization", "Bearer secret");
    expect(res.status).toBe(200);
  });
});
