export function getDb(env: { DB?: D1Database }): D1Database {
  if (!env.DB) throw new Error('Contact database is unavailable');
  return env.DB;
}
