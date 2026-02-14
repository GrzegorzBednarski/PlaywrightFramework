# Performance Test

← [Back to main documentation](../README.md)

## Overview

Run Lighthouse against a list of URLs and validate results against configured thresholds.

Performance tools are built on top of **[Lighthouse](https://developer.chrome.com/docs/lighthouse/overview/)**.

Lighthouse CLI docs are available **[here](https://github.com/GoogleChrome/lighthouse#using-the-node-cli)**.

---

## Configuration

File: `config/performanceTestConfig.ts`

Example:

```ts
export const performanceTestConfig = {
  hideSensitiveDataInReport: true,
  devices: ['desktop', 'mobile'],
  logs: false,
  onlyCategories: ['performance', 'accessibility', 'bestPractices', 'seo'],
  thresholds: {
    performance: 70,
    accessibility: 90,
    bestPractices: 80,
    seo: 95,
    pwa: 50,
  },
  skipAudits: ['uses-http2'],

  // ---------------------------------------------------------------------------
  // Advanced configuration (typically you don't need to change this section)
  // ---------------------------------------------------------------------------

  chrome: {
    headless: true,
    flags: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  },
  extraHeaders: {},
  extraLighthouseFlags: [],

  // ---------------------------------------------------------------------------
  // URLs to test
  // ---------------------------------------------------------------------------

  urlsToTest: [
    {
      name: 'dynamicTablePage',
      path: 'https://practice.expandtesting.com/dynamic-table',
    },
    {
      name: 'inputsPage',
      path: 'https://practice.expandtesting.com/inputs',
    },
    {
      name: 'homePage',
      path: '/',
      devices: ['desktopWide', 'tablet'],
      logs: false,
      onlyCategories: ['performance', 'seo'],
      thresholds: {
        performance: 70,
        seo: 60,
      },
      skipAudits: ['uses-http2', 'is-on-https'],
      chrome: {
        flags: ['--no-sandbox'],
      },
      extraHeaders: {
        'X-Example-Header': 'example',
      },
      extraLighthouseFlags: ['--throttling-method=provided'],
    },
  ],
} as const;
```

Options:
- `hideSensitiveDataInReport` (`true` | `false`) - Global report option (cannot be overridden per-URL)
  - hides: `extraHeaders`, `chrome.flags`, `extraLighthouseFlags`
  - does NOT hide: URLs
- `devices` - Default device keys (see **[Performance devices](./performanceDevices.md)**)
- `logs` (`true` | `false`) - Verbose Lighthouse logs
- `onlyCategories` - Categories to run (`performance`, `accessibility`, `bestPractices`, `seo`, `pwa`)
- `thresholds` - Global thresholds per category (0-100)
- `skipAudits` - Lighthouse audits to skip
- `chrome` - Chrome launch options (advanced)
- `extraHeaders` - Extra HTTP headers (advanced)
- `extraLighthouseFlags` - Extra Lighthouse CLI flags (advanced)
- `urlsToTest` - URLs to test (supports per-URL overrides)

---

## URL formats

In `urlsToTest[].path` you can use:
- Absolute URL: `https://example.com`
- Relative path (joined with `process.env.BASE_URL`): `/myLink`
- Full URL from env var: `${process.env.BASE_URL}/myLink`

Dynamic URL using `data` (matches **[Data](./data.md)** docs):
- `const product_2 = data.products.product_2;`
- `path: `/products/${product_2.id}/details``

---

## Usage

See **[Test Runner](./testRunner.md#running-tests)**.

Example:

```bash
npm run test dev performancetest
```

---

## Reports

Output directory (generated): `build/performance-test-reports/`

Files:
- `performance-test-summary.md` - Markdown summary
- `performance-test-summary.pdf` - PDF version of the summary
- `detailed-results/` - per-URL Lighthouse HTML/JSON reports

Sample reports (from `docs/samples/performance-test-reports/`):
- [Sample summary (Markdown)](samples/performance-test-reports/performance-test-summary.md)
- [Sample summary (PDF)](samples/performance-test-reports/performance-test-summary.pdf)

Sample detailed results:
- [Sample detailed HTML](samples/performance-test-reports/detailed-results/dynamictablepage-desktop-1768586145774.report.html)
- [Sample detailed JSON](samples/performance-test-reports/detailed-results/dynamictablepage-desktop-1768586145774.report.json)
