import { MethodNotAllowedError } from "infra/errors";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("POST /api/v1/status", () => {
  describe("Anonymous user", () => {
    test("Retrieve current system status", async () => {
      const res = await fetch("http://localhost:3000/api/v1/status", {
        method: "POST",
      });
      expect(res.status).toBe(405);

      const body = await res.json();
      expect(typeof body).toEqual(typeof new MethodNotAllowedError());
    });
  });
});
