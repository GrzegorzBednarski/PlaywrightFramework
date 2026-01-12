import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Open the latest Playwright HTML report in the browser.
 *
 * - Reads the HTML reporter configuration from playwright.config.
 * - Verifies that the report folder exists before calling `npx playwright show-report`.
 */
export function openReport() {
  const pwConfig = require('../../playwright.config').default;
  const htmlReporter = pwConfig.reporter.find((r: any) => Array.isArray(r) && r[0] === 'html');

  if (!htmlReporter) {
    console.error('==================================================================');
    console.error('HTML reporter not found in Playwright config.');
    console.error('==================================================================');
    return;
  }

  const outputFolder = htmlReporter[1]?.outputFolder;
  if (!outputFolder) {
    console.error('==================================================================');
    console.error('HTML reporter outputFolder not defined in Playwright config.');
    console.error('==================================================================');
    return;
  }

  const reportPath = path.resolve(process.cwd(), outputFolder);

  if (!fs.existsSync(reportPath)) {
    console.error('==================================================================');
    console.error('No Playwright HTML report found.');
    console.error('You need to run tests first to generate a report.');
    console.error(`Expected location: ${outputFolder}`);
    console.error('==================================================================');
    return;
  }

  console.log('==================================================================');
  console.log('Opening Playwright HTML report');
  console.log(`Location: ${outputFolder}`);
  console.log('==================================================================\n');

  try {
    execSync(`npx playwright show-report "${reportPath}"`, { stdio: 'inherit' });
  } catch {
    console.error('==================================================================');
    console.error('Failed to open Playwright report.');
    console.error('==================================================================');
  }
}

/**
 * Run ESLint over the project sources with auto-fix enabled.
 *
 * Prints a summary block only when no issues are found.
 */
export function runEslint() {
  console.log('==================================================================');
  console.log('Running ESLint');
  console.log('==================================================================\n');

  try {
    execSync('npx eslint . --ext .ts,.js --fix --max-warnings=0', { stdio: 'inherit' });

    console.log('\n==================================================================');
    console.log('ESLint finished with no issues.');
    console.log('==================================================================\n');
  } catch {
    console.error('==================================================================');
    console.error('ESLint reported issues. See output above for details.');
    console.error('==================================================================');
    process.exit(1);
  }
}

/**
 * Run Prettier to format TypeScript and JavaScript files.
 */
export function runPrettier() {
  console.log('==================================================================');
  console.log('Running Prettier formatter');
  console.log('==================================================================\n');

  execSync(`npx prettier --write "**/*.{js,ts}"`, { stdio: 'inherit' });

  console.log('\n==================================================================');
  console.log('Prettier run completed. See above for any applied changes.');
  console.log('==================================================================\n');
}
