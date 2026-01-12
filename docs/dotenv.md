# Dotenv

← [Back to main documentation](../README.md)

## Overview

Helper responsible for loading additional environment-specific values from `env/.env.<env>` files before tests run.

It is used by the custom test runner to:
- select the correct `.env` file based on the `ENV` value,
- add or override selected `process.env` values used in `playwright.config.ts` and tests.

## Configuration

`config/dotenvConfig.ts` exposes a simple configuration object used by `initializeDotenv`:

- **`override`** – when `true`, values from `.env` can overwrite existing `process.env` values (including values used by Playwright configuration).
- **`enableLogging`** – when `true`, a short log line is printed when an environment file is loaded.

Example (simplified):

```ts
export const dotenvConfig = {
  override: true,
  enableLogging: true,
};
```

Environment-specific values are read from files in `env/` (for example `env/.env.dev`).
See **[Environments](./environments.md)** for the structure of these files and a full example.

Playwright configuration defines default timeouts, retries and `baseURL` and can then be overridden by values from `process.env`.
See **[Playwright configuration](./playwrightConfiguration.md)** for more information on how env values are used there.

## Usage

The dotenv helper is used automatically by the custom test runner – you do not need to call it directly in tests.

For details on how `ENV` is derived from CLI arguments and when `initializeDotenv` is called, see **[Test Runner](./testRunner.md#running-tests)**.
