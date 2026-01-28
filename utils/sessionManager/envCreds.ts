export interface ResolvedCreds {
  username: string;
  password: string;
}

/**
 * Resolve credentials for the given `userKey` from environment variables.
 *
 * @param userKey - User identifier used as env var prefix (e.g. `ADMIN`, `TOM`).
 * @param env - Env map to read from (defaults to `process.env`).
 * @returns Resolved username/password pair.
 *
 * @throws Error if username/password env vars are missing.
 *
 * @example
 * const { username, password } = resolveCreds('ADMIN');
 * // reads: ADMIN_USERNAME / ADMIN_PASSWORD
 */
export function resolveCreds(userKey: string, env: NodeJS.ProcessEnv = process.env): ResolvedCreds {
  const normalized = userKey.toUpperCase();
  const usernameKey = `${normalized}_USERNAME`;
  const passwordKey = `${normalized}_PASSWORD`;

  const username = env[usernameKey];
  const password = env[passwordKey];

  if (!username || !password) {
    throw new Error(
      `Missing credentials for user '${userKey}'. Expected env vars: ${usernameKey}, ${passwordKey}`
    );
  }

  return { username, password };
}
