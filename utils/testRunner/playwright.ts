import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { testRunnerConfig } from '../../config/testRunnerConfig';

/**
 * Escape a string so it can be safely used inside a regular expression.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Filter out any folders that relate to visual tests (folder name includes 'visual').
 */
function excludeVisualFolders(folders: string[]): string[] {
  return folders.filter(f => !f.toLowerCase().includes('visual'));
}

/**
 * Build a single regex string for grep-invert from testRunnerConfig.grepExclude.
 *
 * @returns A grouped regex string like `(pattern1|pattern2)` or null when nothing to exclude.
 */
function buildGrepExcludeRegex(): string | null {
  const exclude = testRunnerConfig.grepExclude;

  if (!exclude || exclude.length === 0) {
    return null;
  }

  const escaped = exclude.map(e => escapeRegex(e));
  return `(${escaped.join('|')})`;
}

/**
 * Run Playwright tests for a single test type (e.g. 'functional', 'accessibility').
 *
 * @param env Resolved environment name (used only for logging).
 * @param testType Key from testRunnerConfig.testTypes.
 */
export function runPlaywrightTests(env: string, testType: string) {
  let folders = testRunnerConfig.testTypes[testType as keyof typeof testRunnerConfig.testTypes] as
    | string[]
    | undefined;

  if (!folders || folders.length === 0) {
    console.error('==================================================================');
    console.error(`No test folders configured for testType "${testType}".`);
    console.error('==================================================================');
    process.exit(1);
  }

  if (testType !== 'visual') {
    folders = excludeVisualFolders(folders);
  }

  const excludeRegex = buildGrepExcludeRegex();
  const excludePart = excludeRegex ? ` --grep-invert "${excludeRegex}"` : '';

  const command = `npx playwright test ${folders.join(' ')}${excludePart}`;

  console.log('==================================================================');
  console.log('Running Playwright tests');
  console.log(`Environment: ${env}`);
  console.log(`Test type: ${testType}`);
  console.log(`Folders: ${folders.join(', ')}`);
  console.log('==================================================================\n');

  try {
    execSync(command, { stdio: 'inherit' });
  } catch {
    console.error('==================================================================');
    console.error('Playwright test execution failed.');
    console.error('==================================================================');
    process.exit(1);
  }
}

/**
 * Run a logical test group composed of multiple test types.
 *
 * @param env Resolved environment name (used only for logging).
 * @param group Key from testRunnerConfig.testGroups.
 */
export function runTestGroup(env: string, group: string) {
  const testTypes = testRunnerConfig.testGroups[
    group as keyof typeof testRunnerConfig.testGroups
  ] as string[] | undefined;

  if (!testTypes || testTypes.length === 0) {
    console.error('==================================================================');
    console.error(`Test group "${group}" is not defined or empty.`);
    console.error('==================================================================');
    process.exit(1);
  }

  let allFolders: string[] = [];

  for (const type of testTypes) {
    const folders = testRunnerConfig.testTypes[type as keyof typeof testRunnerConfig.testTypes] as
      | string[]
      | undefined;

    if (!folders) {
      console.error('==================================================================');
      console.error(`Test type "${type}" in group "${group}" is not defined.`);
      console.error('==================================================================');
      process.exit(1);
    }

    allFolders.push(...folders);
  }

  allFolders = excludeVisualFolders(allFolders);

  if (allFolders.length === 0) {
    console.error('==================================================================');
    console.error(`No valid folders found for test group "${group}".`);
    console.error('==================================================================');
    process.exit(1);
  }

  const excludeRegex = buildGrepExcludeRegex();
  const excludePart = excludeRegex ? ` --grep-invert "${excludeRegex}"` : '';

  const command = `npx playwright test ${allFolders.join(' ')}${excludePart}`;

  console.log('==================================================================');
  console.log('Running test group');
  console.log(`Environment: ${env}`);
  console.log(`Group: ${group}`);
  console.log(`Test types: ${testTypes.join(', ')}`);
  console.log(`Folders: ${allFolders.join(', ')}`);
  console.log('==================================================================\n');

  try {
    execSync(command, { stdio: 'inherit' });
  } catch {
    console.error('==================================================================');
    console.error(`Playwright test group "${group}" failed.`);
    console.error('==================================================================');
    process.exit(1);
  }
}

/**
 * Run tests filtered by a configured grep group (grep:<groupName>).
 *
 * @param env Resolved environment name (used only for logging).
 * @param grepMode Mode string in form of `grep:<groupName>`.
 */
