import { createRouter } from "next-connect";
import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database";
import { InternalServerError, MethodNotAllowedError } from "infra/errors";

const router = createRouter();

router.get(async (req, res) => {
  let dbClient;

  try {
    const defaultMigrationOptions = {
      dbClient: await database.getNewClient(),
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
    await dbClient.end();
  }
});

router.post(async (req, res) => {
  let dbClient;

  try {
    const defaultMigrationOptions = {
      dbClient: await database.getNewClient(),
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

    return migratedMigrations.length === 0
      ? res.status(200).json(migratedMigrations)
      : res.status(201).json(migratedMigrations);
  } finally {
    await dbClient.end();
  }
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
