import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With exact case match", async () => {
      const exactMatchTestUser = {
        username: "ExactMatch",
        email: "exactMatch@email.com",
        password: "password123",
      };

      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(exactMatchTestUser),
      });

      const res = await fetch(
        `http://localhost:3000/api/v1/users/${exactMatchTestUser.username}`,
      );
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toEqual({
        username: exactMatchTestUser.username,
        email: exactMatchTestUser.email,
        created_at: body.created_at,
        updated_at: body.updated_at,
      });
      expect(Date.parse(body.created_at)).not.toBeNaN();
      expect(Date.parse(body.updated_at)).not.toBeNaN();
    });

    test("With case mismatch", async () => {
      const mismatchTestUser = {
        username: "MISMATCH",
        email: "mismatch@email.com",
        password: "password123",
      };

      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mismatchTestUser),
      });

      const res = await fetch(
        `http://localhost:3000/api/v1/users/${mismatchTestUser.username.toLowerCase()}`,
      );
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toEqual({
        username: mismatchTestUser.username,
        email: mismatchTestUser.email,
        created_at: body.created_at,
        updated_at: body.updated_at,
      });
      expect(Date.parse(body.created_at)).not.toBeNaN();
      expect(Date.parse(body.updated_at)).not.toBeNaN();

      return;
    });

    test("With nonexistent username", async () => {
      const res = await fetch(
        `http://localhost:3000/api/v1/users/nonextistentUser`,
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
