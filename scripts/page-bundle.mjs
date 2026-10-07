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
  // Astro writes the root 404 page as 404.html and nested ones as directories.
  const notFoundSources = { fr: '404.html', en: 'en/404/index.html' };
  let pages;
  let notFound;
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
          [...Object.values(sources), ...Object.values(notFoundSources)].sort(
            (a, b) => a.localeCompare(b),
          ),
        )
      ) {
        throw new Error('Update the page map before publishing changed routes');
      }
      const read = (files) =>
        Object.fromEntries(
          Object.entries(files).map(([key, file]) => [
            key,
            readFileSync(resolve(root, file), 'utf8'),
          ]),
        );
      pages = read(sources);
      notFound = read(notFoundSources);
      return `export default ${JSON.stringify(pages)};\nexport const notFound = ${JSON.stringify(notFound)};`;
    },
    generateBundle() {
      if (!pages || !notFound) throw new Error('Missing bundled pages');
      // Private build evidence used by the CSP and SEO regression checkers.
      this.emitFile({
        type: 'asset',
        fileName: 'page-manifest.json',
        source: JSON.stringify({ documents: pages, notFound }),
      });
    },
    writeBundle() {
      if (!existsSync(resolve('dist/runtime/main.js')))
        throw new Error('Node runtime build missing');
      // Remove only after the Node runtime was successfully written.
      for (const file of [
        ...Object.values(sources),
        ...Object.values(notFoundSources),
      ])
        rmSync(resolve(root, file));
    },
  };
}
