import { defineConfig } from 'vite';

export default defineConfig({
  ssr: { noExternal: ['postgres'] },
  build: {
    ssr: true,
    target: 'node24',
    outDir: 'dist/runtime',
    emptyOutDir: true,
    copyPublicDir: false,
    rolldownOptions: {
      input: {
        main: 'runtime/main.ts',
        'migrate-postgres': 'runtime/migrate-postgres.ts',
        'provision-postgres': 'runtime/provision-postgres.ts',
      },
      output: { entryFileNames: '[name].js' },
    },
  },
});
