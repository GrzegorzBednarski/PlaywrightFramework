# Accessibility

← [Back to main documentation](../README.md)

Utility for running automated accessibility scans with project-wide configuration and reporting, built on top of **[axe-core](https://www.deque.com/axe/core-documentation/)**.

## Configuration

Configuration for accessibility testing is defined in **`config/accessibilityConfig.ts`**. This file allows you to set global preferences for WCAG compliance levels, rules to ignore, and report settings.

**Configuration options:**

- **`tags`** – WCAG/Section 508 compliance levels to test against (see **[axe-core tags](https://www.deque.com/axe/core-documentation/api-documentation/#axecore-tags)** for full list)
- **`ignoredRules`** – map of rules to ignore (`true` → ignore rule)
- **`excludeElements`** – CSS selectors for elements to exclude from scanning
- **`reportConsole`** – controls what is displayed in console output
- **`reportsOutputFolder`** – directory where accessibility reports are saved

**Example configuration (`config/accessibilityConfig.ts`):**

```ts
const accessibilityConfig = {
  tags: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
  ignoredRules: {
    'color-contrast': false,
  },
  excludeElements: [
    // CSS selectors to exclude from accessibility scans
    'input',
    'iframe',
    '[data-testid="cookie-banner"]',
    '.advertisement',
    '#chat-widget'
  ],
  reportConsole: {
    impact: true,
    id: true,
    description: false,
    help: true,
    helpUrl: false,
    nodes: true,
  },
  reportsOutputFolder: `${buildDir}/accessibility-reports`,
};
```


## Usage

This project uses **`axe-core`** to run automated accessibility tests. The helper **`runAccessibilityScan`** wraps axe-core with project defaults and a Playwright `test.step`.

**Example:**

```ts
import { test } from '@playwright/test';
import runAccessibilityScan from '../../utils/accessibility';

test('Homepage accessibility', async ({ page }) => {
  await page.goto('/');
  await runAccessibilityScan(page);
});
```

### Override configuration per test

You can override the default configuration for a specific test by passing an options object to **`runAccessibilityScan`**.

```ts
test('Careers page accessibility', async ({ page }) => {
  await page.goto('/careers');
  await runAccessibilityScan(page, {
    tags: ['best-practice'],
    ignoredRules: {
      'landmark-banner-is-top-level': true,
    },
    excludeElements: ['.popup-modal', '#advertisement']
  });
});
```

## Reports

Accessibility scan results are exported to **`build/accessibility-reports/`**:

- **`accessibility-report.json`** – normalized, merged violations per rule and page
- **`accessibility-report.md`** – human-readable summary grouped by impact and rule
- **`accessibility-report.pdf`** – PDF version of the Markdown report (generated using **[md-to-pdf](./mdToPdf.md)**)

Sample reports:

- [Sample JSON report](./samples/accessibility-report.json)
- [Sample Markdown report](./samples/accessibility-report.md)
- [Sample PDF report](./samples/accessibility-report.pdf)
