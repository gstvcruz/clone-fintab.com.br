import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("GET /api/v1/status", () => {
  describe("Anonymous user", () => {
    test("Retrieve current system status", async () => {
      const res = await fetch("http://localhost:3000/api/v1/status");
      expect(res.status).toBe(200);

      const body = await res.json();

      const updatedAt = body["updated_at"];
      expect(updatedAt).toBeDefined();
      const parsedUpdatedAt = new Date(updatedAt).toISOString();
      expect(parsedUpdatedAt).toEqual(updatedAt);

      const version = body.dependencies.database["version"];
      expect(version).toBeDefined();
      expect(typeof version).toBe("string");

      const maxConnections = body.dependencies.database["max_connections"];
      expect(maxConnections).toBeDefined();
      expect(typeof maxConnections).toBe("number");

      const openedConnections =
        body.dependencies.database["opened_connections"];
      expect(openedConnections).toBeDefined();
      expect(typeof openedConnections).toBe("number");
      expect(openedConnections).toEqual(1);
    });
  });
});
