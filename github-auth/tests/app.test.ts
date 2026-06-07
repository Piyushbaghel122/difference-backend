import { describe, expect, it } from "@jest/globals";
import request from "supertest";
import app from "../index";

describe("GitHub OAuth API", () => {
  it("returns API information", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "GitHub OAuth API is running",
      loginUrl: "/auth/github"
    });
  });

  it("rejects unauthenticated users", async () => {
    const response = await request(app).get("/auth/me");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      message: "Not logged in"
    });
  });

  it("returns JSON when GitHub login fails", async () => {
    const response = await request(app).get("/login-failed");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      message: "GitHub login failed"
    });
  });
});
