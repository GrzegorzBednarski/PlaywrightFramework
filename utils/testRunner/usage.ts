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
  console.error('\nArgument analysis:');

  if (analysis.length === 0) {
    console.error('  No arguments provided.');
  } else {
    analysis.forEach(a => console.error(`  "${a.value}" → ${a.type}`));
  }

  console.error('==================================================================');

  console.error('\nCommands:');
  console.error('  - npm run test <environment> <testCategory> ui');
  console.error('  - npm run test <environment> ui');
  console.error('  - npm run test <environment> performanceMonitoring');
  console.error('  - npm run test <environment> performanceTest');
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
  if (testTypes.length === 0) {
    console.error('    (no test types configured in testRunnerConfig.ts)');
  } else {
    testTypes.sort().forEach(t => console.error(`    - ${t}`));
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

  console.error(
    '\nExamples:\n' +
      '  npm run test dev functional ui\n' +
      '  npm run test dev visual\n' +
      '  npm run test dev all ui\n' +
      '  npm run test dev grep:smoke\n' +
      '  npm run test dev ui\n' +
      '  npm run test dev performanceMonitoring\n' +
      '  npm run test dev performanceTest\n' +
      '  npm run test report\n'
  );
}
