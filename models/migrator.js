import database from "infra/database";
import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import { ServiceError } from "infra/errors";

const defaultMigrationOptions = {
  dir: resolve("infra", "migrations"),
  direction: "up",
  log: () => {},
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
  } catch (err) {
    const serviceError = new ServiceError({
      message: "Erro ao listar as migrações pendentes.",
      cause: err,
    });
    throw serviceError;
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
  } catch (err) {
    const serviceError = new ServiceError({
      message: "Erro ao rodar as migrações pendentes.",
      cause: err,
    });
    throw serviceError;
  } finally {
    await dbClient?.end();
  }
}

const migrator = { runPendingMigrations, listPendingMigrations };

export default migrator;
