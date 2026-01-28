import { test as base } from '@playwright/test';
import { createSessionFixtures, type SessionFixtureOptions } from '../../utils/sessionFixtures';
import type { UserSessionData } from '../../utils/sessionManager';
import { BasicAuthPage } from './pages/basicAuth.page';
import { HomePage } from './pages/home.page';
import { LoginPage } from './pages/login.page';
import { SecurePage } from './pages/secure.page';

// ---------------------------------------------------------------------------
// POM fixtures types
// ---------------------------------------------------------------------------

type Fixtures = {
  sessionData: UserSessionData | undefined;
  sessionMeta: Record<string, string> | undefined;
  basicAuthPage: BasicAuthPage;
  homePage: HomePage;
  loginPage: LoginPage;
  securePage: SecurePage;
};

// ---------------------------------------------------------------------------
// Sessions (optional)
// ---------------------------------------------------------------------------

type Options = SessionFixtureOptions;

// ---------------------------------------------------------------------------
// Advanced configuration (typically you don't need to change this section)
// ---------------------------------------------------------------------------

const baseTest = base.extend<Fixtures & Options>({
  ...createSessionFixtures({ defaultSessionLoginKey: 'default' }),

  // ---------------------------------------------------------------------------
  // POM fixtures (add new pages/components here)
  // ---------------------------------------------------------------------------
  basicAuthPage: async ({ page }, use) => {
    await use(new BasicAuthPage(page));
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  securePage: async ({ page }, use) => {
    await use(new SecurePage(page));
  },
});

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export type SessionOptions = { sessionLoginKey?: string };

export const test = baseTest;
export { expect } from '@playwright/test';

/**
 * Set session for the current test/describe scope.
 * Must be called at the top-level or inside `test.describe`, NOT inside a `test(...)` body.
 */
export function session(userKey: string, opts?: SessionOptions) {
  baseTest.use({ userKey, sessionLoginKey: opts?.sessionLoginKey });
}
