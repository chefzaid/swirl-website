import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SqliteContactDatabase } from './sqlite.ts';
import { assetFetcher, createNodeServer, type Worker } from './server.ts';

process.umask(0o077);
const root = fileURLToPath(new URL('../', import.meta.url));
const dataDir = resolve(process.env.DATA_DIR ?? '/data');
mkdirSync(dataDir, { recursive: true, mode: 0o700 });
const database = new SqliteContactDatabase(
  resolve(dataDir, 'contact.sqlite'),
  resolve(root, 'drizzle'),
);
const bundlePath = new URL('../dist/server/index.js', import.meta.url).href;
const { default: worker } = (await import(bundlePath)) as { default: Worker };
const port = Number(process.env.PORT ?? 8080);
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error('PORT must be 1-65535');
const server = createNodeServer({
  worker,
  env: {
    DB: database,
    ASSETS: assetFetcher(resolve(root, 'dist/client')),
    MS_TENANT_ID: process.env.MS_TENANT_ID,
    MS_CLIENT_ID: process.env.MS_CLIENT_ID,
    MS_CLIENT_SECRET: process.env.MS_CLIENT_SECRET,
    CONTACT_SENDER: process.env.CONTACT_SENDER,
  },
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
  server.close(() => {
    clearTimeout(deadline);
    database.close();
  });
}
process.once('SIGTERM', stop);
process.once('SIGINT', stop);
