import type { Page } from '@playwright/test';

/**
 * Username/password pair used for HTTP Basic Auth.
 */
export type BasicAuthCreds = {
  username: string;
  password: string;
};

/**
 * Resolve global Basic Auth credentials from env vars.
 *
 * Expected env vars:
 * - `BASICAUTH_USERNAME`
 * - `BASICAUTH_PASSWORD`
 */
function resolveGlobalBasicAuth(env: NodeJS.ProcessEnv): BasicAuthCreds {
  const username = env.BASICAUTH_USERNAME;
  const password = env.BASICAUTH_PASSWORD;

  if (!username || !password) {
    throw new Error(
      `Missing global Basic Auth credentials. Expected env vars: BASICAUTH_USERNAME, BASICAUTH_PASSWORD`
    );
  }

  return { username, password };
}

/**
 * Resolve per-user Basic Auth credentials from env vars.
 *
 * Expected env vars:
 * - `${USERKEY}_BASICAUTH_USERNAME`
 * - `${USERKEY}_BASICAUTH_PASSWORD`
 */
function resolveUserBasicAuth(userKey: string, env: NodeJS.ProcessEnv): BasicAuthCreds {
  const normalized = userKey.toUpperCase();
  const usernameKey = `${normalized}_BASICAUTH_USERNAME`;
  const passwordKey = `${normalized}_BASICAUTH_PASSWORD`;

  const username = env[usernameKey];
  const password = env[passwordKey];

  if (!username || !password) {
    throw new Error(
      `Missing Basic Auth credentials for user '${userKey}'. Expected env vars: ${usernameKey}, ${passwordKey}`
    );
  }

  return { username, password };
}

/**
 * Apply HTTP Basic Auth to the given Page by setting the Authorization header.
 *
 * Rules:
 * - If `userKey` is provided -> uses `${USERKEY}_BASICAUTH_USERNAME` / `${USERKEY}_BASICAUTH_PASSWORD`.
 * - If `userKey` is omitted -> uses global `BASICAUTH_USERNAME` / `BASICAUTH_PASSWORD`.
 * - No fallback to non-basic-auth creds.
 */
export async function useBasicAuth(
  page: Page,
  userKey?: string,
  env: NodeJS.ProcessEnv = process.env
) {
  const { username, password } = userKey
    ? resolveUserBasicAuth(userKey, env)
    : resolveGlobalBasicAuth(env);

  const encoded = Buffer.from(`${username}:${password}`).toString('base64');

  await page.setExtraHTTPHeaders({
    Authorization: `Basic ${encoded}`,
  });
}
