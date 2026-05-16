import { describe, it, expect } from "@jest/globals";
import { NextRequest } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { GET, POST } = require("./route");

describe("Telemetry API — GET /api/v1/telemetry", () => {
  it("returns 200 with status message", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      status: "available",
      message: expect.any(String),
    });
  });
});

describe("Telemetry API — POST /api/v1/telemetry", () => {
  it("returns 501 Not Implemented", async () => {
    const request = new NextRequest("http://localhost:3000", {
      method: "POST",
    });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(501);
    expect(body).toMatchObject({ code: "NOT_IMPLEMENTED" });
  });
});
