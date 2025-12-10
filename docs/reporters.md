# Reporters

← [Back to main documentation](../README.md)

This project uses multiple reporters to present and persist test results. They are configured in `playwright.config.ts` under the `reporter` section.

Note: This page describes Playwright test result reporters (run-level status and outputs), not feature-specific reporters for domains like Accessibility or Performance.

## Configuration

Reporters are defined in the `reporter` array inside `playwright.config.ts`.

- To add a reporter:
  - For built-ins, append its name. For consistency in this project, we show them as array entries: `['line']`, `['list']`, `['json']`, `['junit']`, `['html']`.
  - For custom reporters, e.g., add a path: `['./utils/cleanReporter.ts']` (use the correct relative path to your custom reporter).
- To configure options (when supported):
  - Use tuple syntax with options:

```ts
reporter: [
  ['./utils/cleanReporter.ts'],
  ['html', { outputFolder: `${buildDir}/html-report`, open: 'never' }],
  ['json', { outputFile: `${buildDir}/json/results.json` }],
  ['junit', { outputFile: `${buildDir}/junit/results.xml` }],
  // ['line'],
  // ['list'],
]
```

- To remove a reporter:
  - Delete its entry from the `reporter` array.

Notes:
- `buildDir` is exported from `playwright.config.ts` and used to keep all artifacts in the `build/` folder.
- Enable only the reporters you need to keep console output readable.
- The `build` folder is cleaned before each run by `global-setup.ts` to ensure fresh artifacts.

## Clean Reporter

A custom reporter that cleans and formats console output to be more readable in CI and local runs. It reduces noise, aligns messages, and emphasizes failures.

- Location: `./utils/cleanReporter.ts`

## HTML Reporter

Generates an interactive HTML report with detailed test results, traces, and artifacts.

- Output folder: `build/html-report`
- Open mode: `never` (open manually as needed)

### Usage:

To open the HTML report after a test run:

```sh
npm run test:report
```

Script is configured in package.json:

```sh
// package.json (scripts)
{
  // ...existing fields...
  "scripts": {
    // ...existing scripts...
    "test:report": "npx playwright show-report build/html-report"
  }
}
```

## JSON Reporter

Outputs a machine-readable JSON report with all test results and metadata.

- Output file: `build/json/results.json`
- Use cases: Custom processing, dashboards, or data pipelines.

## JUnit Reporter

Produces a JUnit-compatible XML file suitable for CI integrations (Jenkins, GitHub Actions, Azure DevOps, etc.).

- Output file: `build/junit/results.xml`
- Use cases: CI test summary, trend charts, gates.

## Line Reporter

Minimal, single-line output for each test—useful for quick feedback with low verbosity.

Example output:

```text
✓ [EXAMPLE] tests/functional/login.spec.ts:7:3 › [smoke] User can log in (3.2s)
✗ [EXAMPLE] tests/analytics/analytics.spec.ts:6:5 › [smoke] should track analytics event after accepting all cookies (15.9s)
✓ [EXAMPLE] tests/accessibility/accessibility.spec.ts:12:3 › [sanity] page has no serious violations (1.1s)
```

## List Reporter

A structured list-style output with test grouping; useful when you want a readable console report without the HTML UI.

Example output:

```text
[EXAMPLE]
  functional
    ✓ [smoke] User can log in (3.2s)
  analytics
    ✗ [smoke] should track analytics event after accepting all cookies (15.9s)
      Error: Expected analytics event not found within 10000ms
      at utils/analytics.ts:203:9
  accessibility
    ✓ [sanity] page has no serious violations (1.1s)

3 tests: 2 passed, 1 failed
```
