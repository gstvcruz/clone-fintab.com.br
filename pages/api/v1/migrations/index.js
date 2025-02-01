import { createRouter } from "next-connect";
import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database";
import { errorHandlers } from "infra/controller";

const router = createRouter();

router.get(async (req, res) => {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const defaultMigrationOptions = {
      dbClient,
      dir: resolve("infra", "migrations"),
      direction: "up",
      dryRun: true,
      verbose: true,
      migrationsTable: "pgmigrations",
    };

    const pendingMigrations = await migrationRunner({
      ...defaultMigrationOptions,
    });

    return res.status(200).json(pendingMigrations);
  } finally {
    await dbClient?.end();
  }
});

router.post(async (req, res) => {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const defaultMigrationOptions = {
      dbClient,
      dir: resolve("infra", "migrations"),
      direction: "up",
      dryRun: false,
      verbose: true,
      migrationsTable: "pgmigrations",
    };

    const migratedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
    });

    return migratedMigrations.length === 0
      ? res.status(200).json(migratedMigrations)
      : res.status(201).json(migratedMigrations);
  } finally {
    await dbClient?.end();
  }
});

export default router.handler(errorHandlers);
