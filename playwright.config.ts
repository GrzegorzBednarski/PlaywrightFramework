import { defineConfig } from '@playwright/test';

export const buildDir = 'build';

export default defineConfig({
  globalSetup: require.resolve('./global-setup'),
  globalTeardown: require.resolve('./global-teardown'),
  outputDir: `${buildDir}/artifacts`,
  reporter: [
    ['./utils/cleanReporter.ts'],
    ['html', { outputFolder: `${buildDir}/html-report`, open: 'never' }],
    ['junit', { outputFile: `${buildDir}/junit/results.xml` }],
    ['json', { outputFile: `${buildDir}/json/results.json` }],
  ],
  testDir: 'tests',
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },
});
