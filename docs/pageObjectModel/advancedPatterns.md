# Advanced patterns

← [Back to main documentation](../../README.md)
↑ [Back to Page Object Model](./index.md)

## Overview

Common patterns for larger projects.

## Automatic cookie handling in `goto()`

Sometimes a cookie prompt blocks the page right after navigation.
A common pattern is to make `goto()` auto-handle it by default, but still allow opting out.

### Configuration

**File:** `pageObjects/${domain}/pages/<somePage>.page.ts`

Override `goto()` and add a boolean flag.

```ts
import { waitForPageIdle } from '../../../utils/waitForPageIdle';
import { HomePage } from './home.page';

export class SomePage extends HomePage {
  // ...existing code...

  /**
   * Navigate to this page.
   * By default we auto-handle the cookie prompt.
   *
   * @param options - Optional navigation options.
   * @returns Promise<void>
   *
   * @example
   * await somePage.goto();
   * await somePage.goto({ autoAcceptCookies: false });
   */
  async goto(options?: { autoAcceptCookies?: boolean }) {
    const autoAcceptCookies = options?.autoAcceptCookies ?? true;

    await this.page.goto(this.pageUrl);
    await waitForPageIdle(this.page);

    if (autoAcceptCookies) {
      // Example options:
      // - inject a cookie in a helper (fast)
      // - click the cookie prompt UI (slower but closer to real behavior)
      await this.cookiePrompt.injectAcceptedCookie();
    }
  }
}
```

> Note: the exact cookie method depends on your domain.
> See: **[Components](./components.md)** (`CookiePromptComponent`).

### Usage

```ts
await somePage.goto();

await somePage.goto({ autoAcceptCookies: false });
```

## Automatic login in `goto()`

For many projects it is convenient to say: “go to page, and if userKey is provided, ensure we are logged in first”.

### Configuration

**File:** `pageObjects/${domain}/pages/<somePage>.page.ts`

Override `goto()` and accept an optional `userKey`.

```ts
import { waitForPageIdle } from '../../../utils/waitForPageIdle';
import { resolveCreds } from '../../../utils/sessionManager/envCreds';

export class SomePage /* extends BasePage/AppPage */ {
  // ...existing code...

  /**
   * Navigate to the page.
   * If `userKey` is provided, perform UI login after navigation.
   *
   * @param options - Optional navigation options.
   * @returns Promise<void>
   *
   * @example
   * await somePage.goto();
   * await somePage.goto({ userKey: 'ADMIN' });
   */
  async goto(options?: { userKey?: string }) {
    const userKey = options?.userKey;

    await this.page.goto(this.pageUrl);
    await waitForPageIdle(this.page);

    if (userKey) {
      const { username, password } = resolveCreds(userKey);
      await this.loginComponent.login(username, password);
    }
  }
}
```

> Tip: keep the UI login details in a `LoginPage` or `LoginComponent`.
> The `goto()` should orchestrate, not contain all selectors.

### Usage

```ts
// Navigate without logging in
await somePage.goto();

// Navigate and log in first (if needed)
await somePage.goto({ userKey: 'ADMIN' });
```

## Automatic cookie injection in `goto()`

If your application uses a cookie to hide a banner (or to set a state), you can inject it during `goto()`.

This is similar to “Automatic cookie handling”, but more generic: it’s not a UI click, it’s direct cookie injection.

### Configuration

**File:** `pageObjects/${domain}/pages/<somePage>.page.ts`

```ts
import { setCookies } from '../../../utils/setCookies';

export class SomePage /* extends BasePage/AppPage */ {
  // ...existing code...

  /**
   * Navigate to the page.
   * By default this injects selected cookies before navigation.
   *
   * @param options - Optional navigation options.
   * @returns Promise<void>
   *
   * @example
   * await somePage.goto();
   * await somePage.goto({ injectCookies: false });
   */
  async goto(options?: { injectCookies?: boolean }) {
    const injectCookies = options?.injectCookies ?? true;

    if (injectCookies) {
      await setCookies(this.page, ['TEST_COOKIE_A']);
    }

    await super.goto();
  }
}
```

### Usage

```ts
await somePage.goto();
await somePage.goto({ injectCookies: false });
```

## Choosing a different login flow (sessionLoginKey)

When you maintain multiple `sessionLogin.*.ts` configs (different domains or different login mechanics),
you can choose which one is used for session creation.

### Configuration

**Files:**
- `config/sessionLogin.default.ts` (default flow)
- `config/sessionLogin.second.ts` (another flow)

Your fixture sets the default config:

**File:** `pageObjects/${domain}/pageFixture.ts`

```ts
import { createSessionFixtures } from '../../utils/sessionFixtures';

const baseTest = base.extend<Fixtures & Options>({
  ...createSessionFixtures({ defaultSessionLoginKey: 'default' }),
});
```

### Usage

Override per describe/test file (rare case):

```ts
import { test, session } from '../../pageObjects/${domain}/pageFixture';

session('ADMIN', { sessionLoginKey: 'second' });

test('uses SECOND login flow for session creation', async ({ homePage }) => {
  await homePage.goto();
});
```

## Basic Auth automation

Before you use Basic Auth automation, read: **[Basic Auth](../sessionManagement/basicAuth.md)**.

### Global Basic Auth (per domain / per environment)

If the whole domain uses one Basic Auth, add it once in `pageObjects/${domain}/pageFixture.ts` by overriding the built-in `page` fixture inside your existing `base.extend({...})`.

```ts
import { useBasicAuth } from '../../utils/basicAuth';

const baseTest = base.extend<Fixtures & Options>({
  // ...existing code...

  // ---------------------------------------------------------------------------
  // POM fixtures (add new pages/components here)
  // ---------------------------------------------------------------------------

  page: async ({ page }, use) => {
    await useBasicAuth(page); // uses BASICAUTH_USERNAME / BASICAUTH_PASSWORD
    await use(page);
  },

  // ...existing pages/components...
});
```

### Per-user Basic Auth

If Basic Auth is per-user, add it to your session login config: **[Login flow](../sessionManagement/loginFlow.md)**.

**File:** `config/sessionLogin.<key>.ts`

```ts
import { useBasicAuth } from '../utils/basicAuth';

export const sessionLoginConfig = {
  // ...existing code...

  async loginFlow({ page, userKey /* ... */ }) {
    await useBasicAuth(page, userKey);

    // ...existing login steps...
  },
};
```

> Tip: if the whole domain is behind one Basic Auth, prefer the global fixture approach.

## Multiple fixtures / multiple domains

When you test multiple domains, keep separate folders under `pageObjects/`.
Each domain has its own pages and its own `pageFixture.ts`.

### Configuration

Example structure:

```text
pageObjects/
  theInternet/
    pages/
    components/
    pageFixture.ts
  products/
    pages/
    components/
    pageFixture.ts
tests/
  functional/
    theInternet.spec.ts
    productsNavigation.spec.ts
```

### Usage

In a test file, import `test` from the correct fixture:

```ts
import { test, expect } from '../../pageObjects/theInternet/pageFixture';

test('theInternet test', async ({ homePage }) => {
  await homePage.goto();
  await expect(homePage.footer.container).toBeVisible();
});
```

Another spec can import a different fixture:

```ts
import { test, expect } from '../../pageObjects/products/pageFixture';

test('products test', async ({ singleProductPage, page }) => {
  await singleProductPage.gotoDynamicPage({ Id: '2' });
  await expect(page).toHaveURL(singleProductPage.getDynamicPageUrl({ Id: '2' }));
});
```
