import { testRunnerConfig } from '../../config/testRunnerConfig';

/**
 * Print detailed usage help when CLI arguments are invalid.
 *
 * - Shows argument analysis (including duplicates and unknowns).
 * - Lists available environments, test types, test groups, and grep groups.
 * - Prints supported commands and example invocations.
 *
 * @param analysis Parsed arguments with their detected types.
 * @param envs Available environment names discovered in the /env directory.
 * @param testTypes Configured test types from testRunnerConfig.
 * @param testGroups Configured test groups from testRunnerConfig.
 * @param grepGroups Configured grep groups from testRunnerConfig.
 */
export function printInvalidUsage(
  analysis: { value: string; type: string }[] = [],
  envs: string[] = [],
  testTypes: string[] = [],
  testGroups: string[] = [],
  grepGroups: string[] = []
) {
  console.error('==================================================================');
  console.error('Some arguments are invalid. Please review the details below.');
  console.error('==================================================================');

  console.error('\nArgument analysis:');

  if (analysis.length === 0) {
    console.error('  No arguments provided.');
  } else {
    analysis.forEach(a => console.error(`  "${a.value}" → ${a.type}`));
  }

  console.error('==================================================================');

  const optional = (testRunnerConfig as any).optionalModes as
    | { visual?: boolean; performanceTest?: boolean; performanceMonitoring?: boolean }
    | undefined;

  const isVisualEnabled = optional?.visual !== false;
  const isPerformanceMonitoringEnabled = optional?.performanceMonitoring !== false;
  const isPerformanceTestEnabled = optional?.performanceTest !== false;

  console.error('\nCommands:');
  console.error('  - npm run test <environment> <testCategory>');
  console.error('  - npm run test <environment> ui');
  if (isPerformanceMonitoringEnabled) {
    console.error('  - npm run test <environment> performanceMonitoring');
  }
  if (isPerformanceTestEnabled) {
    console.error('  - npm run test <environment> performanceTest');
  }
  console.error('  - npm run test eslint');
  console.error('  - npm run test prettier');
  console.error('  - npm run test report');

  console.error('\nAvailable environments:');
  if (envs.length === 0) {
    console.error('  (no environments found in /env)');
  } else {
    envs.sort().forEach(e => console.error(`  - ${e}`));
  }

  console.error('\nTest categories:');

  console.error('\n  Test types:');
  // Include performance modes in 'test types' so users discover them next to regular categories.
  const extra: string[] = [];
  if (isPerformanceMonitoringEnabled) extra.push('performanceMonitoring');
  if (isPerformanceTestEnabled) extra.push('performanceTest');

  // NOTE: 'visual' is handled upstream via `getTestCategories()` filtering.
  const extendedTestTypes = Array.from(new Set([...(testTypes || []), ...extra]));
  if (extendedTestTypes.length === 0) {
    console.error('    (no test types configured in testRunnerConfig.ts)');
  } else {
    extendedTestTypes.sort().forEach(t => console.error(`    - ${t}`));
  }

  console.error('\n  Test groups:');
  if (testGroups.length === 0) {
    console.error('    (no test groups configured in testRunnerConfig.ts)');
  } else {
    testGroups.sort().forEach(group => {
      const types = testRunnerConfig.testGroups[
        group as keyof typeof testRunnerConfig.testGroups
      ] as string[] | undefined;

      if (!types || types.length === 0) {
        console.error(`    - ${group}`);
        console.error('        includes: (no test types configured for this group)');
        return;
      }

      const formatted = types.join(', ');

      console.error(`    - ${group}`);
      console.error(`        includes: (${formatted})`);
    });
  }

  console.error('\n  Grep groups:');
  if (grepGroups.length === 0) {
    console.error('    (no grep groups configured in testRunnerConfig.ts)');
  } else {
    grepGroups.sort().forEach(g => console.error(`    - grep:${g}`));
  }

  const exampleLines: string[] = [];
  exampleLines.push('  npm run test dev functional');

  if (isPerformanceMonitoringEnabled) exampleLines.push('  npm run test dev performanceMonitoring');
  if (isPerformanceTestEnabled) exampleLines.push('  npm run test dev performanceTest');
  if (isVisualEnabled) exampleLines.push('  npm run test dev visual');

  exampleLines.push('  npm run test dev all');
  exampleLines.push('  npm run test dev grep:smoke');
  exampleLines.push('  npm run test dev ui');
  exampleLines.push('  npm run test report');

  console.error('\nExamples:\n' + exampleLines.join('\n') + '\n');
  console.error('==================================================================');
}
