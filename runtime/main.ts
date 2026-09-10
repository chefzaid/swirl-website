import { resolve } from 'node:path';
import pages from 'virtual:swirl-pages';
import { createRequestHandler } from '../server/handler.ts';
import { createContactRuntime } from './contact.ts';
import { assetFetcher, createNodeServer } from './server.ts';

process.umask(0o077);
const root = resolve(process.env.APP_ROOT ?? '.');
const port = Number(process.env.PORT ?? 8080);
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error('PORT must be 1-65535');
const contact = await createContactRuntime({
  root,
  dataDir: resolve(process.env.DATA_DIR ?? resolve(root, '.data')),
  variables: process.env,
});
const env = {
  ...contact.env,
  ASSETS: assetFetcher(resolve(root, 'dist/client')),
};
const server = createNodeServer({
  handler: createRequestHandler(pages),
  env,
  origin: process.env.PUBLIC_ORIGIN ?? 'https://swirlit.dev',
  aliasHost: process.env.PUBLIC_ALIAS_HOST,
  trustedProxyCidrs: process.env.TRUSTED_PROXY_CIDRS,
  healthy: contact.healthy,
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
    await contact.close();
  });
}
process.once('SIGTERM', stop);
process.once('SIGINT', stop);
