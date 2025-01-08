import database from "infra/database";

beforeAll(database.cleanDatabase);

test("POST to /api/v1/migrations with pending migrations should return 201", async () => {
  const res = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });
  expect(res.status).toBe(201);

  const body = await res.json();
  expect(Array.isArray(body)).toBe(true);
  expect(body.length).toBeGreaterThan(0);
});

test("POST to /api/v1/migrations with no pending migrations should return 200", async () => {
  const res = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });
  expect(res.status).toBe(200);

  const body = await res.json();
  expect(Array.isArray(body)).toBe(true);
  expect(body.length).toBe(0);
});
