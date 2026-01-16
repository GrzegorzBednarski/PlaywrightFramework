# Performance Monitoring

← [Back to main documentation](../README.md)

Run Lighthouse multiple times per URL and aggregate results (median).

Performance tools are built on top of **[Lighthouse](https://developer.chrome.com/docs/lighthouse/overview/)**.

Lighthouse CLI docs are available **[here](https://github.com/GoogleChrome/lighthouse#using-the-node-cli)**.

## Configuration

File: `config/performanceMonitoringConfig.ts`

Example:

```ts
export const performanceMonitoringConfig = {
  hideSensitiveDataInReport: true,
  devices: ['desktop', 'mobile'],
  logs: false,
  numberOfRuns: 2,
  onlyCategories: ['performance', 'accessibility', 'bestPractices', 'seo'],
  skipAudits: ['uses-http2'],
  chrome: {
    headless: true,
    flags: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  },
  extraHeaders: {
    // Example: Cookie: 'OptanonAlertBoxClosed=1',
  },
  extraLighthouseFlags: [],
  urlsToMonitor: [
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
      numberOfRuns: 1,
      onlyCategories: ['performance', 'seo'],
      skipAudits: ['uses-http2', 'is-on-https'],
      chrome: {
        headless: true,
        flags: ['--no-sandbox'],
      },
      extraHeaders: {
        'X-Example-Header': 'example',
      },
      extraLighthouseFlags: ['--throttling-method=provided'],
    },
    {
      name: 'overwrittenConfigSilent',
      path: 'https://www.wikipedia.org',
      numberOfRuns: 1,
      onlyCategories: ['performance'],
      devices: ['desktop'],
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
- `numberOfRuns` - Runs per URL+device
- `onlyCategories` - Categories to run (`performance`, `accessibility`, `bestPractices`, `seo`, `pwa`)
- `skipAudits` - Lighthouse audits to skip
- `chrome` - Chrome launch options (advanced)
- `extraHeaders` - Extra HTTP headers (advanced)
- `extraLighthouseFlags` - Extra Lighthouse CLI flags (advanced)
- `urlsToMonitor` - URLs to monitor (supports per-URL overrides)

## URL formats

In `urlsToMonitor[].path` you can use:
- Absolute URL: `https://example.com`
- Relative path (joined with `process.env.BASE_URL`): `/myLink`
- Full URL from env var: `${process.env.BASE_URL}/myLink`

Dynamic URL using `data` (matches **[Data](./data.md)** docs):
- `const product_2 = data.products.product_2;`
- `path: `/products/${product_2.id}/details``

## Usage

See **[Test Runner](./testRunner.md#running-tests)**.

Example:

```bash
npm run test dev performancemonitoring
```

## Reports

Output directory (generated): `build/performance-monitoring-reports/`

Files:
- `performance-monitoring-summary.md` - Markdown summary
- `performance-monitoring-summary.pdf` - PDF version of the summary
- `performance-monitoring-summary.json` - machine-readable results with statistics
- `detailed-results/` - per-run Lighthouse HTML/JSON reports

Sample reports (from `docs/samples/performance-monitoring-reports/`):
- [Sample summary (Markdown)](samples/performance-monitoring-reports/performance-monitoring-summary.md)
- [Sample summary (PDF)](samples/performance-monitoring-reports/performance-monitoring-summary.pdf)
- [Sample summary (JSON)](samples/performance-monitoring-reports/performance-monitoring-summary.json)

Sample detailed results:
- [Sample detailed HTML](samples/performance-monitoring-reports/detailed-results/dynamictablepage-desktop-run-1-1768586905707.report.html)
- [Sample detailed JSON](samples/performance-monitoring-reports/detailed-results/dynamictablepage-desktop-run-1-1768586905707.report.json)
