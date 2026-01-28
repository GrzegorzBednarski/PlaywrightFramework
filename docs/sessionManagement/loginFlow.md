# Login flow

← [Back to main documentation](../../README.md)
↑ [Back to Sessions](./sessions.md)

## Overview

This doc focuses on what you put inside the `loginFlow` function in your session login config file:

- `config/sessionLogin.<key>.ts`

The `loginFlow` is responsible for creating an authenticated browser state.
Keep selectors in your POM and call them from `loginFlow`.

For how to select which login config is used (`sessionLoginKey`), see: **[Sessions](./sessions.md)**.

## UI login via POM helper (recommended)

Prefer calling a POM method (LoginPage/LoginComponent), so your loginFlow stays readable and reusable.

`Login` function from `login.page.ts`:

```ts
import type { Page } from '@playwright/test';
import { resolveCreds } from '../../../utils/sessionManager/envCreds';

export class LoginPage {
  constructor(private readonly page: Page) {}

  /**
   * Logs in using credentials resolved from env vars for the given `userKey`.
   *
   * @param userKey - User identifier used to resolve credentials (e.g. `ADMIN`, `TOM`).
   * @returns Promise<void>
   *
   * @example
   * await loginPage.login('ADMIN');
   */
  async login(userKey: string) {
    const { username, password } = resolveCreds(userKey);

    await this.page.goto('/login');
    await this.page.getByLabel('Username').fill(username);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Sign in' }).click();
  }
}
```
`sessionLogin` config calling the POM method:
```ts
import { LoginPage } from '../pageObjects/${domain}/pages/login.page';

export const sessionLoginConfig = {
  // ...other code...

  /**
   * Session login flow.
   * Use POM helpers here to keep selectors outside the config file.
   *
   * @returns Promise<void>
   */
  async loginFlow({ page, userKey }) {
    const loginPage = new LoginPage(page);
    await loginPage.login(userKey);
  },

  // ...other code...
};
```

## UI login without POM (not recommended)

You can log in directly in `loginFlow` without using POM.
Prefer the POM approach above when possible.

```ts
import { resolveCreds } from '../utils/sessionManager/envCreds';

export const sessionLoginConfig = {
  // ...other code...

  /**
   * Session login flow implemented directly in the config file.
   * Prefer POM-based login when possible.
   *
   * @returns Promise<void>
   */
  async loginFlow({ page, userKey }) {
    const { username, password } = resolveCreds(userKey);
    await page.goto('/login');
    await page.getByLabel('Username').fill(username);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Sign in' }).click();
  },

  // ...other code...
};
```

## Basic Auth

If your app is behind Basic Auth, call it before UI login.

See: **[Basic Auth](./basicAuth.md)** (how to configure and use `useBasicAuth`).

```ts
import { useBasicAuth } from '../utils/basicAuth';

export const sessionLoginConfig = {
  // ...other code...

  /**
   * Session login flow for apps protected by Basic Auth.
   * Call `useBasicAuth` before you navigate to pages that require it.
   *
   * @returns Promise<void>
   */
  async loginFlow({ page, userKey }) {
    await useBasicAuth(page, userKey);
    // ...then UI login...
  },

  // ...other code...
};
```