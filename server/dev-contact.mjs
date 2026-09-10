import { resolve } from 'node:path';
import { loadEnv } from 'vite';

export function devContact() {
  let ready;
  return {
    name: 'swirl-contact-development',
    configureServer(server) {
      const variables = {
        ...loadEnv(server.config.mode, server.config.envDir, ''),
        ...process.env,
      };
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.split('?')[0] !== '/api/contact') return next();
        try {
          ready ||= (async () => {
            const { createContactRuntime } = await server.ssrLoadModule(
              '/runtime/contact.ts',
            );
            return createContactRuntime({
              root: server.config.root,
              dataDir: resolve(
                server.config.root,
                variables.DATA_DIR ?? '.data',
              ),
              variables,
            });
          })().catch((error) => {
            ready = undefined;
            throw error;
          });
          const contact = await ready;
          const { incomingRequest } =
            await server.ssrLoadModule('/runtime/server.ts');
          const { handleContact } =
            await server.ssrLoadModule('/server/contact.ts');
          const scheme = server.config.server.https ? 'https' : 'http';
          const request = incomingRequest(
            req,
            req.url,
            new URL(`${scheme}://${req.headers.host}`),
            () => false,
          );
          const response = await handleContact(request, contact.env);
          if (
            !req.complete ||
            (!['GET', 'HEAD'].includes(request.method) && !request.bodyUsed)
          )
            res.shouldKeepAlive = false;
          res.statusCode = response.status;
          for (const [key, value] of response.headers)
            res.setHeader(key, value);
          res.end(
            req.method === 'HEAD'
              ? undefined
              : Buffer.from(await response.arrayBuffer()),
          );
        } catch {
          res.shouldKeepAlive = false;
          res.statusCode = 503;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-store');
          res.end(JSON.stringify({ error: 'unavailable' }));
        }
      });
      server.httpServer?.once('close', () => {
        void ready?.then((contact) => contact.close()).catch(() => {});
      });
    },
  };
}
