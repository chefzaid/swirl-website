import { readFileSync, readdirSync, existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { documentRoutes } from '../data/site.ts';

// Bundle documents into the Node runtime so every HTML response receives the
// security headers and aliases enforced by the request handler.
export function pageBundle() {
  const root = resolve('dist/client');
  const sources = Object.fromEntries(
    documentRoutes.map(({ path }) => [path, path.slice(1) + 'index.html']),
  );
  let pages;
  return {
    name: 'swirl-page-bundle',
    resolveId(id) {
      if (id === 'virtual:swirl-pages') return '\0virtual:swirl-pages';
    },
    load(id) {
      if (id !== '\0virtual:swirl-pages') return;
      const actual = readdirSync(root, { recursive: true })
        .filter((file) => file.endsWith('.html'))
        .sort((a, b) => a.localeCompare(b));
      if (
        JSON.stringify(actual) !==
        JSON.stringify(
          Object.values(sources).sort((a, b) => a.localeCompare(b)),
        )
      ) {
        throw new Error('Update the page map before publishing changed routes');
      }
      pages = Object.fromEntries(
        Object.entries(sources).map(([route, file]) => [
          route,
          readFileSync(resolve(root, file), 'utf8'),
        ]),
      );
      return `export default ${JSON.stringify(pages)};`;
    },
    generateBundle() {
      if (!pages) throw new Error('Missing bundled pages');
      // Private build evidence used by the CSP regression checker.
      this.emitFile({
        type: 'asset',
        fileName: 'page-manifest.json',
        source: JSON.stringify(pages),
      });
    },
    writeBundle() {
      if (!existsSync(resolve('dist/runtime/main.js')))
        throw new Error('Node runtime build missing');
      // Remove only after the Node runtime was successfully written.
      for (const file of Object.values(sources)) rmSync(resolve(root, file));
    },
  };
}
