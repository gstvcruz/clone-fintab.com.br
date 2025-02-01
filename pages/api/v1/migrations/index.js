import { createRouter } from "next-connect";
import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database";
import { InternalServerError, MethodNotAllowedError } from "infra/errors";

const router = createRouter();

router.get(async (req, res) => {
  const dbClient = await database.getNewClient();

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

  await dbClient.end();

  return res.status(200).json(pendingMigrations);
});

router.post(async (req, res) => {
  const dbClient = await database.getNewClient();

  const defaultMigrationOptions = {
    dbClient,
    dir: resolve("infra", "migrations"),
    direction: "up",
    dryRun: true,
    verbose: true,
    migrationsTable: "pgmigrations",
  };

  const migratedMigrations = await migrationRunner({
    ...defaultMigrationOptions,
    dryRun: false,
  });

  await dbClient.end();

  return migratedMigrations.length === 0
    ? res.status(200).json(migratedMigrations)
    : res.status(201).json(migratedMigrations);
});

export default router.handler({
  onNoMatch: (req, res) => {
    const publicError = new MethodNotAllowedError();
    return res.status(publicError.statusCode).json(publicError);
  },
  onError: (err, req, res) => {
    const publicError = new InternalServerError(err);
    console.error("\n Erro dentro do catch do next-connect:");
    console.error(publicError);
    return res.status(publicError.statusCode).json(publicError);
  },
});
