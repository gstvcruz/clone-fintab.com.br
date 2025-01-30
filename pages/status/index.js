import useSWR from "swr";

async function fetchAPI(key) {
  const res = await fetch(key);
  const body = await res.json();
  return body;
}

export default function StatusPage() {
  useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  return (
    <>
      <h1>status</h1>
      <UpdatedAt />
      <DatabaseInfo />
    </>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let updatedAtText = "...";
  if (!isLoading && data) {
    updatedAtText = new Date(data.updated_at).toLocaleString("en-us");
  }

  return <p>last updated: {updatedAtText}</p>;
}

function DatabaseInfo() {
  return (
    <>
      <h1>database info</h1>
      <ul>
        <StaticDatabaseInfo />
        <DynamicDatabaseInfo />
      </ul>
    </>
  );
}

function StaticDatabaseInfo() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI);

  let databaseVersion = "...";
  let maxConnections = "...";
  if (!isLoading && data) {
    databaseVersion = data.dependencies.database.version;
    maxConnections = data.dependencies.database.max_connections;
  }

  return (
    <>
      <li>version: {databaseVersion}</li>
      <li>max connections: {maxConnections}</li>
    </>
  );
}

function DynamicDatabaseInfo() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let openedConnections = "...";
  if (!isLoading && data) {
    openedConnections = data.dependencies.database.opened_connections;
  }

  return <li>opened connections: {openedConnections}</li>;
}
