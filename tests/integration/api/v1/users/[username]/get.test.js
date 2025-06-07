import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With exact case match", async () => {
      const user = await orchestrator.createUser();

      const res = await fetch(
        `http://localhost:3000/api/v1/users/${user.username}`,
      );
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toEqual({
        id: body.id,
        username: user.username,
        email: user.email,
        password: body.password,
        created_at: body.created_at,
        updated_at: body.updated_at,
      });
      expect(Date.parse(body.created_at)).not.toBeNaN();
      expect(Date.parse(body.updated_at)).not.toBeNaN();
    });

    test("With case mismatch", async () => {
      const user = await orchestrator.createUser();

      const res = await fetch(
        `http://localhost:3000/api/v1/users/${user.username.toLowerCase()}`,
      );
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toEqual({
        id: body.id,
        username: user.username,
        email: user.email,
        password: body.password,
        created_at: body.created_at,
        updated_at: body.updated_at,
      });
      expect(Date.parse(body.created_at)).not.toBeNaN();
      expect(Date.parse(body.updated_at)).not.toBeNaN();
    });

    test("With nonexistent username", async () => {
      const res = await fetch(
        `http://localhost:3000/api/v1/users/${orchestrator.getFakeUsername()}`,
      );
      expect(res.status).toBe(404);

      const body = await res.json();
      expect(body).toEqual({
        name: "NotFoundError",
        message: "Usuário não encontrado",
        action: "Verifique o nome de usuário informado.",
        status_code: 404,
      });
    });
  });
});
