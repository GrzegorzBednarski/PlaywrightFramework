import { defineConfig } from '@playwright/test';
import './config/dotenvConfig';

export const buildDir = 'build';

export default defineConfig({
  expect: {
    timeout: Number(process.env.EXPECT_TIMEOUT) || 5000,
  },
  fullyParallel: true,
  globalSetup: require.resolve('./global-setup'),
  globalTeardown: require.resolve('./global-teardown'),
  outputDir: `${buildDir}/artifacts`,
  reporter: [
    ['./utils/cleanReporter.ts'],
    ['html', { outputFolder: `${buildDir}/html-report`, open: 'never' }],
    ['junit', { outputFile: `${buildDir}/junit/results.xml` }],
    ['json', { outputFile: `${buildDir}/json/results.json` }],
  ],
  retries: Number(process.env.RETRIES) || 0,
  testDir: 'tests',
  timeout: Number(process.env.TEST_TIMEOUT) || 30000,
  use: {
    actionTimeout: Number(process.env.ACTION_TIMEOUT) || 10000,
    baseURL: process.env.BASE_URL,
    navigationTimeout: Number(process.env.NAVIGATION_TIMEOUT) || 15000,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  // Limit workers in CI to X, use Y locally
  workers: process.env.CI ? 2 : 6,
});
