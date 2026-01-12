# Test Configuration

← [Back to main documentation](../README.md)

## Overview

Examples of configuring Playwright tests directly in test files (execution mode, per-test timeouts, retries).

## Execution modes

Run tests in a describe block **serially** instead of in parallel:

```ts
import { test } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

test.describe('Sequential tests', () => {
  test('First test', async ({ page }) => {
    // runs first
  });

  test('Second test', async ({ page }) => {
    // runs after the first test completes
  });
});
```

Restore the default **parallel** mode explicitly if needed:

```ts
test.describe.configure({ mode: 'parallel' });
```

## Per-test timeouts

Set a custom timeout for a single test:

```ts
import { test } from '@playwright/test';

test('Long-running test', async ({ page }) => {
  test.setTimeout(120000); // 2 minutes for this test only

  await page.goto('/slow-page');
  // assertions
});
```

You can also configure timeouts for all tests in a describe block:

```ts
test.describe.configure({
  timeout: 60000, // 60 seconds per test in this block
});
```

## Retries in code

Configure retries for a group of tests in code:

```ts
import { test } from '@playwright/test';

test.describe.configure({
  retries: 2,
});

test.describe('Flaky tests', () => {
  test('API-dependent test', async ({ page }) => {
    await page.goto('/api-dependent');
  });
});
```

Retries can be combined with environment-based configuration (for example using `process.env.CI` to change behaviour in CI).

For global timeouts and retries applied to the whole project, see **[Playwright configuration](./playwrightConfiguration.md)**.

## Focusing tests

Run only a specific test or describe block while developing or debugging:

```ts
import { test } from '@playwright/test';

test.only('runs only this test', async ({ page }) => {
  // test body
});

test.describe.only('focused suite', () => {
  test('runs as part of the focused suite', async ({ page }) => {
    // test body
  });
});
```

## Skipping tests

Skip individual tests or whole suites, optionally based on conditions:

```ts
import { test } from '@playwright/test';

// Unconditionally skip a single test

test.skip('temporarily skipped test', async ({ page }) => {
  // will not run
});

// Conditionally skip in CI

test('feature only for local runs', async ({ page }) => {
  test.skip(!!process.env.CI, 'Disabled on CI');
  // test body
});

// Mark a test as "fixme" to indicate a known issue

test.fixme(true, 'Known issue to be fixed later');
```

## Test steps

Group parts of a test into named steps to improve readability and reporting:

```ts
import { test } from '@playwright/test';

test('test with steps', async ({ page }) => {
  await test.step('open page', async () => {
    await page.goto('/');
  });

  await test.step('fill form', async () => {
    // interact with the page
  });
});
```

## Using environment variables in tests

Use values from `.env` files via `process.env` inside tests, for example to assert that environment-specific content is shown:

```ts
import { test, expect } from '@playwright/test';

test('shows environment-specific username', async ({ page }) => {
  await page.goto('/profile');

  const expectedUsername = process.env.USER1_USERNAME || '';

  await expect(page.locator('[data-test="profile-username"]')).toHaveText(expectedUsername);
});
```

Combined with **[Environments](./environments.md)**, this lets you switch displayed values (such as usernames or URLs) per environment without changing test code.

For more advanced per-test options, see the official Playwright docs on [test configuration](https://playwright.dev/docs/test-configuration).