export function runGrep(env: string, grepMode: string) {
  const grepKey = grepMode.replace('grep:', '');

  const rawRegex = testRunnerConfig.grepGroups[
    grepKey as keyof typeof testRunnerConfig.grepGroups
  ] as string | undefined;

  if (!rawRegex) {
    console.error('==================================================================');
    console.error(`Grep group "${grepKey}" is not defined in testRunnerConfig.`);
    console.error('==================================================================');
    process.exit(1);
  }

  const escapedRegex = escapeRegex(rawRegex);

  let allFolders: string[] = [];

  for (const type of Object.keys(testRunnerConfig.testTypes)) {
    const folders = testRunnerConfig.testTypes[type as keyof typeof testRunnerConfig.testTypes] as
      | string[]
      | undefined;

    if (folders) {
      allFolders.push(...folders);
    }
  }

  allFolders = excludeVisualFolders(allFolders);

  if (allFolders.length === 0) {
    console.error('==================================================================');
    console.error('No valid folders found for grep mode.');
    console.error('==================================================================');
    process.exit(1);
  }

  const excludeRegex = buildGrepExcludeRegex();
  const excludePart = excludeRegex ? ` --grep-invert "${excludeRegex}"` : '';

  const command = `npx playwright test ${allFolders.join(' ')} --grep "${escapedRegex}"${excludePart}`;

  console.log('==================================================================');
  console.log('Running GREP mode');
  console.log(`Environment: ${env}`);
  console.log(`Grep group: ${grepKey}`);
  console.log(`Regex: ${rawRegex}`);
  console.log('==================================================================\n');

  try {
    execSync(command, { stdio: 'inherit' });
  } catch {
    console.error('==================================================================');
    console.error('Playwright grep execution failed.');
    console.error('==================================================================');
    process.exit(1);
  }
}

/**
 * Run visual tests with Percy for the given environment.
 *
 * - Validates Percy variables in the env file and runtime (process.env).
 * - Applies grep-exclude rules before executing Percy+Playwright.
 *
 * @param env Resolved environment name (used to pick env/.env.<env> and for logging).
 */
export function runVisualTests(env: string) {
  const folders = (testRunnerConfig.testTypes as Record<string, string[]>).visual as
    | string[]
    | undefined;

  if (!folders || folders.length === 0) {
    console.error('==================================================================');
    console.error('No test folders configured for visual tests.');
    console.error('==================================================================');
    process.exit(1);
  }

  const envFile = path.resolve(process.cwd(), 'env', `.env.${env}`);

  let fileContent = '';
  try {
    fileContent = fs.readFileSync(envFile, 'utf8');
  } catch {
    console.error(`Failed to read environment file: ${envFile}`);
    process.exit(1);
  }

  const tokenInEnvFile = fileContent.includes('PERCY_TOKEN=');
  const branchInEnvFile = fileContent.includes('PERCY_BRANCH=');

  const missingInEnvFile: string[] = [];
  if (!tokenInEnvFile) missingInEnvFile.push('PERCY_TOKEN');
  if (!branchInEnvFile) missingInEnvFile.push('PERCY_BRANCH');

  if (missingInEnvFile.length > 0) {
    console.error('==================================================================');
    console.error(`Missing Percy configuration in env/.env.${env}`);
    console.error('The following variables are missing:');
    missingInEnvFile.forEach(v => console.error(`  - ${v}`));
    console.error('==================================================================');
    process.exit(1);
  }

  const excludeRegex = buildGrepExcludeRegex();
  const excludePart = excludeRegex ? ` --grep-invert "${excludeRegex}"` : '';

  const command = `npx percy exec -- npx playwright test ${folders.join(' ')}${excludePart} --workers=1`;

  console.log('==================================================================');
  console.log('Running VISUAL tests (Percy)');
  console.log(`Environment: ${env}`);
  console.log(`Folders: ${folders.join(', ')}`);
  console.log(`Percy branch: ${process.env.PERCY_BRANCH}`);
  console.log('==================================================================\n');

  try {
    execSync(command, { stdio: 'inherit' });
  } catch {
    console.error('==================================================================');
    console.error('Percy visual test execution failed.');
    console.error('==================================================================');
    process.exit(1);
  }
}

/**
 * Open the Playwright UI test runner.
 *
 * @param env Resolved environment name (used only for logging).
 */
export function openPlaywrightUI(env: string) {
  console.log('==================================================================');
  console.log('Opening Playwright UI');
  console.log(`Environment: ${env}`);
  console.log('==================================================================\n');

  try {
    execSync('npx playwright test --ui', { stdio: 'inherit' });
  } catch {
    console.error('==================================================================');
    console.error('Failed to open Playwright UI.');
    console.error('==================================================================');
    process.exit(1);
  }
}
