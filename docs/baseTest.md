# baseTest (sessions + API)

← [Back to README](../README.md)

## Overview

`baseTest` is the shared test entrypoint that combines:
- sessions (reusable login + storageState + meta)
- API client (config-driven request defaults + response assertions)

Use it when:
- you want to write tests **without a domain POM**
- you want domain POM fixtures to inherit sessions + API by extending one base

File: `utils/baseTest.ts`

---

## Configuration

`baseTest` is created in one place and then extended by domain fixtures.
```ts
import { test as base } from '@playwright/test';

import { createSessionFixtures } from './sessionFixtures';
import { createApiFixtures } from './apiTool/apiFixtures';

// ---------------------------------------------------------------------------
// baseTest
// ---------------------------------------------------------------------------

export const test = base.extend({
  // ---------------------------------------------------------------------------
  // Sessions
  // ---------------------------------------------------------------------------
  ...createSessionFixtures({ defaultSessionLoginKey: 'default' }),

  // ---------------------------------------------------------------------------
  // API
  // ---------------------------------------------------------------------------
  ...createApiFixtures({ defaultApiConfigKey: 'default' }),
});

export { expect } from '@playwright/test';

// Optional helpers (wrappers over test.use)
export function session(userKey: string, opts?: { sessionLoginKey?: string }) {
  test.use({ userKey, sessionLoginKey: opts?.sessionLoginKey });
}

export function apiProfile(opts: { apiConfigKey?: string; apiProfile?: any }) {
  test.use({ apiConfigKey: opts.apiConfigKey, apiProfile: opts.apiProfile });
}
```

---

## What it provides

### Fixtures

Sessions:
- `sessionData` / `sessionMeta`
- `context` / `page`

API:
- `apiConfig`
- `api`

### Options (via `test.use`)

Sessions:
- `userKey?: string`
- `sessionLoginKey?: string`

API:
- `apiConfigKey?: string`
- `apiProfile?: { headers?: ..., baseURL?: ... }`

---

## Sessions

Sessions are documented here:
- **[Sessions](./sessionManagement/sessions.md)**

---

## API

`apiConfig` is loaded by convention from: `config/apiConfig.<key>.ts`.

See: **[API (API tool)](./api/api.md)**.

---

## Usage

### 1) Without POM (public API) – tests import from `utils/baseTest`

Test file:
```ts
import { test, apiProfile } from '../utils/baseTest';

test.describe('API (public)', () => {
  apiProfile({ apiConfigKey: 'dummyjson.guest' });

  test('GET /products/1', async ({ api }) => {
    const res = await api.get('/products/1');
    await res.expectStatus(200);
  });
});
```

### 2) Without POM (authorized API) – tests import from `utils/baseTest`

Test file:
```ts
import { test, session, apiProfile } from '../utils/baseTest';

test.describe('API (authorized)', () => {
  session('EMILY', { sessionLoginKey: 'dummyjson' });
  apiProfile({ apiConfigKey: 'dummyjson.authorized' });

  test('GET /auth/me', async ({ api }) => {
    const res = await api.get('/auth/me');
    await res.expectStatus(200);
  });
});
```

### 3) With a domain POM fixture – tests import from the domain `pageFixture.ts`

Fixture file `pageObjects/<domain>/pageFixture.ts`:
```ts
import { test as baseTest } from '../../utils/baseTest';
import { HomePage } from './pages/home.page';

type Fixtures = {
  homePage: HomePage;
};

export const test = baseTest.extend<Fixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
});

export { expect } from '@playwright/test';
```

Test file:
```ts
import { test, expect } from '../../pageObjects/<domain>/pageFixture';

test('POM-based test', async ({ homePage, api }) => {
  await homePage.goto();
  await expect(homePage.footer.container).toBeVisible();

  const res = await api.get('/products/1');
  await res.expectStatus(200);
});
```

---

## Defaults per domain fixture (optional)

If one domain should always use different defaults than global ones, set them in its fixture:

```ts
export const test = baseTest.extend<Fixtures>({
  sessionLoginKey: 'dummyjson',
  apiConfigKey: 'dummyjson.guest',

  // ...pages...
});
```
