import { version as uuidVersion } from "uuid";
import setCookieParser from "set-cookie-parser";

import orchestrator from "tests/orchestrator";
import session from "models/session";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/sessions", () => {
  describe("Anonymous user", () => {
    const unauthorizedErrorObject = {
      name: "UnauthorizedError",
      message: "E-mail ou senha inválidos.",
      action: "Verifique o e-mail e senha informados.",
      status_code: 401,
    };

    test("With incorrect email and correct password", async () => {
      const password = orchestrator.getFakePassword();
      await orchestrator.createUser({ password });

      const res = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: orchestrator.getFakeEmail(),
          password,
        }),
      });
      expect(res.status).toBe(401);

      const body = await res.json();
      expect(body).toEqual(unauthorizedErrorObject);
    });

    test("With correct email and incorrect password", async () => {
      const email = orchestrator.getFakeEmail();
      await orchestrator.createUser({ email });

      const res = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password: orchestrator.getFakePassword(),
        }),
      });
      expect(res.status).toBe(401);

      const body = await res.json();
      expect(body).toEqual(unauthorizedErrorObject);
    });

    test("With incorrect email and incorrect password", async () => {
      await orchestrator.createUser();

      const res = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: orchestrator.getFakePassword(),
          password: orchestrator.getFakePassword(),
        }),
      });
      expect(res.status).toBe(401);

      const body = await res.json();
      expect(body).toEqual(unauthorizedErrorObject);
    });

    test("With correct email and correct password", async () => {
      const password = orchestrator.getFakePassword();
      const email = orchestrator.getFakeEmail();
      const user = await orchestrator.createUser({ email, password });

      const res = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });
      expect(res.status).toBe(201);

      const body = await res.json();
      expect(body).toEqual({
        id: body.id,
        token: body.token,
        user_id: user.id,
        expires_at: body.expires_at,
        created_at: body.created_at,
        updated_at: body.updated_at,
      });

      expect(uuidVersion(body.id)).toEqual(4);
      expect(Date.parse(body.expires_at)).not.toBeNaN();
      expect(Date.parse(body.created_at)).not.toBeNaN();
      expect(Date.parse(body.updated_at)).not.toBeNaN();

      const expiresAt = new Date(body.expires_at).setMilliseconds(0);
      const createdAt = new Date(body.created_at).setMilliseconds(0);

      expect(expiresAt - createdAt).toBe(session.EXPIRATION_IN_MILLISECONDS);

      const parsedSetCookie = setCookieParser(res, { map: true });
      const sessionCookie = parsedSetCookie.session_id;
      expect(sessionCookie).toEqual({
        name: "session_id",
        expires: new Date(expiresAt),
        maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
        httpOnly: true,
        path: "/",
        value: body.token,
      });
    });
  });
});
