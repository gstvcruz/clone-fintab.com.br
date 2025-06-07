import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";
import user from "models/user";
import password from "models/password";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With unique and valid data", async () => {
      const res = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "testUser",
          email: "test@email.com",
          password: "password123",
        }),
      });
      expect(res.status).toBe(201);

      const body = await res.json();
      expect(body).toEqual({
        id: body.id,
        username: body.username,
        email: body.email,
        password: body.password,
        created_at: body.created_at,
        updated_at: body.updated_at,
      });
      expect(uuidVersion(body.id)).toEqual(4);
      expect(Date.parse(body.created_at)).not.toBeNaN();
      expect(Date.parse(body.updated_at)).not.toBeNaN();

      const userInDatabase = await user.findOneByUsername(body.username);
      const correctPasswordMatch = await password.compare(
        "password123",
        userInDatabase.password,
      );

      const incorrectPasswordMatch = await password.compare(
        "senhaErrada",
        userInDatabase.password,
      );

      expect(correctPasswordMatch).toBe(true);
      expect(incorrectPasswordMatch).toBe(false);
    });

    test("With duplicated email", async () => {
      const res1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "firstDuplicatedEmail",
          email: "duplicated@email.com",
          password: "password123",
        }),
      });
      expect(res1.status).toBe(201);

      const res2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "secondDuplicatedEmail",
          email: "Duplicated@email.com",
          password: "password123",
        }),
      });
      expect(res2.status).toBe(400);

      const body = await res2.json();
      expect(body).toEqual({
        name: "ValidationError",
        message: "E-mail em uso.",
        action: "Utilize um e-mail diferente.",
        status_code: 400,
      });
    });

    test("With duplicated username", async () => {
      const res1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "DuplicatedUsername",
          email: "duplicatedUsername1@email.com",
          password: "password123",
        }),
      });
      expect(res1.status).toBe(201);

      const res2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "duplicatedUsername",
          email: "duplicatedUsername2@email.com",
          password: "password123",
        }),
      });
      expect(res2.status).toBe(400);

      const body = await res2.json();
      expect(body).toEqual({
        name: "ValidationError",
        message: "Nome de usuário em uso.",
        action: "Utilize um nome de usuário diferente.",
        status_code: 400,
      });
    });
  });
});
