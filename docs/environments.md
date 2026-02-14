# Environments

← [Back to main documentation](../README.md)

## Overview

Environment files are used to store secrets (for example API keys or user credentials) and per-environment settings that apply when tests run.

---

## Configuration

Environment-specific variables are stored in files named `.env.<environment>` under the `env/` directory.
These files are ignored by Git and should not be committed to the repository.

Examples:

- `env/.env.dev`
- `env/.env.qa`
- `env/.env.stg`

Each file contains key–value pairs used by Playwright configuration and tests.

To introduce a new environment, create a new file (for example `.env.myenv`) in the `env/` directory, copy values from the example file and adjust them for the new environment.

Below is an example based on the existing `env/.env.example` file:

```dotenv
# Playwright config
# ========================================================
BASE_URL="https://the-internet.herokuapp.com"
ACTION_TIMEOUT="15000"
EXPECT_TIMEOUT="8000"
NAVIGATION_TIMEOUT="20000"
TEST_TIMEOUT="45000"
RETRIES="1"

# Visual test (Percy)
# ========================================================
PERCY_TOKEN="web_ba8f3c1d7e5a4f2b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b"
PERCY_BRANCH="example"

# API keys
# ========================================================
API_KEY_PUBLIC="pk_test_1234567890abcdef"

# Basic Auth
# ========================================================

# Global Basic Auth
BASICAUTH_USERNAME="admin"
BASICAUTH_PASSWORD="admin"

# Sample Basic Auth for Admin user
ADMIN_BASICAUTH_USERNAME="admin"
ADMIN_BASICAUTH_PASSWORD="admin.super-secret"

# Credentials
# ========================================================
ADMIN_USERNAME="admin@example.com"
ADMIN_PASSWORD="admin.super-secret"
STANDARD_USER_USERNAME="standard_user"
STANDARD_USER_PASSWORD="secret_sauce"
VISUAL_USER_USERNAME="visual_user"
VISUAL_USER_PASSWORD="secret_sauce"
```

Typical variables include:

- **`BASE_URL`** – per-environment base URL used by Playwright configuration.
- **Timeouts and retries** – `ACTION_TIMEOUT`, `NAVIGATION_TIMEOUT`, `TEST_TIMEOUT`, `EXPECT_TIMEOUT`, `RETRIES`.
- **Visual testing** – `PERCY_TOKEN`, `PERCY_BRANCH`.
- **API keys** – for example `API_KEY_PUBLIC` used by tests.
- **Credentials** – usernames and passwords used in tests.

Playwright configuration provides default values for timeouts and retries, while `BASE_URL` and selected time-related settings are usually set explicitly in `.env` files.
See **[Playwright configuration](./playwrightConfiguration.md)** for more information on how these values are read from `process.env`.

### Credentials naming convention

User credentials are resolved from `.env` using the convention:

- `<USER_KEY>_USERNAME`
- `<USER_KEY>_PASSWORD`

Example:

- `ADMIN_USERNAME` / `ADMIN_PASSWORD`
- `STANDARD_USER_USERNAME` / `STANDARD_USER_PASSWORD`

`<USER_KEY>` is typically the same value you use in tests/fixtures (e.g. `userKey: 'ADMIN'`).

### Basic Auth naming convention

The framework supports HTTP Basic Auth via env variables.

You can define it in two ways:

1. **Global Basic Auth** (applies when you call `useBasicAuth(page)` without a user key):

- `BASICAUTH_USERNAME`
- `BASICAUTH_PASSWORD`

2. **Per-user Basic Auth** (use when you call `useBasicAuth(page, 'ADMIN')`):

- `<USER_KEY>_BASICAUTH_USERNAME`
- `<USER_KEY>_BASICAUTH_PASSWORD`

---

## Usage

The custom test runner derives the environment name from CLI arguments (for example `dev`, `qa`, `stg`), sets the `ENV` variable and loads the matching `.env` file before delegating to Playwright.

For more details and concrete CLI examples, see the **Running tests** section in **[Test Runner](./testRunner.md#running-tests)**.

---

## Secrets and sharing

- Keep real `.env.*` files out of version control and use `env/.env.example` as a template.
- Store sensitive values (tokens, passwords, API keys) in `.env` files and use dedicated secret-management tools (for example Delinea Secret Server) to share those files securely within the team instead of committing them to the repository.
