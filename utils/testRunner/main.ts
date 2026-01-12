import { resolveArgs } from './args';
import { validateEnvironmentExists } from './env';
import { initializeDotenv } from '../dotenv';
import { dotenvConfig } from '../../config/dotenvConfig';
import { routeMode } from './route';

/**
 * Entry point for the custom test runner.
 *
 * - Parses CLI arguments (environment, test category, command).
 * - Validates that the requested environment exists.
 * - Initializes dotenv for the selected environment.
 * - Routes execution to the appropriate mode handler (tests, UI, eslint, prettier, report).
 *
 * @param args Raw CLI arguments passed after the npm script (e.g. ['dev', 'functional']).
 */
export function runTestRunner(args: string[]) {
  const { env, mode } = resolveArgs(...args);

  const isCommand = mode === 'eslint' || mode === 'prettier' || mode === 'report';

  if (isCommand) {
    routeMode(env, mode);
    return;
  }

  if (!validateEnvironmentExists(env)) {
    process.exit(1);
  }

  process.env.ENV = env;
  initializeDotenv(env, dotenvConfig);

  routeMode(env, mode);
}
