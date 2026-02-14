# Playwright configuration

← [Back to main documentation](../README.md)

## Overview

Global Playwright configuration controls how all tests run in this project (such as timeouts, retries, base URL, reporters and shared options).

---

## Configuration

The main configuration is defined in `playwright.config.ts` using `defineConfig` from `@playwright/test`.

Key options include:

- **Global timeouts and retries**
  - `timeout` – maximum time for a single test.
  - `expect.timeout` – default timeout for Playwright expectations.
  - `retries` – number of retries for failing tests.
- **`use` options**
  - `baseURL` – base URL used by `page.goto` and relative navigations.
  - `actionTimeout` – timeout for user-like actions (click, fill, etc.).
  - `navigationTimeout` – timeout for navigations.
  - screenshot / trace / video configuration – capture settings used for debugging.
- **Concurrency and workers**
  - `fullyParallel` – whether tests can run fully in parallel.
  - `workers` – number of parallel workers (or fallback to Playwright default).
- **Lifecycle hooks**
  - `globalSetup` – pre-test logic (for example cleaning build folders).
  - `globalTeardown` – post-test logic (for example merging reports).
- **Reporters and output**
  - console and file reporters (see **[Reporters](./reporters.md)** for details).
  - output directories for artifacts and reports.

### Environment overrides

Several configuration values can be changed per environment using variables from `process.env`.
Typical patterns used in `playwright.config.ts` are:

- reading numeric values with a default fallback:

  ```ts
  const testTimeout = Number(process.env.TEST_TIMEOUT) || 45000;
  const expectTimeout = Number(process.env.EXPECT_TIMEOUT) || 8000;
  const retries = Number(process.env.RETRIES) || 1;
  ```

- using per-environment base URL:

  ```ts
  const baseURL = process.env.BASE_URL || 'https://www.example.com';
  ```

These values are usually provided via `.env` files for each environment.
See **[Environments](./environments.md)** for an example of configuring per-environment values.

---

## Usage

Playwright always reads settings from `playwright.config.ts` when running tests.

You can override selected values in two ways:

- **Per environment** – by providing values in `.env` files that end up in `process.env` (for example `BASE_URL`, `TEST_TIMEOUT`, `EXPECT_TIMEOUT`, `RETRIES`). See **[Environments](./environments.md)** for details.
- **Per test or suite** – by configuring behaviour directly in test files (for example serial mode or per-test timeouts). See **[Test Configuration](./testConfiguration.md)** for examples.
