import database from "infra/database";
import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import { ServiceError } from "infra/errors";

const defaultMigrationOptions = {
  dir: resolve("infra", "migrations"),
  direction: "up",
  verbose: true,
  migrationsTable: "pgmigrations",
};

async function listPendingMigrations() {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    return await migrationRunner({
      ...defaultMigrationOptions,
      dbClient,
      dryRun: true,
    });
  } catch {
    throw new ServiceError();
  } finally {
    await dbClient?.end();
  }
}

async function runPendingMigrations() {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    return await migrationRunner({
      ...defaultMigrationOptions,
      dbClient,
      dryRun: false,
    });
  } catch {
    throw new ServiceError();
  } finally {
    await dbClient?.end();
  }
}

const migrator = { runPendingMigrations, listPendingMigrations };

export default migrator;
