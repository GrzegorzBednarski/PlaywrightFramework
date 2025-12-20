# Wait for Intercept

← [Back to main documentation](../README.md)

Utility for waiting on specific HTTP requests and returning the matched `Request`.

## Configuration

URL patterns are defined centrally in **[Intercepts](./intercepts.md)** (`data/intercepts.ts`).
Use keys from `INTERCEPTS` as the `urlPattern` argument.

Function signature:

- **`waitForIntercept(page, urlPattern, options?)`**
  - **`page`** – Playwright `Page`
  - **`urlPattern`** – wildcard string or `RegExp`
  - **`options`** – optional configuration object
    - **`options.timeout`** – timeout in milliseconds passed to `page.waitForRequest`
    - **Default timeout** – if `options.timeout` is not provided, Playwright uses its default request timeout from your Playwright configuration (the same default used by `page.waitForRequest`)

## Usage

Basic example – wait for a request and then perform actions:

```typescript
import { waitForIntercept } from '../../utils/waitForIntercept';
import { INTERCEPTS } from '../../data/intercepts';

await page.goto('/login');

// Wait for login request (using Playwright default timeout)
const request = await waitForIntercept(page, INTERCEPTS.USER_LOGIN);

// Perform actions after request was captured
await page.fill('input[name="username"]', 'test.user@example.com');
await page.fill('input[name="password"]', 'Password123');
await page.click('button[type="submit"]');
```

Example with custom timeout:

```typescript
await waitForIntercept(page, INTERCEPTS.USER_LOGIN, { timeout: 10000 });
```

For advanced request validation patterns, see **[Request Assertions](./requestAssertions.md)**.
