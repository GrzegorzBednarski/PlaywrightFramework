# Check Cookies

← [Back to main documentation](../README.md)

## Overview

Utility for asserting browser cookies against JSON fixtures.

---

## Configuration

- Fixtures live in `fixtures/cookies/*.json`.
- Each fixture defines a single cookie under a top-level key (e.g. `COOKIE_BANNER_ACCEPTED`).
- Debug logging is controlled via `config/checkCookieConfig.ts` (`debugCookies: boolean`).

Example fixture:

```json
{
  "COOKIE_BANNER_ACCEPTED": {
    "name": "cookie_banner_accepted",
    "value": "true",
    "domain": "example.com",
    "path": "/",
    "httpOnly": false,
    "secure": true
  }
}
```

---

## Usage

```ts
import { checkCookies } from '../utils/checkCookies';

// Positive check – cookie must exist and match fixture
await checkCookies(page, 'cookie_banner_accepted.json');

// Negative check – cookie must NOT exist
await checkCookies(page, 'remember_me_enabled.json', undefined, false);
```

---

## Dynamic values

You can use placeholders in fixtures and replace them per test:

```json
{
  "REMEMBER_ME_ENABLED": {
    "name": "remember_me",
    "value": "%SESSION_ID%",
    "domain": "example.com",
    "path": "/",
    "httpOnly": true,
    "secure": true
  }
}
```

```ts
await checkCookies(page, 'remember_me_enabled.json', {
  '%SESSION_ID%': 'abc-123',
});
```

---

## Debug output

With `debugCookies` enabled, `checkCookies` logs:

- step label (what is being checked),
- expected pattern from the fixture,
- current cookies in the context,
- a short `Result: ...` line (found / not found / should not exist).

Example console output for a successful positive check:

```text
Check cookie exists: cookie_banner_accepted (cookie_banner_accepted.json)
Expected pattern (from fixture cookie_banner_accepted.json): {
  "name": "cookie_banner_accepted",
  "value": "true",
  "domain": "example.com",
  "path": "/",
  "httpOnly": false,
  "secure": true
}
Current cookies:
- cookie_banner_accepted: {"name":"cookie_banner_accepted","value":"true","domain":"example.com","path":"/","httpOnly":false,"secure":true}
Result: ✅ Cookie "cookie_banner_accepted" found.
Actual value: {"name":"cookie_banner_accepted","value":"true","domain":"example.com","path":"/","httpOnly":false,"secure":true}
```

This helps quickly see why a cookie assertion passed or failed.
