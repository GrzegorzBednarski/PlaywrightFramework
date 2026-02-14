import type { Browser, BrowserContext, Page } from '@playwright/test';
import { getSession, type UserSessionData } from './index';

export type SessionFixtureOptions = {
  /**
   * Optional user key used to create an authenticated browser context for this test.
   * Set via: `test.use({ userKey: 'ADMIN' })`.
   */
  userKey?: string;

  /**
   * Which session login config to use.
   * Loaded automatically by convention from: `config/sessionLogin.<sessionLoginKey>.ts`.
   */
  sessionLoginKey?: string;
};

/**
 * Creates Playwright fixtures that support reusable sessions.
 *
 * What it provides:
 * - `sessionData` / `sessionMeta` - loaded session info (or `undefined` if `userKey` is not set)
 * - `context` / `page` - created using `storageState` from the session (if `userKey` is set)
 *
 * @param opts - Optional defaults for this fixture bundle.
 * @param opts.defaultSessionLoginKey - Default `sessionLoginKey` if the test doesn't override it.
 * @returns Fixture object meant to be spread into `base.extend(...)`.
 *
 * @example
 * const test = base.extend<Fixtures & SessionFixtureOptions>({
 *   ...createSessionFixtures({ defaultSessionLoginKey: 'default' }),
 *   // ...your POM fixtures...
 * });
 */
export function createSessionFixtures(opts?: { defaultSessionLoginKey?: string }) {
  const defaultSessionLoginKey = opts?.defaultSessionLoginKey ?? 'default';

  const userKeyOption: [string | undefined, { option: true }] = [undefined, { option: true }];
  const sessionLoginKeyOption: [string, { option: true }] = [
    defaultSessionLoginKey,
    { option: true },
  ];

  return {
    userKey: userKeyOption,
    sessionLoginKey: sessionLoginKeyOption,

    /**
     * Loads session data for the selected `userKey` (if set) and exposes it as a fixture.
     * If `userKey` is not set, exposes `undefined`.
     */
    sessionData: async (
      { userKey, sessionLoginKey }: { userKey?: string; sessionLoginKey?: string },
      use: (session: UserSessionData | undefined) => Promise<void>
    ) => {
      if (!userKey) {
        await use(undefined);
        return;
      }

      const loginKey = sessionLoginKey ?? defaultSessionLoginKey;
      const session = await getSession(userKey, { sessionLoginKey: loginKey });
      await use(session);
    },

    /**
     * Convenience fixture that exposes `sessionData.meta` directly.
     */
    sessionMeta: async (
      { sessionData }: { sessionData?: UserSessionData },
      use: (meta: Record<string, string> | undefined) => Promise<void>
    ) => {
      await use(sessionData?.meta);
    },

    /**
     * Playwright `context` fixture.
     *
     * If `userKey` is set, the context is created with `storageState` loaded from the session.
     * Otherwise, a normal fresh context is created.
     */
    context: async (
      {
        browser,
        userKey,
        sessionLoginKey,
      }: { browser: Browser; userKey?: string; sessionLoginKey?: string },
      use: (context: BrowserContext) => Promise<void>
    ) => {
      const loginKey = sessionLoginKey ?? defaultSessionLoginKey;
      const storageState = userKey
        ? (await getSession(userKey, { sessionLoginKey: loginKey })).storageState
        : undefined;
      const context = await browser.newContext({ storageState });
      await use(context);
      await context.close();
    },

    /**
     * Playwright `page` fixture created from the (possibly session-aware) context.
     */
    page: async ({ context }: { context: BrowserContext }, use: (page: Page) => Promise<void>) => {
      const page = await context.newPage();
      await use(page);
      await page.close();
    },
  };
}

// Mark export as used when loaded/spread dynamically.
void createSessionFixtures;
