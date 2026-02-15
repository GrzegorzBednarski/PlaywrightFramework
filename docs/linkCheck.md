# Link Check

← [Back to main documentation](../README.md)

## Overview

Link validation utility for Playwright tests using **[Linkinator](https://github.com/JustinBeckwith/linkinator)**.

Scans links found on the current page and reports broken ones.

---

## Configuration

`config/linkCheckConfig.ts`:

```ts
export const linkCheckConfig = {
  // ---------------------------------------------------------------------------
  // Scope
  // ---------------------------------------------------------------------------

  recurse: false,
  sameOriginOnly: true,

  // ---------------------------------------------------------------------------
  // Timeouts & concurrency
  // ---------------------------------------------------------------------------

  concurrency: 5,
  timeoutMs: 15000,

  // ---------------------------------------------------------------------------
  // Skip / allow rules
  // ---------------------------------------------------------------------------

  skippedLinks: {
    'mailto:': true,
    'tel:': true,
    '#': true,
  },

  allowedStatusCodes: {
    401: true,
    403: false,
  },

  // ---------------------------------------------------------------------------
  // Reporting
  // ---------------------------------------------------------------------------

  includeOkLinksInReport: true,
  okLinksReportLimit: 500,
  brokenLinksReportLimit: 500,
} as const;
```

### Scope

- **`sameOriginOnly`** – when `true`, checks only links from the same origin as the current page.
- **`recurse`** – when `true`, crawls beyond the initial page (can significantly increase scan size).

### Timeouts & concurrency

- **`timeoutMs`** – per-link timeout in milliseconds.
- **`concurrency`** – max number of parallel link checks.

### Skip / allow rules

- **`skippedLinks`** – patterns to skip (substring match: `url.includes(pattern)`).

  ```ts
  skippedLinks: {
    '/download_secure': true,
    '/search?': true,
    'utm_source=': true,
    '/some-legacy-endpoint': false,
  };
  ```

- **`allowedStatusCodes`** – HTTP statuses treated as OK (`true` = allow, `false` = disallow).

### Reporting

- **`includeOkLinksInReport`** – when `true`, includes OK links in per-page reports.
- **`okLinksReportLimit`** – max OK links included in the report (`0`/`undefined` = no limit).
- **`brokenLinksReportLimit`** – max broken links included in the report (`0`/`undefined` = no limit).

---

## Usage

### Minimal usage

```ts
import { test } from '@playwright/test';
import { runLinkCheck } from '../../utils/linkCheck/runLinkCheck';

test('Homepage should have no broken links', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/');
  await runLinkCheck(page);
});
```

### Override configuration per test

```ts
await runLinkCheck(page, {
  timeoutMs: 15000,
  concurrency: 5,
  sameOriginOnly: true,
  skippedLinks: {
    '/download_secure': true,
  },
  allowedStatusCodes: {
    401: true,
  },
});
```

---

## Reports

Output directory (generated): `build/linkCheck/`

Files:

- **`link-check_<url>_<timestamp>.json`** – per-page JSON report
- **`link-check_<url>_<timestamp>.md`** – per-page Markdown report
- **`link-check-report.json`** – merged summary
- **`link-check-report.md`** – merged summary
- **`link-check-report.pdf`** – PDF version of the summary

Reports are merged in `global-teardown.ts`.

Sample reports:

- [Sample JSON report](samples/linkCheck-reports/link-check-report.json)
- [Sample Markdown report](samples/linkCheck-reports/link-check-report.md)
- [Sample PDF report](samples/linkCheck-reports/link-check-report.pdf)
