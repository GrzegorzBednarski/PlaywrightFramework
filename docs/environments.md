# Environments

← [Back to main documentation](../README.md)

## Overview

Environment files are used to store secrets (for example API keys or user credentials) and per-environment settings that apply when tests run.

## Configuration

Environment-specific variables are stored in files named `.env.<environment>` under the `env/` directory.
These files are ignored by Git and should not be committed to the repository.

Examples:

- `env/.env.dev`
- `env/.env.qa`
- `env/.env.stg`

Each file contains key–value pairs used by Playwright configuration and tests.

To introduce a new environment, create a new file (for example `.env.myenv`) in the `env/` directory, copy values from the example file and adjust them for the new environment.

Below is a simplified example based on the existing `env/.env.example` file:

```dotenv
# Playwright
BASE_URL=https://www.example.com
ACTION_TIMEOUT=15000
EXPECT_TIMEOUT=8000
NAVIGATION_TIMEOUT=20000
TEST_TIMEOUT=45000
RETRIES=1

# Visual testing (Percy)
PERCY_TOKEN=your_percy_token
PERCY_BRANCH=example-branch

# API keys
API_KEY_PUBLIC=pk_test_1234567890abcdef

# Credentials (examples only)
ADMIN_USERNAME=admin@example.com
ADMIN_PASSWORD=admin.super-secret
USER1_USERNAME=user1@example.com
USER1_PASSWORD=user1.super-secret
```

Typical variables include:

- **`BASE_URL`** – per-environment base URL used by Playwright configuration.
- **Timeouts and retries** – `ACTION_TIMEOUT`, `NAVIGATION_TIMEOUT`, `TEST_TIMEOUT`, `EXPECT_TIMEOUT`, `RETRIES`.
- **Visual testing** – `PERCY_TOKEN`, `PERCY_BRANCH`.
- **API keys** – for example `API_KEY_PUBLIC` used by tests.
- **Credentials** – sample usernames and passwords used in tests.

Playwright configuration provides default values for timeouts and retries, while `BASE_URL` and selected time-related settings are usually set explicitly in `.env` files.
See **[Playwright configuration](./playwrightConfiguration.md)** for more information on how these values are read from `process.env`.

## Usage

The custom test runner derives the environment name from CLI arguments (for example `dev`, `qa`, `stg`), sets the `ENV` variable and loads the matching `.env` file before delegating to Playwright.

For more details and concrete CLI examples, see the **Running tests** section in **[Test Runner](./testRunner.md#running-tests)**.

## Secrets and sharing

- Keep real `.env.*` files out of version control and use `env/.env.example` as a template.
- Store sensitive values (tokens, passwords, API keys) in `.env` files and use dedicated secret-management tools (for example Delinea Secret Server) to share those files securely within the team instead of committing them to the repository.
