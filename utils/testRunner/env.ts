import * as fs from 'fs';
import * as path from 'path';
import { testRunnerConfig } from '../../config/testRunnerConfig';
import { printStyledFailure } from './errorHandling';

/**
 * Discover available environments based on files in the /env directory.
 *
 * Looks for files matching `.env.<name>` and returns the list of `<name>` values.
 */
export function getAvailableEnvironments(): string[] {
  const envDir = path.resolve(process.cwd(), 'env');
  if (!fs.existsSync(envDir)) return [];

  return fs
    .readdirSync(envDir)
    .filter((file: string) => file.startsWith('.env.') && file !== '.env.example')
    .map((file: string) => file.replace('.env.', ''));
}

/**
 * Validate that the requested environment has a corresponding env/.env.<env> file.
 *
 * Logs an error and returns false if the file does not exist.
 *
 * @param env Environment name to validate (e.g. 'dev', 'qa').
 */
export function validateEnvironmentExists(env: string): boolean {
  const envFilePath = path.resolve(process.cwd(), 'env', `.env.${env}`);

  if (!fs.existsSync(envFilePath)) {
    printStyledFailure(
      `Environment "${env}" is not configured. \nMissing file: env/.env.${env}. \nMake sure the environment file exists.`
    );
    return false;
  }

  return true;
}

/**
 * Return configured test types, groups and grep groups from testRunnerConfig.
 */
export function getTestCategories() {
  return {
    testTypes: Object.keys(testRunnerConfig.testTypes),
    testGroups: Object.keys(testRunnerConfig.testGroups),
    grepGroups: Object.keys(testRunnerConfig.grepGroups),
  };
}

/**
 * Return supported non-test commands that can be run via the test runner.
 */
export function getOtherCommands() {
  return ['eslint', 'prettier', 'report'];
}
