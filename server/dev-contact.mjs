import { readFile, readdir } from 'node:fs/promises';
export function devContact() {
  let platform;
  let ready;
  return {
    name: 'swirl-contact-development',
    configureServer(server) {
      server.middlewares.use('/api/contact', async (req, res) => {
        try {
          ready ||= (async () => {
            const { getPlatformProxy } = await import('wrangler');
            platform = await getPlatformProxy({
              configPath: 'wrangler.jsonc',
              persist: { path: '.wrangler/state/v3' },
            });
            for (const file of (await readdir('drizzle'))
              .filter((name) => name.endsWith('.sql'))
              .sort()) {
              const sql = await readFile(`drizzle/${file}`, 'utf8');
              for (const statement of sql
                .split('--> statement-breakpoint')
                .map((s) => s.trim())
                .filter(Boolean)) {
                // Local setup is idempotent; production uses the generated migrations.
                await platform.env.DB.prepare(
                  statement
                    .replace('CREATE TABLE ', 'CREATE TABLE IF NOT EXISTS ')
                    .replace('CREATE INDEX ', 'CREATE INDEX IF NOT EXISTS '),
                ).run();
              }
            }
          })();
          await ready;
          const origin = `http://${req.headers.host}`;
          const headers = new Headers();
          for (const [key, value] of Object.entries(req.headers))
            if (value)
              headers.set(key, Array.isArray(value) ? value.join(',') : value);
          const { Readable } = await import('node:stream');
          const request = new Request(`${origin}/api/contact`, {
            method: req.method,
            headers,
            ...(!['GET', 'HEAD'].includes(req.method || 'GET')
              ? { body: Readable.toWeb(req), duplex: 'half' }
              : {}),
          });
          const { handleContact } =
            await server.ssrLoadModule('/server/contact.ts');
          const response = await handleContact(request, platform.env);
          res.statusCode = response.status;
          for (const [key, value] of response.headers)
            res.setHeader(key, value);
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch {
          res.statusCode = 503;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'unavailable' }));
        }
      });
      server.httpServer?.once('close', () => platform?.dispose());
    },
  };
}
