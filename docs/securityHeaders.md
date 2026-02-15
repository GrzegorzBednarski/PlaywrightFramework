# Security Headers

← [Back to main documentation](../README.md)

## Overview

Security headers validation utility for Playwright tests (custom util).

It uses Playwright **[APIRequestContext](https://playwright.dev/docs/api/class-apirequestcontext)** (`page.request.get(...)`) to read response headers.

Checks HTTP response headers for required and forbidden entries.

---

## Configuration

`config/securityHeadersConfig.ts`:

```ts
export const securityHeadersConfig = {
  // ---------------------------------------------------------------------------
  // Scope
  // ---------------------------------------------------------------------------

  /**
   * When true, tries to read headers from the document navigation response.
   * When false, always uses `page.request.get(page.url())`.
   */
  preferNavigationResponse: true,

  // ---------------------------------------------------------------------------
  // Rules
  // ---------------------------------------------------------------------------

  /** Required headers (case-insensitive). */
  requiredHeaders: {
    'x-content-type-options': true,
    'x-frame-options': true,
    'referrer-policy': true,
    'permissions-policy': true,
    'strict-transport-security': true,
    'content-security-policy': true,
  },

  /** Headers that must NOT be present. */
  forbiddenHeaders: {
    'x-powered-by': true,
    server: true,
  },

  // ---------------------------------------------------------------------------
  // Reporting
  // ---------------------------------------------------------------------------

  includeAllHeadersInReport: true,
} as const;
```

### Scope

- **`preferNavigationResponse`** – when `true`, attempts to use headers from the document navigation response; otherwise uses `page.request.get(page.url())`.

### Rules

- **`requiredHeaders`** – headers that must exist (`true` = enabled, `false` = disabled).
- **`forbiddenHeaders`** – headers that must not be present (`true` = enabled, `false` = disabled).

Common headers (quick reference):

- **`x-content-type-options`** – prevents MIME sniffing (`nosniff`).
- **`x-frame-options`** – basic clickjacking protection (often replaced by CSP `frame-ancestors`).
- **`referrer-policy`** – controls referrer information sent on requests.
- **`permissions-policy`** – restricts access to browser features (camera, geolocation, etc.).
- **`strict-transport-security`** – forces HTTPS (HSTS).
- **`content-security-policy`** – controls allowed sources for scripts/styles/etc.

More info:

- **[OWASP Secure Headers documentation](https://owasp.org/www-project-secure-headers/)**

Common forbidden headers (quick reference):

- **`x-powered-by`** – reveals the framework/runtime (e.g. Express). Typically removed in production.
- **`server`** – reveals server/vendor details. Often minimized/removed to reduce fingerprinting.

### Reporting

- **`includeAllHeadersInReport`** – when `true`, writes all response headers into the JSON report (`headers` field).

---

## Usage

### Minimal usage

```ts
import { runSecurityHeadersCheck } from '../../utils/securityHeaders/runSecurityHeadersCheck';

await page.goto('https://example.com');
await runSecurityHeadersCheck(page);
```

### Override configuration per test

```ts
await runSecurityHeadersCheck(page, {
  preferNavigationResponse: false,
  requiredHeaders: {
    'x-content-type-options': true,
    'content-security-policy': true,
  },
  forbiddenHeaders: {
    'x-powered-by': true,
  },
});
```

---

## Reports

Output directory (generated): `build/securityHeaders/`

Files:

- **`security-headers_<url>_<timestamp>.json`** – per-page JSON report
- **`security-headers_<url>_<timestamp>.md`** – per-page Markdown report
- **`security-headers-report.json`** – merged summary
- **`security-headers-report.md`** – merged summary
- **`security-headers-report.pdf`** – PDF version of the summary

Reports are merged in `global-teardown.ts`.

Sample reports:

- [Sample JSON report](samples/securityHeaders/security-headers-report.json)
- [Sample Markdown report](samples/securityHeaders/security-headers-report.md)
- [Sample PDF report](samples/securityHeaders/security-headers-report.pdf)
