# CSP Check

← [Back to main documentation](../README.md)

## Overview

Content-Security-Policy (CSP) validation utility for Playwright tests.

It reads CSP from the `Content-Security-Policy` response header (fallback: meta tag) and applies basic heuristic rules.

---

## Configuration

`config/cspCheckConfig.ts`:

```ts
export const cspCheckConfig = {
  // ---------------------------------------------------------------------------
  // Scope
  // ---------------------------------------------------------------------------

  /**
   * When true, checks CSP header on the document navigation response if available.
   * When false, always uses `page.request.get(page.url())`.
   */
  preferNavigationResponse: false,

  // ---------------------------------------------------------------------------
  // Rules
  // ---------------------------------------------------------------------------

  /** If true, requires that a CSP policy is present (either header or meta). */
  requireCsp: true,

  /** Rules applied to the effective CSP string (basic heuristic checks). */
  rules: {
    disallowUnsafeInline: true,
    disallowUnsafeEval: true,
    disallowWildcardSources: true,
    requireDefaultSrc: true,
  },

  // ---------------------------------------------------------------------------
  // Reporting
  // ---------------------------------------------------------------------------

  includeDirectivesInReport: true,
} as const;
```

### Scope

- **`preferNavigationResponse`** – when `true`, attempts to use CSP from the document navigation response; otherwise uses `page.request.get(page.url())`.

### Rules

- **`requireCsp`** – when `true`, fails if CSP is missing.
- **`rules.disallowUnsafeInline`** – flags `'unsafe-inline'`.
- **`rules.disallowUnsafeEval`** – flags `'unsafe-eval'`.
- **`rules.disallowWildcardSources`** – flags `*` sources.
- **`rules.requireDefaultSrc`** – flags missing `default-src`.

### Reporting

- **`includeDirectivesInReport`** – when `true`, includes parsed CSP directives in JSON report.

---

## Usage

### Minimal usage

```ts
import { runCspCheck } from '../../utils/cspCheck/runCspCheck';

await page.goto('https://example.com');
await runCspCheck(page);
```

### Override configuration per test

```ts
await runCspCheck(page, {
  preferNavigationResponse: false,
  requireCsp: true,
  rules: {
    disallowUnsafeInline: true,
    disallowUnsafeEval: true,
    disallowWildcardSources: true,
    requireDefaultSrc: true,
  },
});
```

---

## Reports

Output directory (generated): `build/cspCheck/`

Files:

- **`csp_<url>_<timestamp>.json`** – per-page JSON report
- **`csp_<url>_<timestamp>.md`** – per-page Markdown report
- **`csp-report.json`** – merged summary
- **`csp-report.md`** – merged summary
- **`csp-report.pdf`** – PDF version of the summary

Reports are merged in `global-teardown.ts`.

Sample reports:

- [Sample JSON report](samples/cspCheck-reports/csp-report.json)
- [Sample Markdown report](samples/cspCheck-reports/csp-report.md)
- [Sample PDF report](samples/cspCheck-reports/csp-report.pdf)
