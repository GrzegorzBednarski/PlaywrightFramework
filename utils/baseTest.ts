import { test as base } from '@playwright/test';
import {
  createSessionFixtures,
  type SessionFixtureOptions,
} from './sessionManager/sessionFixtures';
import {
  createApiFixtures,
  type ApiFixtureOptions,
  apiProfile as applyApiProfile,
} from './apiTool/apiFixtures';
import type { UserSessionData } from './sessionManager';
import type { ApiClient } from './apiTool/client';

/**
 * Unified base test: sessions + API.
 *
 * Intended usage:
 * - Domain POM fixtures should import this and extend with POM-specific fixtures.
 * - Tests without POM can import directly from here.
 */

// ---------------------------------------------------------------------------
// Fixtures types
// ---------------------------------------------------------------------------

type Fixtures = {
  sessionData: UserSessionData | undefined;
  sessionMeta: Record<string, string> | undefined;
  apiConfig: import('./apiTool/types').ApiConfig;
  api: ApiClient;
};

// ---------------------------------------------------------------------------
// Options (test.use)
// ---------------------------------------------------------------------------

type Options = SessionFixtureOptions & ApiFixtureOptions;

// ---------------------------------------------------------------------------
// baseTest (sessions + api)
// ---------------------------------------------------------------------------

const baseTest = base.extend<Fixtures & Options>({
  // ---------------------------------------------------------------------------
  // Sessions
  // ---------------------------------------------------------------------------
  ...createSessionFixtures({ defaultSessionLoginKey: 'default' }),

  // ---------------------------------------------------------------------------
  // API
  // ---------------------------------------------------------------------------
  ...createApiFixtures({ defaultApiConfigKey: 'default' }),
});

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const test = baseTest;
export { expect } from '@playwright/test';

export type SessionOptions = { sessionLoginKey?: string };
export type ApiProfileOptions = import('./apiTool/apiFixtures').ApiProfileOptions;

/** Shortcut for setting session in tests without a domain POM fixture. */
export function session(userKey: string, opts?: SessionOptions) {
  baseTest.use({ userKey, sessionLoginKey: opts?.sessionLoginKey });
}

/** Shortcut for choosing api config/overrides in tests without a domain POM fixture. */
export function apiProfile(opts: ApiProfileOptions) {
  applyApiProfile(baseTest, opts);
}
