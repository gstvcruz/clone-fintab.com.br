import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
});

describe("POST /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    test("Run pending migrations", async () => {
      const res = await fetch("http://localhost:3000/api/v1/migrations", {
        method: "POST",
      });
      expect(res.status).toBe(201);

      const body = await res.json();
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
    });

    test("Run migrations after already applied", async () => {
      const res = await fetch("http://localhost:3000/api/v1/migrations", {
        method: "POST",
      });
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBe(0);
    });
  });
});
