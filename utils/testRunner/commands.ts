import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { printStyledFailure } from './errorHandling';

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
    printStyledFailure('HTML reporter not found in Playwright config.');
    process.exitCode = 1;
    return;
  }

  const outputFolder = htmlReporter[1]?.outputFolder;
  if (!outputFolder) {
    printStyledFailure('HTML reporter outputFolder not defined in Playwright config.');
    process.exitCode = 1;
    return;
  }

  const reportPath = path.resolve(process.cwd(), outputFolder);

  if (!fs.existsSync(reportPath)) {
    printStyledFailure(
      `No Playwright HTML report found. \nYou need to run tests first. \nExpected location: ${outputFolder}`
    );
    process.exitCode = 1;
    return;
  }

  console.log('==================================================================');
  console.log('Opening Playwright HTML report');
  console.log(`Location: ${outputFolder}`);
  console.log('==================================================================\n');

  try {
    execSync(`npx playwright show-report "${reportPath}"`, { stdio: 'inherit' });
  } catch (e) {
    printStyledFailure('Failed to open Playwright report.', e);
    process.exitCode = 1;
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
  } catch (e) {
    printStyledFailure('ESLint reported issues. \nSee output above for details.', e);
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
