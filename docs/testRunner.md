# Test Runner

← [Back to main documentation](../README.md)

## Overview

Custom CLI wrapper around Playwright that handles environment selection, loading `.env` files, and running different groups of tests or helper commands from a single entrypoint.

---

## Configuration

Runner configuration lives in `config/testRunnerConfig.ts` and related helper files under `utils/testRunner/`.

A simplified version of `testRunnerConfig` looks like this:

```ts
export const testRunnerConfig = {
  // ---------------------------------------------------------------------------
  // Test types (maps "type" to folders)
  // ---------------------------------------------------------------------------

  testTypes: {
    api: ['tests/api'],
    accessibility: ['tests/accessibility'],
    analytics: ['tests/analytics'],
    functional: ['tests/functional'],
    visual: ['tests/visual'],
  },

  // ---------------------------------------------------------------------------
  // Test groups (named sets of test types)
  // ---------------------------------------------------------------------------

  testGroups: {
    all: ['accessibility', 'analytics', 'functional'],
    critical: ['analytics', 'functional'],
  },

  // ---------------------------------------------------------------------------
  // Grep shortcuts
  // ---------------------------------------------------------------------------

  grepGroups: {
    sanity: '[sanity]',
    smoke: '[smoke]',
  },

  // ---------------------------------------------------------------------------
  // Global excludes
  // ---------------------------------------------------------------------------

  grepExclude: ['[deprecated]', '[prod]'],
};
```

Key fields:

- **`testTypes`** – map of logical test types to their root folders.
- **`testGroups`** – named groups that combine multiple test types (for example `all`).
- **`grepGroups`** – named patterns used with Playwright `grep` (for example `grep:smoke`).
- **`grepExclude`** – patterns that should be excluded from runs.

The runner uses these definitions to map CLI arguments to Playwright options and decide which tests to run.

---

## Usage

### Running tests

The main entrypoint is a single npm script that accepts an environment and one or more test selectors:

```sh
npm run test <env> <testSelector> [ui]
```

Where:

- `<env>` – environment name (for example `dev`, `qa`, `stg`).
- `<testSelector>` – one of:
  - a test type (for example `functional`, `accessibility`, `analytics`, `visual`),
  - a test group (for example `all`),
  - a grep pattern (for example `grep:smoke`).
- `ui` (optional) – when present, starts the Playwright UI for the selected tests.

Arguments can be provided in any order (for example `npm run test dev all ui` or `npm run test dev ui all`).

> **Note:** visual tests are never run together with other types or groups. They are excluded from combined runs and must be executed explicitly using the `visual` test type.

Examples:

```sh
# Run functional tests in the dev environment
npm run test dev functional

# Run all test types configured under the "all" group (excluding visual tests)
npm run test dev all

# Run tests matching a grep pattern (for example smoke tests)
npm run test dev grep:smoke

# Run visual tests (Percy integration requires PERCY_* variables in .env)
npm run test dev visual

# Run Lighthouse performance test (threshold-based)
npm run test dev performancetest

# Run Lighthouse performance monitoring (median aggregation)
npm run test dev performancemonitoring

# Open Playwright Test UI for functional tests
npm run test dev functional ui
```

If you pass invalid or unknown arguments, the runner prints a detailed help message that includes:

- an analysis of each argument (environment, test type, group, grep, unknown),
- a list of available environments discovered in the `env/` directory,
- configured test types, test groups (with included types) and grep groups,
- example commands you can use.

### Helper commands

The same entrypoint also exposes additional utility commands:

```sh
# Run ESLint checks
npm run test eslint

# Run Prettier formatting
npm run test prettier

# Open the Playwright HTML report (after a test run)
npm run test report
```

Environments and `.env` loading are described in **[Environments](./environments.md)** and **[Dotenv](./dotenv.md)**.
For details on global Playwright settings, see **[Playwright configuration](./playwrightConfiguration.md)**.
