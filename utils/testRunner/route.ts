import {
  openPlaywrightUI,
  runPlaywrightTests,
  runTestGroup,
  runGrep,
  runVisualTests,
} from './playwright';
import { openReport, runEslint, runPrettier } from './commands';
import { testRunnerConfig } from '../../config/testRunnerConfig';

/**
 * Route the resolved mode to the appropriate handler.
 *
 * - Handles UI, eslint, prettier, report, visual test runs.
 * - Dispatches to test types, test groups, and grep groups based on testRunnerConfig.
 * - Logs an error if the mode is unknown.
 *
 * @param env Resolved environment name (e.g. 'dev', 'qa').
 * @param mode Resolved mode (test type, group, grep:<group>, or command like 'eslint').
 */
export function routeMode(env: string, mode: string) {
  if (mode === 'ui') {
    openPlaywrightUI(env);
    return;
  }

  if (mode === 'eslint') return runEslint();
  if (mode === 'prettier') return runPrettier();
  if (mode === 'report') return openReport();

  if (mode === 'visual') {
    runVisualTests(env);
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

  console.error(`Unknown mode: ${mode}`);
}
