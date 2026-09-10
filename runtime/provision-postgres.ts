import postgres from 'postgres';

// Separate administrator-only hook; the website container never receives these
// credentials. Database creation cannot run inside a transaction, so hold one
// reserved connection's session lock through role and database provisioning.
async function main() {
  const username = process.env.POSTGRES_ADMIN_USER;
  const password = process.env.POSTGRES_ADMIN_PASSWORD;
  const appPassword = process.env.WEBSITE_DB_PASSWORD;
  if (!username || !password || !appPassword)
    throw new Error('Database credentials are required');
  const sql = postgres({
    host: 'postgres.infra.svc.cluster.local',
    port: 5432,
    database: 'postgres',
    username,
    password,
    max: 1,
    connect_timeout: 5,
    connection: {
      statement_timeout: 60000,
      application_name: 'website-db-setup',
    },
    onnotice: () => {},
  });
  try {
    const connection = await sql.reserve();
    try {
      await connection.unsafe('SELECT pg_advisory_lock(193720)');
      const exists = await connection.unsafe(
        "SELECT 1 FROM pg_roles WHERE rolname = 'website_user'",
      );
      const command = await connection.unsafe(
        `SELECT format('${exists.length ? 'ALTER' : 'CREATE'} ROLE website_user LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD %L', $1::text) AS statement`,
        [appPassword],
      );
      await connection.unsafe(command[0].statement);
      const database = await connection.unsafe(
        "SELECT pg_get_userbyid(datdba) AS owner FROM pg_database WHERE datname = 'website'",
      );
      if (!database.length)
        await connection.unsafe('CREATE DATABASE website OWNER website_user');
      else if (database[0].owner !== 'website_user')
        throw new Error('Existing website database has a different owner');
      console.log('Website database and role are ready');
    } finally {
      try {
        await connection.unsafe('SELECT pg_advisory_unlock(193720)');
      } finally {
        connection.release();
      }
    }
  } finally {
    await sql.end({ timeout: 5 });
  }
}
main().catch(() => {
  console.error('Website database provisioning failed');
  process.exitCode = 1;
});
