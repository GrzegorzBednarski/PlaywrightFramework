import { printInvalidUsage } from './usage';
import { getAvailableEnvironments, getTestCategories, getOtherCommands } from './env';

export interface AnalysisEntry {
  value: string;
  type: string;
}

/**
 * Resolve raw CLI arguments into a normalized environment and mode.
 *
 * - Normalizes argument casing and analyzes types (env, testCategory, command, ui).
 * - Validates that arguments are unique and known (otherwise prints usage and exits).
 * - Returns an object containing the resolved `env` and `mode` for the runner.
 *
 * @param rawArgs Raw CLI arguments (e.g. ['dev', 'functional']).
 */
export function resolveArgs(...rawArgs: string[]) {
  const availableEnvs = getAvailableEnvironments();
  const categories = getTestCategories();
  const commands = getOtherCommands();

  const args: string[] = rawArgs.filter(Boolean).map(a => a.toLowerCase());
  const analysis: AnalysisEntry[] = analyzeArguments(args, availableEnvs, categories, commands);

  if (args.length === 0) {
    printInvalidUsage(
      analysis,
      availableEnvs,
      categories.testTypes,
      categories.testGroups,
      categories.grepGroups
    );
    process.exit(1);
  }

  const hasInvalid = analysis.some(
    (a: AnalysisEntry) => a.type.includes('duplicate') || a.type === 'unknown'
  );
  if (hasInvalid) {
    printInvalidUsage(
      analysis,
      availableEnvs,
      categories.testTypes,
      categories.testGroups,
      categories.grepGroups
    );
    process.exit(1);
  }

  const hasUI = analysis.some((a: AnalysisEntry) => a.type === 'ui');
  if (hasUI) {
    const env = analysis.find((a: AnalysisEntry) => a.type === 'environment')?.value;
    if (!env) {
      printInvalidUsage(
        analysis,
        availableEnvs,
        categories.testTypes,
        categories.testGroups,
        categories.grepGroups
      );
      process.exit(1);
    }
    return { env, mode: 'ui' };
  }

  const env = analysis.find((a: AnalysisEntry) => a.type === 'environment')?.value;
  const testCategory = analysis.find((a: AnalysisEntry) =>
    a.type.startsWith('testCategory<')
  )?.value;
  const command = analysis.find((a: AnalysisEntry) => a.type === 'command')?.value;

  if (command && env) {
    printInvalidUsage(
      analysis,
      availableEnvs,
      categories.testTypes,
      categories.testGroups,
      categories.grepGroups
    );
    process.exit(1);
  }

  if (command) return { env: 'none', mode: command };

  if (!env || !testCategory) {
    printInvalidUsage(
      analysis,
      availableEnvs,
      categories.testTypes,
      categories.testGroups,
      categories.grepGroups
    );
    process.exit(1);
  }

  return { env, mode: testCategory };
}

/**
 * Analyze and classify CLI arguments into known types (env, testCategory, command, ui).
 *
 * @param args CLI arguments to analyze.
 * @param envs Available environments.
 * @param categories Test categories and groups.
 * @param commands Available commands.
 * @returns Array of analysis results with value and type for each argument.
 */
function analyzeArguments(
  args: string[],
  envs: string[],
  categories: { testTypes: string[]; testGroups: string[]; grepGroups: string[] },
  commands: string[]
): AnalysisEntry[] {
  const seen = { env: false, testCategory: false, command: false };

  return args.map((arg: string): AnalysisEntry => {
    if (arg === 'ui') return { value: arg, type: 'ui' };

    if (envs.includes(arg)) {
      if (seen.env) return { value: arg, type: 'environment (duplicate)' };
      seen.env = true;
      return { value: arg, type: 'environment' };
    }

    if (categories.testTypes.includes(arg)) {
      if (seen.testCategory) return { value: arg, type: 'testCategory<testType> (duplicate)' };
      seen.testCategory = true;
      return { value: arg, type: 'testCategory<testType>' };
    }

    if (categories.testGroups.includes(arg)) {
      if (seen.testCategory) return { value: arg, type: 'testCategory<testGroup> (duplicate)' };
      seen.testCategory = true;
      return { value: arg, type: 'testCategory<testGroup>' };
    }

    if (arg.startsWith('grep:')) {
      const g = arg.replace('grep:', '');
      if (categories.grepGroups.includes(g)) {
        if (seen.testCategory) return { value: arg, type: 'testCategory<grepGroup> (duplicate)' };
        seen.testCategory = true;
        return { value: arg, type: 'testCategory<grepGroup>' };
      }
    }

    if (commands.includes(arg)) {
      if (seen.command) return { value: arg, type: 'command (duplicate)' };
      seen.command = true;
      return { value: arg, type: 'command' };
    }

    return { value: arg, type: 'unknown' };
  });
}
