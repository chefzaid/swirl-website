import { defineConfig } from 'vite';
import { sites } from '@openai/sites-vite-plugin';
import { workerPages } from './scripts/worker-pages.mjs';
export default defineConfig({
  plugins: [sites(), workerPages()],
  build: {
    ssr: 'server/entry.ts',
    outDir: 'dist/server',
    emptyOutDir: true,
    copyPublicDir: false,
    rolldownOptions: { output: { entryFileNames: 'index.js' } },
  },
});
