import {
  openPlaywrightUI,
  runPlaywrightTests,
  runTestGroup,
  runGrep,
  runVisualTests,
} from './playwright';
import { openReport, runEslint, runPrettier } from './commands';
import { testRunnerConfig } from '../../config/testRunnerConfig';
import { runPerformanceMonitoring, runPerformanceTest } from './performance';
import { printStyledFailure } from './errorHandling';

/**
 * Route the resolved mode to the appropriate handler.
 *
 * - Handles UI, eslint, prettier, report, visual test runs.
 * - Handles performance modes: `performanceTest` and `performanceMonitoring`.
 * - Dispatches to test types, test groups, and grep groups based on testRunnerConfig.
 * - Logs an error if the mode is unknown.
 *
 * @param env Resolved environment name (e.g. 'dev', 'qa').
 * @param mode Resolved mode (test type, group, grep:<group>, performance mode, or command like 'eslint').
 */
export function routeMode(env: string, mode: string) {
  const optional = (testRunnerConfig as any).optionalModes as
    | { visual?: boolean; performanceTest?: boolean; performanceMonitoring?: boolean }
    | undefined;

  if (mode === 'ui') {
    openPlaywrightUI(env);
    return;
  }

  if (mode === 'eslint') return runEslint();
  if (mode === 'prettier') return runPrettier();
  if (mode === 'report') return openReport();

  if (mode === 'visual') {
    if (optional?.visual === false) {
      printStyledFailure('Mode "visual" is disabled in testRunnerConfig.optionalModes.');
      process.exitCode = 1;
      return;
    }
    runVisualTests(env);
    return;
  }

  if (mode === 'performancetest') {
    if (optional?.performanceTest === false) {
      printStyledFailure('Mode "performanceTest" is disabled in testRunnerConfig.optionalModes.');
      process.exitCode = 1;
      return;
    }
    runPerformanceTest(env);
    return;
  }

  if (mode === 'performancemonitoring') {
    if (optional?.performanceMonitoring === false) {
      printStyledFailure(
        'Mode "performanceMonitoring" is disabled in testRunnerConfig.optionalModes.'
      );
      process.exitCode = 1;
      return;
    }
    runPerformanceMonitoring(env);
    return;
  }

  if (testRunnerConfig.testTypes[mode as keyof typeof testRunnerConfig.testTypes]) {
    runPlaywrightTests(env, mode);
    return;
  }

  if (testRunnerConfig.testGroups[mode as keyof typeof testRunnerConfig.testGroups]) {
    runTestGroup(env, mode);
    return;
  }

  if (mode.startsWith('grep:')) {
    const grepKey = mode.replace('grep:', '');
    if (testRunnerConfig.grepGroups[grepKey as keyof typeof testRunnerConfig.grepGroups]) {
      runGrep(env, mode);
      return;
    }
  }

  printStyledFailure(`Unknown mode: ${mode}`);
  process.exitCode = 1;
}
