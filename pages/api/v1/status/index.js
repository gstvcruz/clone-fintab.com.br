import { createRouter } from "next-connect";
import database from "infra/database.js";
import { errorHandlers } from "infra/controller";

const router = createRouter();

router.get(async (req, res) => {
  const updated_at = new Date().toISOString();

  let qryRes = await database.query("SHOW server_version;");
  const version = qryRes.rows[0].server_version;

  qryRes = await database.query("SHOW max_connections;");
  const max_connections = parseInt(qryRes.rows[0].max_connections);

  qryRes = await database.query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [process.env.POSTGRES_DB],
  });
  const opened_connections = qryRes.rows[0].count;

  const status = {
    updated_at,
    dependencies: {
      database: {
        version,
        max_connections,
        opened_connections,
      },
    },
  };

  res.status(200).json(status);
});

export default router.handler(errorHandlers);
