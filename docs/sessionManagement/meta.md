# Session meta

← [Back to main documentation](../../README.md)
↑ [Back to Sessions](./sessions.md)

## Overview

Session meta is an optional key-value map stored alongside the session.
Use it to persist extra values like auth headers, API keys, user ids, etc.

You typically save meta values in your `config/sessionLogin.<key>.ts` (inside `loginFlow` via `saveMeta(...)`).

If your domain uses POM fixtures, meta is exposed to tests as `sessionMeta`.
See: **[POM fixtures - Sessions (optional)](../pageObjectModel/fixtures.md#sessions-optional)**.

## Bearer token (Authorization header)

See: **[Request auth helpers](./requestAuth.md)**.

### Configuration

Save a Bearer auth header (example: after intercepting a login request):

```ts
// config/sessionLogin.default.ts

export const sessionLoginConfig = {
  async loginFlow({ page, saveMeta }) {
    // ...login steps...

    const loginRequest = waitForIntercept(page, INTERCEPTS.USER_LOGIN);
    // ...actions that trigger request...
    const authHeader = await extractBearerAuthHeader(loginRequest);

    saveMeta({ authHeader });
  },
};
```

### Usage

```ts
import { test, session } from '../../pageObjects/${domain}/pageFixture';

session('ADMIN');

test('can use authHeader from session meta', async ({ sessionMeta }) => {
  const authHeader = sessionMeta?.authHeader;
  // ...use authHeader in API calls...
});
```

## API key / custom header

### Configuration

```ts
// config/sessionLogin.default.ts

export const sessionLoginConfig = {
  async loginFlow({ saveMeta }) {
    // ...login steps...
    const xFunctionsKey = process.env.X_FUNCTIONS_KEY || '';
    if (!xFunctionsKey) {
      throw new Error('Missing env var: X_FUNCTIONS_KEY');
    }

    saveMeta({ xFunctionsKey });
  },
};
```

### Usage

```ts
import { test, session } from '../../pageObjects/${domain}/pageFixture';

session('ADMIN');

test('can use x-functions-key from session meta', async ({ sessionMeta }) => {
  const xFunctionsKey = sessionMeta?.xFunctionsKey;
  // ...use xFunctionsKey in API calls...
});
```

## Custom value (dynamic)

### Configuration

```ts
// config/sessionLogin.default.ts

export const sessionLoginConfig = {
  async loginFlow({ page, saveMeta }) {
    // ...login steps...

    // Example: extract a custom value from a request header
    // (use whatever request your application sends after login)
    const loginRequest = waitForIntercept(page, INTERCEPTS.USER_LOGIN);
    // ...actions that trigger request...
    const req = await loginRequest;
    const customValue = req.headers()['x-user-id'] || '';

    if (!customValue) {
      throw new Error('Missing x-user-id header');
    }

    saveMeta({ customValue });
  },
};
```

### Usage

```ts
import { test, session } from '../../pageObjects/${domain}/pageFixture';

session('ADMIN');

test('can use customValue from session meta', async ({ sessionMeta }) => {
  const customValue = sessionMeta?.customValue;
  // ...use customValue in API calls or URLs...
});
```

## Do I need to change fixtures?

No additional fixture changes are required, as long as your domain fixture enables sessions via `createSessionFixtures(...)`.

See: **[POM fixtures - Sessions (optional)](../pageObjectModel/fixtures.md#sessions-optional)**.
