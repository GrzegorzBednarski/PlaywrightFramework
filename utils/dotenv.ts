import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

export interface DotenvOptions {
  override: boolean;
  enableLogging: boolean;
}

/**
 * Load environment configuration from a specific .env file.
 *
 * - Always loads from the "env" directory.
 * - Throws an error if the file does not exist.
 * - Calls dotenv.config with override + quiet=true.
 * - Logs which file was loaded (once per process).
 *
 * @param env - The environment name (e.g. "dev", "qa", "stg")
 * @param options - Dotenv loading options
 * @returns The absolute path to the loaded .env file
 */
export function loadEnvironmentConfig(env: string, options: DotenvOptions): string {
  const { override, enableLogging } = options;

  const envDirectory = 'env';
  const quiet = true;

  const envFile = path.resolve(process.cwd(), envDirectory, `.env.${env}`);

  if (!fs.existsSync(envFile)) {
    throw new Error(`[dotenv] Environment file not found: env/.env.${env}`);
  }

  dotenv.config({
    path: envFile,
    override,
    quiet,
  });

  if (!process.env.__ENV_FILE_LOGGED__ && enableLogging) {
    process.env.__ENV_FILE_LOGGED__ = 'true';
    console.log(`[dotenv] Loaded environment: ${env}`);
  }

  return envFile;
}

/**
 * Initialize dotenv for a specific environment.
 *
 * - Merges user-provided options with defaults.
 * - Loads env/.env.<env>.
 * - Exits the process on error.
 *
 * @param env - The environment name to load
 * @param options - Optional dotenv options
 */
export function initializeDotenv(env: string, options?: Partial<DotenvOptions>): void {
  const defaultOptions: DotenvOptions = {
    override: true,
    enableLogging: true,
  };

  const mergedOptions: DotenvOptions = {
    ...defaultOptions,
    ...options,
  };

  try {
    loadEnvironmentConfig(env, mergedOptions);
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : '[dotenv] Unknown error while loading environment config';
    console.error(message);
    process.exit(1);
  }
}
