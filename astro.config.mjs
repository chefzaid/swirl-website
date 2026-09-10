import { devContact } from './server/dev-contact.mjs';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/postcss';
import { siteConfig } from './data/site.ts';
export default defineConfig({
  site: siteConfig.origin,
  trailingSlash: 'always',
  outDir: './dist/client',
  integrations: [react()],
  // The site has no Markdown code blocks; avoid unused inline highlighting.
  markdown: { syntaxHighlight: false },
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "base-uri 'none'",
        "object-src 'none'",
        "frame-src 'none'",
        "connect-src 'self'",
        "form-action 'self'",
        "img-src 'self' data:",
        "font-src 'self' data:",
        "worker-src 'none'",
      ],
    },
  },
  vite: {
    css: { postcss: { plugins: [tailwindcss()] } },
    plugins: [devContact()],
  },
});
