# Base pages

← [Back to main documentation](../../README.md)
↑ [Back to Page Object Model](./index.md)

## Overview

Base pages centralize shared helpers so page classes stay small and consistent.

---

## Configuration

This file should centralize shared helpers so page classes stay small and consistent.

Create a base page file in: `pageObjects/${domain}/base.page.ts`

```ts
import { Page } from '@playwright/test';
import { waitForPageIdle } from '../../utils/waitForPageIdle';
import { CookiePromptComponent } from './components/cookiePrompt.component';

export abstract class BasePage {
  // ---------------------------------------------------------------------------
  // Core setup
  // ---------------------------------------------------------------------------

  protected abstract pageUrl: string;
  protected urlPattern?: string;
  public cookiePrompt: CookiePromptComponent;

  // ---------------------------------------------------------------------------
  // Shared components (optional)
  // ---------------------------------------------------------------------------

  constructor(protected page: Page) {
    this.cookiePrompt = new CookiePromptComponent(page);
  }

  // ---------------------------------------------------------------------------
  // URL helpers (optional for dynamic pages)
  // ---------------------------------------------------------------------------

  /**
   * Build a dynamic URL by replacing placeholders defined in your url pattern.
   *
   * @param params - Values used to replace placeholders (e.g. `{ id: 123 }`).
   * @example
   * const url = userProfilePage.getDynamicPageUrl({ id: 123 });
   * await expect(page).toHaveURL(url);
   */
  getDynamicPageUrl(params: Record<string, string | number>): string {
    if (!this.urlPattern) {
      throw new Error(`urlPattern is not defined for ${this.constructor.name}`);
    }

    let url = this.urlPattern;
    for (const [key, value] of Object.entries(params)) {
      url = url.replace(`{${key}}`, encodeURIComponent(String(value)));
    }
    return url;
  }

  /**
   * Expose the configured URL for this page object.
   */
  getPageUrl(): string {
    return this.pageUrl;
  }

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  /**
   * Navigate to a dynamic page and wait until the page is idle.
   *
   * @param params - Values used to replace placeholders (e.g. `{ id: 123 }`).
   * @example
   * await userProfilePage.gotoDynamicPage({ id: 123 });
   */
  async gotoDynamicPage(params: Record<string, string | number>) {
    const url = this.getDynamicPageUrl(params);
    await this.page.goto(url);
    await waitForPageIdle(this.page);
  }

  /**
   * Navigate to this page and wait until the page is idle.
   */
  async goto() {
    await this.page.goto(this.pageUrl);
    await waitForPageIdle(this.page);
  }
}
```

Typical helpers:

- **`getDynamicPageUrl(params)`** - build a dynamic URL from a pattern.
- **`getPageUrl()`** - return the configured URL/path.
- **`goto()`** - navigate to a page.
- **`gotoDynamicPage(params)`** - navigate to a dynamic URL.
- **`waitForPageIdle()`** - wait until the page becomes stable.

> Tip: if **all pages** in a domain share the same layout (header/footer), you can keep such components directly in `BasePage`. If only authenticated pages share the layout, prefer an `AppPage` layer instead.

To reuse shared helpers, extend `BasePage` (or `AppPage` if you have a shared logged-in layout).

```ts
import { BasePage } from '../base.page';

export class LoginPage extends BasePage {
  protected pageUrl = '/login';
}
```

For pages behind a login wall, create an `AppPage` that extends `BasePage` and then extend `AppPage` in your authenticated pages.
See: **[AppPage](./appPage.md)**

### Shared components:
Adding shared components is also possible (example: cookie prompt).
- If the element exists on **all pages** in a domain (e.g. cookie prompt), keep it in `BasePage`.
- If the element exists only after login (e.g. logged-in header/menu), keep it in `AppPage`.

```ts
import { CookiePromptComponent } from './components/cookiePrompt.component';

export abstract class BasePage {
  // ...existing code...
  cookiePrompt: CookiePromptComponent;

  constructor(protected page: Page) {
    // ...existing code...
    this.cookiePrompt = new CookiePromptComponent(this.page);
  }
}
```

---

## Usage

If your page object extends `BasePage`, you can use all `BasePage` helpers on that page.

#### `waitForPageIdle()`

`waitForPageIdle()` is used inside `goto()` / `gotoDynamicPage()`.
Normally you don't call it directly from tests.

### Static pages

Static pages define a single `pageUrl` (example: `/login`).

To learn how to configure a static page, see:
**[Pages - Static pages](./pages.md#static-pages-require)**.

#### `goto()`

Navigate to `pageUrl`.

```ts
import { test } from '../../pageObjects/${domain}/pageFixture';

test('open login page', async ({ loginPage }) => {
  await loginPage.goto();
});
```

#### `getPageUrl()`

Return the configured `pageUrl` (useful for URL assertions).

```ts
import { test } from '../../pageObjects/${domain}/pageFixture';
import { expect } from '@playwright/test';

test('assert login page url', async ({ loginPage, page }) => {
  await loginPage.goto();
  await expect(page).toHaveURL(loginPage.getPageUrl());
});
```

### Dynamic pages

Dynamic pages define `pageUrl` and `urlPattern`.

`urlPattern` uses placeholders like `{id}` (example: `/users/{id}`). When you pass params like `{ id: 123 }`, the value is used to replace `{id}`.

To learn how to configure a dynamic page, see:
**[Pages - Dynamic pages](./pages.md#dynamic-pages-require)**.

#### `gotoDynamicPage(params)`

Navigate to a dynamic URL built from `urlPattern`.

```ts
await userProfilePage.gotoDynamicPage({ id: 123 });
```

Example with multiple placeholders:

```ts
await userOrderDetailsPage.gotoDynamicPage({ userId: 10, orderId: 500 });
```

#### `getDynamicPageUrl(params)`

Return the dynamic URL built from `urlPattern` (useful for URL assertions).

```ts
import { test } from '../../pageObjects/${domain}/pageFixture';
import { expect } from '@playwright/test';

test('assert dynamic profile page url', async ({ userProfilePage, page }) => {
  await userProfilePage.gotoDynamicPage({ id: 123 });

  const url = userProfilePage.getDynamicPageUrl({ id: 123 });
  await expect(page).toHaveURL(url);
});
```

Example with multiple placeholders:

```ts
const url = userOrderDetailsPage.getDynamicPageUrl({ userId: 10, orderId: 500 });
await expect(page).toHaveURL(url);
```