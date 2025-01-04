import { Client } from "pg";

async function query(qryObj) {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
  });
  console.log(
    client.host,
    client.port,
    client.user,
    client.database,
    client.password,
  );

  try {
    await client.connect();
    return await client.query(qryObj);
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    await client.end();
  }
}

export default {
  query,
};
