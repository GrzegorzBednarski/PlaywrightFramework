# Replace Intercept

← [Back to main documentation](../README.md)

Utility for intercepting HTTP requests and responding with data loaded from JSON fixtures.

## Configuration

URL patterns are defined centrally in **[Intercepts](./intercepts.md)** (`data/intercepts.ts`).
Use keys from `INTERCEPTS` as the `urlPattern` argument.

Fixture files are stored under `fixtures/intercepts/`.

Function signature:

- **`replaceIntercept(page, urlPattern, fixtureName, options?)`**
  - **`page`** – Playwright `Page`
  - **`urlPattern`** – wildcard string or `RegExp`
  - **`fixtureName`** – JSON file name or relative path under `fixtures/intercepts/` (e.g. `userList.json`)
  - **`options`** – optional configuration object
    - **`options.method`** – HTTP method to intercept (default: `GET`)
    - **`options.statusCode`** – HTTP status code to return (default: `200`)
    - **`options.replacements`** – placeholder–value pairs for dynamic string replacement inside the fixture

## Fixture files

Example fixture in `fixtures/intercepts/userList.json`:

```json
{
  "data": [
    {
      "id": "user-123",
      "name": "Alice Example",
      "role": "Admin"
    },
    {
      "id": "user-456",
      "name": "Bob Demo",
      "role": "User"
    }
  ],
  "totalCount": 2
}
```

Placeholders like `%TODAY_DATE%` can also be used if you want to combine fixtures with dynamic values (see examples below).

## Usage

### Basic example

Mock response for a simple GET request using a static fixture:

```typescript
import { test, expect } from '@playwright/test';
import { replaceIntercept } from '../../utils/replaceIntercept';
import { INTERCEPTS } from '../../data/intercepts';

test('should display mocked users list', async ({ page }) => {
  await replaceIntercept(
    page,
    INTERCEPTS.USER_LIST,
    'userList.json'
  );

  await page.goto('/users');

  await expect(
    page.locator('li').filter({ hasText: 'Alice Example' })
  ).toBeVisible();

  await expect(
    page.locator('li').filter({ hasText: 'Bob Demo' })
  ).toBeVisible();
});
```

### Dynamic values

Use placeholders in fixtures and replace them per test run:

Fixture (`fixtures/intercepts/userGreeting.json`):

```json
{
  "id": "user-123",
  "message": "Hello %USER_NAME%, today is %TODAY_DATE%"
}
```

Test:

```typescript
const today = new Date().toLocaleDateString('en-US');

await replaceIntercept(
  page,
  INTERCEPTS.USER_GREETING,
  'userGreeting.json',
  {
    replacements: {
      '%USER_NAME%': 'Alice',
      '%TODAY_DATE%': today,
    },
  }
);

await page.goto('/greeting');

await expect(
  page.locator(`text=Hello Alice, today is ${today}`)
).toBeVisible();
```

### Status code change

Change the HTTP status code and response body using a fixture:

```typescript
await replaceIntercept(
  page,
  INTERCEPTS.USER_PROFILE,
  'userNotFound.json',
  {
    method: 'GET',
    statusCode: 404,
  }
);
```

In this example, the original request is intercepted and a `404` response with the body from `userNotFound.json` is returned instead of the real server response.
