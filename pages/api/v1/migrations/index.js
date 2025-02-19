import { createRouter } from "next-connect";
import { errorHandlers } from "infra/controller";
import migrator from "models/migrator";

const router = createRouter();

router.get(async (req, res) => {
  const pendingMigrations = await migrator.listPendingMigrations();
  return res.status(200).json(pendingMigrations);
});

router.post(async (req, res) => {
  const migratedMigrations = await migrator.runPendingMigrations();

  return migratedMigrations.length === 0
    ? res.status(200).json(migratedMigrations)
    : res.status(201).json(migratedMigrations);
});

export default router.handler(errorHandlers);
