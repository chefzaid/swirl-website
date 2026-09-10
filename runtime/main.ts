import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { SqliteContactDatabase } from './sqlite.ts';
import { PostgresContactDatabase } from './postgres.ts';
import { NotificationDispatcher } from './notifications.ts';
import { assetFetcher, createNodeServer, type Worker } from './server.ts';

process.umask(0o077);
const root = resolve(process.env.APP_ROOT ?? '.');
const dataDir = resolve(process.env.DATA_DIR ?? '/data');
if (!process.env.DATABASE_URL)
  mkdirSync(dataDir, { recursive: true, mode: 0o700 });
const database = process.env.DATABASE_URL
  ? new PostgresContactDatabase(process.env.DATABASE_URL)
  : new SqliteContactDatabase(
      resolve(dataDir, 'contact.sqlite'),
      resolve(root, 'drizzle'),
    );
if (!(await database.healthy())) {
  await database.close();
  throw new Error(
    'Website schema is unavailable; run the explicit migration first',
  );
}
const bundlePath = pathToFileURL(resolve(root, 'dist/server/index.js')).href;
const { default: worker } = (await import(bundlePath)) as { default: Worker };
const port = Number(process.env.PORT ?? 8080);
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error('PORT must be 1-65535');
const env = {
  DB: database,
  ASSETS: assetFetcher(resolve(root, 'dist/client')),
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  MS_TENANT_ID: process.env.MS_TENANT_ID,
  MS_CLIENT_ID: process.env.MS_CLIENT_ID,
  MS_CLIENT_SECRET: process.env.MS_CLIENT_SECRET,
  CONTACT_SENDER: process.env.CONTACT_SENDER,
};
const dispatcher =
  database instanceof PostgresContactDatabase
    ? new NotificationDispatcher(database, env)
    : undefined;
if (database instanceof PostgresContactDatabase && dispatcher)
  database.deliverNotification = (id) => dispatcher.deliver(id);
const stopNotifications = dispatcher?.start();
const server = createNodeServer({
  worker,
  env,
  origin: process.env.PUBLIC_ORIGIN ?? 'https://swirlit.dev',
  trustedProxyCidrs: process.env.TRUSTED_PROXY_CIDRS,
  healthy: () => database.healthy(),
});
server.listen(port, '0.0.0.0', () => {
  console.log(`Website listening on port ${port}`);
});
let stopping = false;
function stop() {
  if (stopping) return;
  stopping = true;
  const deadline = setTimeout(() => {
    server.closeAllConnections();
  }, 20_000);
  deadline.unref();
  server.close(async () => {
    clearTimeout(deadline);
    await stopNotifications?.();
    await database.close();
  });
}
process.once('SIGTERM', stop);
process.once('SIGINT', stop);
