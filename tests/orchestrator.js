import retry from "async-retry";
import { faker } from "@faker-js/faker";

import database from "infra/database";
import migrator from "models/migrator";
import user from "models/user";

async function waitForAllServices() {
  await waitForWebServer();

  async function waitForWebServer() {
    return retry(fetchStatusPage, { retries: 100, maxTimeout: 1000 });

    async function fetchStatusPage() {
      const res = await fetch("http://localhost:3000/api/v1/status");

      if (res.status !== 200) {
        throw Error();
      }
    }
  }
}

async function clearDatabase() {
  await database.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
}

async function runPendingMigrations() {
  await migrator.runPendingMigrations();
}

async function createUser(userObject) {
  return await user.create({
    username: userObject?.username || getFakeUsername(),
    email: userObject?.email || getFakeEmail(),
    password: userObject?.password || getFakePassword(),
  });
}

function getFakeUsername() {
  return faker.internet.username().replace(/[_.-]/g, "");
}

function getFakeEmail() {
  return faker.internet.email();
}

function getFakePassword() {
  return faker.internet.password();
}

const orchestrator = {
  waitForAllServices,
  clearDatabase,
  runPendingMigrations,
  createUser,
  getFakeUsername,
  getFakeEmail,
  getFakePassword,
};

export default orchestrator;
