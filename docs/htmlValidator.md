# HTML Validator

← [Back to main documentation](../README.md)

## Overview

HTML validation utility for Playwright tests.

It validates rendered HTML (`page.content()`) using **[html-validate](https://html-validate.org/)**.

---

## Configuration

`config/htmlValidatorConfig.ts`:

```ts
export const htmlValidatorConfig = {
  // ---------------------------------------------------------------------------
  // Presets
  // ---------------------------------------------------------------------------

  presets: ['html-validate:recommended'],

  // ---------------------------------------------------------------------------
  // Rules
  // ---------------------------------------------------------------------------

  rules: {
    'no-dup-attr': true,
    'no-dup-id': true,
    'valid-id': true,
    'element-required-attributes': true,
  },

  ignoredRules: {
    'no-trailing-whitespace': true,
    'no-inline-style': true,
    'no-conditional-comment': true,
  },

  // ---------------------------------------------------------------------------
  // Reporting
  // ---------------------------------------------------------------------------

  includeHtmlInReport: true,
} as const;
```

### Presets

- **`presets`** – base configurations to extend from (default: `['html-validate:recommended']`) ([full list](https://html-validate.org/rules/presets.html)).

### Rules

Use this section only for overrides:

- **`rules`** – enable/disable specific rule ids (`true` = enabled, `false` = disabled) ([full list](https://html-validate.org/rules/))
- **`ignoredRules`** – ignore specific rule ids in reporting/failing (`true` = ignored) ([full list](https://html-validate.org/rules/))

### Reporting

- **`includeHtmlInReport`** – when `true`, includes full HTML in JSON report.

---

## Usage

### Minimal usage

```ts
import { runHtmlValidate } from '../../utils/htmlValidator/runHtmlValidate';

await page.goto('https://example.com');
await runHtmlValidate(page);
```

### Override configuration per test

```ts
await runHtmlValidate(page, {
  presets: ['html-validate:recommended'],

  rules: {
    'valid-id': false,
  },

  ignoredRules: {
    // Ignore a noisy rule for a single page
    'no-inline-style': true,
  },

  // Keep JSON smaller for this test
  includeHtmlInReport: false,
});
```

---

## Reports

Output directory (generated): `build/htmlValidator/`

Files:

- **`html-validate_<url>_<timestamp>.json`** – per-page JSON report
- **`html-validate_<url>_<timestamp>.md`** – per-page Markdown report
- **`html-validate-report.json`** – merged summary
- **`html-validate-report.md`** – merged summary
- **`html-validate-report.pdf`** – PDF version of the summary

Reports are merged in `global-teardown.ts`.

Sample reports:

- [Sample JSON report](samples/htmlValidator-reports/html-validate-report.json)
- [Sample Markdown report](samples/htmlValidator-reports/html-validate-report.md)
- [Sample PDF report](samples/htmlValidator-reports/html-validate-report.pdf)
