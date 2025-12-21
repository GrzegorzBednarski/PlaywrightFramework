# Assert No Console Errors

← [Back to main documentation](../README.md)

Utility for asserting that a page loads without unexpected JavaScript console errors.

## Configuration

Console error filtering is configured in **`config/assertNoConsoleErrorsConfig.ts`**:

- **`ignoredPatterns`** – map of substrings to ignore in console error messages
  - key: substring to match in `console.error` text
  - value: `true` → ignore, `false` → do not ignore

Example config:

```ts
export const assertNoConsoleErrorsConfig = {
  ignoredPatterns: {
    'Failed to load resource: the server responded with a status of 401 ()': true, // Reported in [ABC-123]
  },
};
```

To override patterns for a single call, use the `options.ignoredPatternsOverride` argument, for example:

```ts
await assertNoConsoleErrors(page, 'https://example.com/', {
  ignoredPatternsOverride: {
    ...assertNoConsoleErrorsConfig.ignoredPatterns,
    'Dashboard error message': true,
    'Failed to load resource: the server responded with a status of 401 ()': false,
  },
});
```

Function signature:

- **`assertNoConsoleErrors(page, url, options?)`**
  - **`page`** – Playwright `Page` instance
  - **`url`** – absolute URL to navigate to
  - **`options.ignoredPatternsOverride`** (optional) – `Record<string, boolean>` merged with config patterns

## Usage

### Basic usage (using config only)

```ts
import { assertNoConsoleErrors } from '../../utils/assertNoConsoleErrors';

await assertNoConsoleErrors(page, 'https://example.com');
```

This will:
- attach a `console` listener for error messages,
- navigate to `https://example.com`,
- wait for network to become idle using `waitForPageIdle`,
- fail the step if any non-ignored console errors are found.

### Override ignored patterns per call

```ts
import { assertNoConsoleErrors } from '../../utils/assertNoConsoleErrors';
import { assertNoConsoleErrorsConfig } from '../../config/assertNoConsoleErrorsConfig';

await assertNoConsoleErrors(page, 'https://example.com', {
  ignoredPatternsOverride: {
    // start from global config
    ...assertNoConsoleErrorsConfig.ignoredPatterns,
    // ignore an additional dashboard-specific error only on this page
    'Dashboard error message': true,
    // enforce that this pattern is NOT ignored for this call
    'Failed to load resource: the server responded with a status of 401 ()': false,
  },
});
```

When errors are detected, the step fails with a message similar to:

```text
Console errors found on https://example.com/dashboard:
  [1] Failed to load resource: ...
  [2] TypeError: Cannot read properties of undefined
```
