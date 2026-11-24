import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './specs',
  outputDir: './test-results',
  fullyParallel: true,
  workers: 4,
  // @live specs hit the shared public HN APIs; everything else is served from fixtures/.
  retries: 1,
  timeout: 45_000,
  reporter: [['list'], ['json', { outputFile: 'report/results.json' }]],
  use: {
    ...devices['Desktop Chrome'],
    viewport: { width: 1280, height: 900 },
    colorScheme: 'light',
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'baseline', use: { baseURL: process.env.BASELINE_URL || 'http://localhost:4000' } },
    { name: 'upgraded', use: { baseURL: process.env.UPGRADED_URL || 'http://localhost:4200' } },
  ],
});
