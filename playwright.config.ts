import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { defineConfig, devices } from '@playwright/test';

// End-to-end tests run against the production build (`npm run build`) served
// by the Node server, with a fresh SQLite directory and no Odoo or email
// delivery configured.
const port = 4173;
const origin = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: 'e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [['list'], ['junit', { outputFile: 'e2e-results/junit.xml' }]]
    : 'list',
  outputDir: 'e2e-results/artifacts',
  use: {
    baseURL: origin,
    trace: 'retain-on-failure',
    // Lets a machine with another Chromium build run the suite.
    launchOptions: { executablePath: process.env.CHROMIUM_PATH || undefined },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node dist/runtime/main.js',
    url: `${origin}/healthz`,
    reuseExistingServer: false,
    env: {
      PORT: String(port),
      PUBLIC_ORIGIN: origin,
      DATA_DIR: mkdtempSync(join(tmpdir(), 'swirl-e2e-')),
      DATABASE_URL: '',
      ODOO_URL: '',
      ODOO_API_KEY: '',
      RESEND_API_KEY: '',
      MS_TENANT_ID: '',
    },
  },
});
