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
      const _user = {
        username: orchestrator.getFakeUsername(),
        email: orchestrator.getFakeEmail(),
        password: orchestrator.getFakePassword(),
      };

      const res = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_user),
      });
      expect(res.status).toBe(201);

      const body = await res.json();
      expect(body).toEqual({
        id: body.id,
        username: _user.username,
        email: _user.email,
        password: body.password,
        created_at: body.created_at,
        updated_at: body.updated_at,
      });
      expect(uuidVersion(body.id)).toEqual(4);
      expect(Date.parse(body.created_at)).not.toBeNaN();
      expect(Date.parse(body.updated_at)).not.toBeNaN();

      const userInDatabase = await user.findOneByUsername(_user.username);
      const isPasswordMatch = await password.compare(
        _user.password,
        userInDatabase.password,
      );

      const isPasswordMatchWithWrongPassword = await password.compare(
        "wrongPassword",
        userInDatabase.password,
      );

      expect(isPasswordMatch).toBe(true);
      expect(isPasswordMatchWithWrongPassword).toBe(false);
    });

    test("With duplicated username", async () => {
      const duplicatedUsername = orchestrator.getFakeUsername();

      const user1 = {
        username: duplicatedUsername,
        email: orchestrator.getFakeEmail(),
        password: orchestrator.getFakePassword(),
      };
      const user2 = {
        username: duplicatedUsername,
        email: orchestrator.getFakeEmail(),
        password: orchestrator.getFakePassword(),
      };

      const res1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user1),
      });
      expect(res1.status).toBe(201);

      const res2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user2),
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

    test("With duplicated email", async () => {
      const duplicatedEmail = orchestrator.getFakeEmail();

      const user1 = {
        username: orchestrator.getFakeUsername(),
        email: duplicatedEmail,
        password: orchestrator.getFakePassword(),
      };
      const user2 = {
        username: orchestrator.getFakeUsername(),
        email: duplicatedEmail,
        password: orchestrator.getFakePassword(),
      };

      const res1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user1),
      });
      expect(res1.status).toBe(201);

      const res2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user2),
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
  });
});
