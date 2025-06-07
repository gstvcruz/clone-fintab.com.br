import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";
import password from "models/password";
import user from "models/user";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With nonexistent username", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/nonExistentUser",
        {
          method: "PATCH",
        },
      );
      expect(response.status).toBe(404);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "Usuário não encontrado",
        action: "Verifique o nome de usuário informado.",
        status_code: 404,
      });
    });

    test("With duplicated username", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "User1",
          email: "user1@email.com",
          password: "password123",
        }),
      });
      expect(response1.status).toBe(201);

      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "User2",
          email: "user2@email.com",
          password: "password123",
        }),
      });
      expect(response2.status).toBe(201);

      const response3 = await fetch(
        "http://localhost:3000/api/v1/users/User2",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "User1",
          }),
        },
      );
      expect(response3.status).toBe(400);

      const body = await response3.json();
      expect(body).toEqual({
        name: "ValidationError",
        message: "Nome de usuário em uso.",
        action: "Utilize um nome de usuário diferente.",
        status_code: 400,
      });
    });

    test("With duplicated email", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "emailUm",
          email: "emailUm@email.com",
          password: "password123",
        }),
      });
      expect(response1.status).toBe(201);

      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "emaildois",
          email: "emaildois@email.com",
          password: "password123",
        }),
      });
      expect(response2.status).toBe(201);

      const response3 = await fetch(
        "http://localhost:3000/api/v1/users/emailUm",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "emaildois@email.com",
          }),
        },
      );
      expect(response3.status).toBe(400);

      const body = await response3.json();
      expect(body).toEqual({
        name: "ValidationError",
        message: "E-mail em uso.",
        action: "Utilize um e-mail diferente.",
        status_code: 400,
      });
    });

    test("With same username in another case", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "SameUser",
          email: "same.user@email.com",
          password: "password123",
        }),
      });
      expect(response1.status).toBe(201);

      const response3 = await fetch(
        "http://localhost:3000/api/v1/users/SameUser",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "sameUser",
          }),
        },
      );
      expect(response3.status).toBe(200);
    });

    test("With unique username", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "UniqueUserOne",
          email: "uniqueUser@email.com",
          password: "password123",
        }),
      });
      expect(response1.status).toBe(201);

      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/UniqueUserOne",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "UniqueUserTwo",
          }),
        },
      );
      expect(response2.status).toBe(200);

      const response2Body = await response2.json();
      expect(response2Body).toEqual({
        id: response2Body.id,
        username: "UniqueUserTwo",
        email: response2Body.email,
        password: response2Body.password,
        created_at: response2Body.created_at,
        updated_at: response2Body.updated_at,
      });

      expect(uuidVersion(response2Body.id)).toBe(4);
      expect(Date.parse(response2Body.created_at)).not.toBeNaN();
      expect(Date.parse(response2Body.updated_at)).not.toBeNaN();
      expect(response2Body.updated_at > response2Body.created_at).toBe(true);
    });

    test("With unique email", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "UniqueEmail",
          email: "uniqueEmailOne@email.com",
          password: "password123",
        }),
      });
      expect(response1.status).toBe(201);

      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/UniqueEmail",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "uniqueEmailTwo@email.com",
          }),
        },
      );
      expect(response2.status).toBe(200);

      const response2Body = await response2.json();
      expect(response2Body).toEqual({
        id: response2Body.id,
        username: response2Body.username,
        email: "uniqueEmailTwo@email.com",
        password: response2Body.password,
        created_at: response2Body.created_at,
        updated_at: response2Body.updated_at,
      });

      expect(uuidVersion(response2Body.id)).toBe(4);
      expect(Date.parse(response2Body.created_at)).not.toBeNaN();
      expect(Date.parse(response2Body.updated_at)).not.toBeNaN();
      expect(response2Body.updated_at > response2Body.created_at).toBe(true);
    });

    test("With new password", async () => {
      const newPassword = "newUniquePassword";

      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "UniquePassword",
          email: "uniquePassword@email.com",
          password: "uniquePassword",
        }),
      });
      expect(response1.status).toBe(201);

      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/UniquePassword",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            password: newPassword,
          }),
        },
      );
      expect(response2.status).toBe(200);

      const response2Body = await response2.json();
      expect(response2Body).toEqual({
        id: response2Body.id,
        username: response2Body.username,
        password: response2Body.password,
        email: response2Body.email,
        created_at: response2Body.created_at,
        updated_at: response2Body.updated_at,
      });

      expect(uuidVersion(response2Body.id)).toBe(4);
      expect(Date.parse(response2Body.created_at)).not.toBeNaN();
      expect(Date.parse(response2Body.updated_at)).not.toBeNaN();
      expect(response2Body.updated_at > response2Body.created_at).toBe(true);

      const userInDatabase = await user.findOneByUsername("UniquePassword");
      const passwordMatch = await password.compare(
        newPassword,
        userInDatabase.password,
      );
      const passwordMismatch = await password.compare(
        "uniquePassword",
        userInDatabase.password,
      );
      expect(passwordMatch).toBe(true);
      expect(passwordMismatch).toBe(false);
    });
  });
});
