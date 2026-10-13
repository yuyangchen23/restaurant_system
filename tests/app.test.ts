import "dotenv/config";
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("Get /health", () => {
  it("returns the app's health status", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
  });
});
