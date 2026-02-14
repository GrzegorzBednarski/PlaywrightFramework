# Set Cookies

← [Back to main documentation](../README.md)

## Overview

Utility for injecting predefined cookies into Playwright tests.

---

## Configuration

Cookie keys are defined centrally in **[Cookies](./cookies.md)** (`data/cookies.ts`), under the `COOKIES` object.
Use keys from `COOKIES` as the second argument.

Function signature:

- **`setCookies(page, cookieKeys)`**
  - **`page`** – Playwright `Page`
  - **`cookieKeys`** – array of keys from `COOKIES` (e.g. `['COOKIE_BANNER_ACCEPTED']`)

---

## Usage

Use **`setCookies(page, [...])`** to inject cookies into the test's isolated browser context.
Always call it **before** `page.goto()` or `page.reload()` so cookies are applied before the request is made.

```ts
import { test } from '@playwright/test';
import { setCookies } from '../utils/setCookies';

test('set cookie banner accepted', async ({ page }) => {
  await setCookies(page, ['COOKIE_BANNER_ACCEPTED']);
  await page.goto('/');
});
```

For grouped scenarios, use **[Set Cookies Scenario](./setCookiesScenario.md)**.
