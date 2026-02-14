# Fixtures

← [Back to main documentation](../../README.md)
↑ [Back to Page Object Model](./index.md)

## Overview

Fixtures expose pages/components to tests in a strongly typed way.
They also keep tests clean (less `const ... = new PageObject(page)` in test code).

---

## Configuration

Create a fixture file in: `pageObjects/${domain}/pageFixture.ts`

```ts
import { test as baseTest } from '../../utils/baseTest';

import { BasicAuthPage } from './pages/basicAuth.page';
import { HomePage } from './pages/home.page';
import { LoginPage } from './pages/login.page';
import { SecurePage } from './pages/secure.page';

// ---------------------------------------------------------------------------
// POM fixtures types
// ---------------------------------------------------------------------------

type Fixtures = {
  // Domain pages/components:
  basicAuthPage: BasicAuthPage;
  homePage: HomePage;
  loginPage: LoginPage;
  securePage: SecurePage;
};

// ---------------------------------------------------------------------------
// POM fixtures (add new pages/components here)
// ---------------------------------------------------------------------------

const test = baseTest.extend<Fixtures>({
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

export { expect } from '@playwright/test';
export { test };
```

### POM fixtures types

Add here all page objects you want to use in tests.

In most projects, you add **all pages from your POM** here, so tests never create page objects manually.

> Note: most components should be exposed from `BasePage` / `AppPage` (so they are available on every page).
> You typically don't expose components directly from fixtures.

### POM fixtures (add new pages/components here)

This is where you create actual **page object instances**.

The main benefit is that tests don't need to create `new LoginPage(page)` manually.

In most projects, you add **all pages from your POM** here.

If you want to expose a component to tests, prefer placing it on `BasePage` / `AppPage`.

Example:

```ts
const test = baseTest.extend<Fixtures>({
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

#### Overriding default session & api config (optional)

If you have multiple domains/fixtures and each needs different defaults,
set them in the fixture so every test importing this fixture inherits them.

Add the options **directly inside** `baseTest.extend(...)` (in the same object where you define pages):

```ts
const test = baseTest.extend<Fixtures>({
  // Defaults (this domain)
  sessionLoginKey: 'dummyjson',
  apiConfigKey: 'dummyjson.guest',

  // Pages/components
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
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
export { expect } from '@playwright/test';
export { test };
```

---

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
