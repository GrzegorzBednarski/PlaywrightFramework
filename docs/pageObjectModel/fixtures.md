# Fixtures

← [Back to main documentation](../../README.md)
↑ [Back to Page Object Model](./index.md)

## Overview

Fixtures expose pages/components to tests in a strongly typed way.
They also keep tests clean (less `const ... = new PageObject(page)` in test code).

## Configuration

Create a fixture file in: `pageObjects/${domain}/pageFixture.ts`

```ts
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
// Advanced configuration (optional)
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
```

### POM fixtures types

Add here all page objects you want to use in tests.

In most projects, you add **all pages from your POM** here, so tests never create page objects manually.

> Note: most components should be exposed from `BasePage` / `AppPage` (so they are available on every page).
> You typically don't expose components directly from fixtures.

Example:

```ts
type Fixtures = {
  sessionData: UserSessionData | undefined;
  sessionMeta: Record<string, string> | undefined;
  basicAuthPage: BasicAuthPage;
  homePage: HomePage;
  loginPage: LoginPage;
  securePage: SecurePage;
  // Components usually live in BasePage/AppPage, not fixtures.
};
```

### Sessions (optional)

 This section enables reusable sessions (no need to login in every test).
 
 In most cases you don't need to change anything in this section.
 
 For full session configuration and usage examples, see: **[Sessions](../sessionManagement/sessions.md)**.
 
 If you want to use multiple login configs (`sessionLogin.<key>.ts`) and switch between them, see:
 **[Multiple login configs](../sessionManagement/sessions.md#24-multiple-login-configs-optional)**.

### Advanced configuration (optional)

This section is a good place for more advanced fixture behaviors.

For ready-to-copy patterns (with full examples), see:

- **[Basic Auth automation](./advancedPatterns.md#basic-auth-automation)** (override the built-in `page` fixture)
- **[Multiple fixtures / multiple domains](./advancedPatterns.md#multiple-fixtures--multiple-domains)** (separate fixtures per domain / per login method)

> Note: patterns like “auto cookies/login in `goto()`” are defined in page objects (pages/components),
> not in the fixture file itself.

### POM fixtures (add new pages/components here)

 This is where you create actual **page object instances**.

 The main benefit is that tests don't need to create `new LoginPage(page)` manually.

In most projects, you add **all pages from your POM** here.

 If you want to expose a component to tests, prefer placing it on `BasePage` / `AppPage`.

Example:

```ts
const baseTest = base.extend<Fixtures & Options>({
  ...createSessionFixtures({ defaultSessionLoginKey: 'default' }),

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
```

### Exports

Export `test` (and usually `expect`) so tests can import them from this fixture.

This gives you a single import point in tests:

```ts
import { test, expect } from '../../pageObjects/${domain}/pageFixture';
```

Example:

```ts
export const test = baseTest;
export { expect } from '@playwright/test';

export type SessionOptions = { sessionLoginKey?: string };

export function session(userKey: string, opts?: SessionOptions) {
  baseTest.use({ userKey, sessionLoginKey: opts?.sessionLoginKey });
}
```

## Usage

Tests import `test` (and usually `expect`) from the fixture for the given domain.

```ts
import { test, expect } from '../../pageObjects/${domain}/pageFixture';

test('example test', async ({ homePage }) => {
  await homePage.goto();
  await expect(homePage.footer.container).toBeVisible();
});
```

Session use:

```ts
import { test, session } from '../../pageObjects/${domain}/pageFixture';

session('ADMIN');

test('basic auth page is accessible', async ({ basicAuthPage }) => {
  await basicAuthPage.goto();
  await basicAuthPage.assertBasicAuthSucceeded();
});
```
