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
      const res = await fetch(
        `http://localhost:3000/api/v1/users/${orchestrator.getFakeUsername()}`,
        {
          method: "PATCH",
        },
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

    test("With duplicated username", async () => {
      const user1 = await orchestrator.createUser();
      const user2 = await orchestrator.createUser();

      const res = await fetch(
        `http://localhost:3000/api/v1/users/${user1.username}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: user2.username,
          }),
        },
      );
      expect(res.status).toBe(400);

      const body = await res.json();
      expect(body).toEqual({
        name: "ValidationError",
        message: "Nome de usuário em uso.",
        action: "Utilize um nome de usuário diferente.",
        status_code: 400,
      });
    });

    test("With duplicated email", async () => {
      const user1 = await orchestrator.createUser();
      const user2 = await orchestrator.createUser();

      const res = await fetch(
        `http://localhost:3000/api/v1/users/${user1.username}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user2.email,
          }),
        },
      );
      expect(res.status).toBe(400);

      const body = await res.json();
      expect(body).toEqual({
        name: "ValidationError",
        message: "E-mail em uso.",
        action: "Utilize um e-mail diferente.",
        status_code: 400,
      });
    });

    test("With same username in another case", async () => {
      const user = await orchestrator.createUser();

      const res = await fetch(
        `http://localhost:3000/api/v1/users/${user.username}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: user.username.toLowerCase(),
          }),
        },
      );
      expect(res.status).toBe(200);
    });

    test("With unique username", async () => {
      const user = await orchestrator.createUser();
      const newUsername = orchestrator.getFakeUsername();

      const res = await fetch(
        `http://localhost:3000/api/v1/users/${user.username}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: newUsername,
          }),
        },
      );
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toEqual({
        id: body.id,
        username: newUsername,
        email: body.email,
        password: body.password,
        created_at: body.created_at,
        updated_at: body.updated_at,
      });

      expect(uuidVersion(body.id)).toBe(4);
      expect(Date.parse(body.created_at)).not.toBeNaN();
      expect(Date.parse(body.updated_at)).not.toBeNaN();
      expect(body.updated_at > body.created_at).toBe(true);
    });

    test("With unique email", async () => {
      const user = await orchestrator.createUser();
      const newEmail = orchestrator.getFakeEmail();

      const res = await fetch(
        `http://localhost:3000/api/v1/users/${user.username}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: newEmail,
          }),
        },
      );
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toEqual({
        id: body.id,
        username: body.username,
        email: newEmail,
        password: body.password,
        created_at: body.created_at,
        updated_at: body.updated_at,
      });

      expect(uuidVersion(body.id)).toBe(4);
      expect(Date.parse(body.created_at)).not.toBeNaN();
      expect(Date.parse(body.updated_at)).not.toBeNaN();
      expect(body.updated_at > body.created_at).toBe(true);
    });

    test("With new password", async () => {
      const _user = await orchestrator.createUser();
      const newPassword = orchestrator.getFakePassword();

      const res = await fetch(
        `http://localhost:3000/api/v1/users/${_user.username}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            password: newPassword,
          }),
        },
      );
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toEqual({
        id: body.id,
        username: body.username,
        password: body.password,
        email: body.email,
        created_at: body.created_at,
        updated_at: body.updated_at,
      });

      expect(uuidVersion(body.id)).toBe(4);
      expect(Date.parse(body.created_at)).not.toBeNaN();
      expect(Date.parse(body.updated_at)).not.toBeNaN();
      expect(body.updated_at > body.created_at).toBe(true);

      const userInDatabase = await user.findOneByUsername(_user.username);
      const isPasswordMatch = await password.compare(
        newPassword,
        userInDatabase.password,
      );
      const isPasswordMatchWithWrongPassword = await password.compare(
        orchestrator.getFakePassword(),
        userInDatabase.password,
      );
      expect(isPasswordMatch).toBe(true);
      expect(isPasswordMatchWithWrongPassword).toBe(false);
    });
  });
});
