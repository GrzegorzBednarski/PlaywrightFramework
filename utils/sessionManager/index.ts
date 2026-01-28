import { chromium, BrowserContext, Page } from '@playwright/test';
import {
  readSession,
  writeSession,
  tryCreateLock,
  removeLock,
  waitForSessionOrLockRelease,
  StoredSession,
} from './fileSessionStore';
import { resolveCreds } from './envCreds';
import { SessionLoginConfig } from './loginTypes';
import { loadSessionLoginConfig } from './loginConfigLoader';

export interface UserSessionData extends StoredSession {}

export type SessionManagerOptions = {
  /** Which login flow to use when creating the session. */
  sessionLoginKey?: string;
};

/**
 * Dumps sessionStorage from the first page in the browser context.
 *
 * Used to persist sessionStorage into the session file (optional feature).
 */
async function dumpSessionStorage(context: BrowserContext) {
  const pages = context.pages();
  const mainPage = pages[0];
  if (!mainPage) return [];

  try {
    const url = mainPage.url();
    if (!url || url === 'about:blank') return [];
    const origin = new URL(url).origin;
    const items = await mainPage.evaluate(() =>
      Object.entries(sessionStorage).map(([name, value]) => ({ name, value }))
    );
    return [{ origin, items }];
  } catch {
    return [];
  }
}

/**
 * Dumps localStorage from the first page in the browser context.
 *
 * Used to persist localStorage into the session file (optional feature).
 */
async function dumpLocalStorage(context: BrowserContext) {
  const pages = context.pages();
  const mainPage = pages[0];
  if (!mainPage) return [];

  try {
    const url = mainPage.url();
    if (!url || url === 'about:blank') return [];
    const origin = new URL(url).origin;
    const items = await mainPage.evaluate(() =>
      Object.entries(localStorage).map(([name, value]) => ({ name, value }))
    );
    return [{ origin, items }];
  } catch {
    return [];
  }
}

/**
 * Creates a new session by running the configured `loginFlow` and persisting browser state.
 *
 * Notes:
 * - always validates that env creds for `userKey` exist
 * - applies flags from `SessionLoginConfig` (saveCookies/saveLocalStorage/saveSessionStorage)
 */
async function createSessionForUserKey(
  userKey: string,
  options?: SessionManagerOptions
): Promise<UserSessionData> {
  const config: SessionLoginConfig = await loadSessionLoginConfig(options?.sessionLoginKey);
  resolveCreds(userKey);

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const meta: Record<string, string> = {};

  await config.loginFlow({
    page,
    userKey,
    saveMeta: (arg1: string | Record<string, string>, arg2?: string) => {
      if (typeof arg1 === 'string') {
        meta[arg1] = arg2 ?? '';
        return;
      }

      for (const [k, v] of Object.entries(arg1)) {
        meta[k] = v;
      }
    },
  });

  let storageState = await context.storageState();

  if (config.saveCookies === false) {
    storageState = { ...storageState, cookies: [] };
  }

  const sessionStorage =
    config.saveSessionStorage !== false ? await dumpSessionStorage(context) : [];
  const localStorage = config.saveLocalStorage !== false ? await dumpLocalStorage(context) : [];

  await context.close();
  await browser.close();

  return {
    userKey,
    storageState,
    meta,
    sessionStorage,
    localStorage,
  };
}

/**
 * Get (or create) a stored session for a given `userKey`.
 *
 * Behavior:
 * - if session exists on disk → reuse
 * - otherwise one worker creates it under a file-lock, others wait
 *
 * @param userKey - User identifier used to resolve credentials (e.g. `ADMIN`, `TOM`).
 * @param options - Optional session options.
 * @returns Session data loaded from disk.
 *
 * @example
 * const session = await getSession('ADMIN');
 * console.log(session.meta);
 */
export async function getSession(
  userKey: string,
  options?: SessionManagerOptions
): Promise<UserSessionData> {
  const loginKey = options?.sessionLoginKey;

  const existing = readSession(userKey, loginKey);
  if (existing) {
    return existing;
  }

  if (tryCreateLock(userKey, loginKey)) {
    try {
      const created = await createSessionForUserKey(userKey, options);
      writeSession(created, loginKey);
      return created;
    } finally {
      removeLock(userKey, loginKey);
    }
  }

  await waitForSessionOrLockRelease(userKey, loginKey);

  const afterWait = readSession(userKey, loginKey);
  if (!afterWait) {
    throw new Error(`Session for userKey '${userKey}' not created after waiting.`);
  }
  return afterWait;
}

/**
 * Creates a new Playwright context using `storageState` from the stored session.
 *
 * @param userKey - User identifier used to resolve credentials.
 * @param options - Optional session options.
 */
export async function createContextWithSession(
  userKey: string,
  options?: SessionManagerOptions
): Promise<{ context: BrowserContext; session: UserSessionData }> {
  const session = await getSession(userKey, options);
  const browser = await chromium.launch();
  const context = await browser.newContext({ storageState: session.storageState });

  return { context, session };
}

/**
 * Convenience helper that opens a Page inside a session-aware context.
 *
 * @param userKey - User identifier used to resolve credentials.
 * @param options - Optional session options.
 * @returns Page + context + session + close function.
 *
 * @example
 * const { page, closeSession } = await openSession('ADMIN');
 * await page.goto('https://example.com');
 * await closeSession();
 */
export async function openSession(
  userKey: string,
  options?: SessionManagerOptions
): Promise<{
  page: Page;
  session: UserSessionData;
  context: BrowserContext;
  closeSession: () => Promise<void>;
}> {
  const { context, session } = await createContextWithSession(userKey, options);
  const page = await context.newPage();

  const closeSession = async () => {
    await context.close();
  };

  return { page, session, context, closeSession };
}
