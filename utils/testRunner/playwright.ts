import * as fs from 'fs';
import * as path from 'path';
import { spawnSync } from 'child_process';
import { testRunnerConfig } from '../../config/testRunnerConfig';
import { printStyledFailure, writeErrorLog } from './errorHandling';

/**
 * Runs a shell command and exits the process if it fails.
 *
 * On failure it writes a simplified error output to `build/error.log`.
 *
 * @param command - Shell command to execute.
 * @param failureTitle - Message displayed in the console header on failure.
 */
function runCommandOrExit(command: string, failureTitle: string) {
  const res = spawnSync(command, {
    shell: true,
    encoding: 'utf8',
    stdio: 'inherit',
  });

  /** Writes best-effort diagnostics to build/error.log (used for non-zero exit codes). */
  const writePlaywrightDiagErrorLog = () => {
    try {
      const diagCommand = `${command} --reporter=line --workers=1`;
      const diag = spawnSync(diagCommand, {
        shell: true,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let bestErrorText = `${diag.stderr || ''}\n${diag.stdout || ''}`.trim();
      if (!bestErrorText && diag.error) {
        bestErrorText = (diag.error.stack || diag.error.message).trim();
      }
      if (!bestErrorText) bestErrorText = failureTitle;

      writeErrorLog(bestErrorText);
    } catch (e) {
      printStyledFailure('Failed to write build/error.log.', e);
    }
  };

  if (res.status !== null && res.status !== 0) {
    printStyledFailure(failureTitle);
    writePlaywrightDiagErrorLog();
    process.exit(res.status);
  }

  if (res.status === null && res.signal) {
    printStyledFailure(failureTitle);
    writePlaywrightDiagErrorLog();
    process.exit(1);
  }

  if (res.error) {
    printStyledFailure(failureTitle, res.error);
    writePlaywrightDiagErrorLog();
    process.exit(1);
  }
}

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

  const escaped = exclude.map((e: string) => escapeRegex(e));
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
    printStyledFailure(`No test folders configured for testType "${testType}".`);
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

  runCommandOrExit(command, 'Playwright test execution failed.');
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
    printStyledFailure(`Test group "${group}" is not defined or empty.`);
    process.exit(1);
  }

  let allFolders: string[] = [];

  for (const type of testTypes) {
    const folders = testRunnerConfig.testTypes[type as keyof typeof testRunnerConfig.testTypes] as
      | string[]
      | undefined;

    if (!folders) {
      printStyledFailure(`Test type "${type}" in group "${group}" is not defined.`);
      process.exit(1);
    }

    allFolders.push(...folders);
  }

  allFolders = excludeVisualFolders(allFolders);

  if (allFolders.length === 0) {
    printStyledFailure(`No valid folders found for test group "${group}".`);
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

  runCommandOrExit(command, `Playwright test group "${group}" failed.`);
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
    printStyledFailure(`Grep group "${grepKey}" is not defined in testRunnerConfig.`);
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
    printStyledFailure('No valid folders found for grep mode.');
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

  runCommandOrExit(command, 'Playwright grep execution failed.');
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
    printStyledFailure('No test folders configured for visual tests.');
    process.exit(1);
  }

  const envFile = path.resolve(process.cwd(), 'env', `.env.${env}`);

  let fileContent = '';
  try {
    fileContent = fs.readFileSync(envFile, 'utf8');
  } catch (e) {
    printStyledFailure(`Failed to read environment file: ${envFile}`, e);
    process.exit(1);
  }

  const tokenInEnvFile = fileContent.includes('PERCY_TOKEN=');
  const branchInEnvFile = fileContent.includes('PERCY_BRANCH=');

  const missingInEnvFile: string[] = [];
  if (!tokenInEnvFile) missingInEnvFile.push('PERCY_TOKEN');
  if (!branchInEnvFile) missingInEnvFile.push('PERCY_BRANCH');

  if (missingInEnvFile.length > 0) {
    printStyledFailure(
      `Missing Percy configuration in env/.env.${env}. Missing: ${missingInEnvFile.join(', ')}`
    );
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

  runCommandOrExit(command, 'Percy visual test execution failed.');
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

  runCommandOrExit('npx playwright test --ui', 'Failed to open Playwright UI.');
}
