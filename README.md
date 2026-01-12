# PlaywrightStarterKit

Playwright framework with pre-configured plugins and best practices to get you started quickly.

## Prerequisites

- **[Node.js](https://nodejs.org/en)** (tested on 22.18.0)
- **[NPM](https://www.npmjs.com/package/npm)** (tested on 11.5.2)

## Installation

💡 If you change the Playwright version (newer or older), run `npx playwright uninstall --all` first to remove old browser binaries

Run the following commands in your console:
```sh
npm install
npx playwright install
```

## Documentation

- **[Playwright Documentation](https://playwright.dev/docs/intro)**

## Start here

If you want to run tests in this project, start with these three steps:

1. **[Create environment files](./docs/environments.md)** – define per-environment settings in `.env.*` files under the `env/` directory.
2. **[Configure test types and groups](./docs/testRunner.md#configuration)** – decide which tests belong to which logical groups.
3. **[Run tests](./docs/testRunner.md#running-tests)** – execute tests for a given environment and test type/group using the custom runner.

## 📁 Framework Structure

```
PlaywrightFramework/
├── 📁 .husky/                     # Husky Git hooks
│   └── pre-commit                 # Runs lint-staged and other checks before commit
├── .gitignore                     # Git ignore rules
├── 📁 build/                      # Generated reports and artifacts (auto-created)
│   └── ... (reports)
├── 📁 config/                     # Utils configuration files
│   └── ... (config files)
├── 📁 data/                       # Test data and constants
│   ├── cookies.ts                 # Central cookie definitions and scenarios (COOKIES, COOKIE_SCENARIOS)
│   └── intercepts.ts              # Shared URL patterns for request interception
├── 📁 docs/                       # Documentation files (feature & configuration docs)
│   ├── 📁 samples/                # Additional files used in docs (e.g. sample reports)
│   │   └── ... (sample files)
│   └── ... (doc files)
├── 📁 env/                        # Environment variable files for different environments
│   └── ... (.env.*)
├── 📁 fixtures/                   # JSON fixtures used for mocking HTTP responses and cookies
│   ├── 📁 analytics/              # Analytics fixtures (used by checkAnalyticsEvent)
│   │   └── ... (fixture files)
│   ├── 📁 cookies/                # Cookie fixtures in JSON format used by checkCookies (fixtures/cookies/*.json)
│   │   └── ... (fixture files)
│   ├── 📁 intercepts/             # Fixtures for HTTP intercepts (used by replaceIntercept)
│   │   └── ... (fixture files)
│   └── ... (other fixtures)
├── 📁 pageObjects/                # Page Object Model structure grouped by domain
│   ├── 📁 pageDomain/             # Example domain (e.g. example.com)
│   │   ├── 📁 components/         # Reusable UI components for this domain
│   │   │   └── ... (component files)
│   │   ├── 📁 pages/              # Concrete pages (home, contact, cart, ...)
│   │   │   └── ... (page files)
│   │   ├── base.page.ts           # Base page with shared navigation and helpers
│   │   └── pageFixture.ts         # Playwright fixtures exposing page objects
│   └── ... (other domains)
├── 📁 tests/                      # Playwright test suites
│   ├── 📁 accessibility/          # Accessibility tests
│   │   └── ... (spec files)
│   ├── 📁 analytics/              # Analytics tests
│   │   └── ... (spec files)
│   ├── 📁 functional/             # Functional/e2e tests
│   │   └── ... (spec files)
│   └── 📁 visual/                 # Visual regression tests
│       └── ... (spec files)
├── 📁 utils/                      # Utility functions and helpers
│   └── ... (helper files)
├── .percy.yml                     # Percy visual testing configuration
├── .prettierrc                    # Prettier configuration
├── eslint.config.js               # ESLint configuration
├── global-setup.ts                # Pre-test setup (cleaning build folder)
├── global-teardown.ts             # Post-test teardown (e.g. merge accessibility reports, generate PDFs)
├── playwright.config.ts           # Main Playwright configuration
├── README.md                      # Comprehensive documentation for all framework features
├── tsconfig.eslint.json           # TypeScript config used by ESLint
└── tsconfig.json                  # TypeScript configuration
```

## Configuration

### 🔧 Core Configuration
- **[Dotenv](./docs/dotenv.md)** – Loading environment variables from `.env` files before tests
  - [Configuration](./docs/dotenv.md#configuration) | [Usage](./docs/dotenv.md#usage)
- **[Environments](./docs/environments.md)** – Environment setup, `.env` files and switching between environments
  - [Configuration](./docs/environments.md#configuration) | [Usage](./docs/environments.md#usage) | [Secrets & sharing](./docs/environments.md#secrets-and-sharing)
- **[Playwright configuration](./docs/playwrightConfiguration.md)** – Global Playwright configuration used by all tests
  - [Configuration](./docs/playwrightConfiguration.md#configuration) | [Usage](./docs/playwrightConfiguration.md#usage)
- **[Test Configuration](./docs/testConfiguration.md)** – Per-test configuration patterns
  - [Execution modes](./docs/testConfiguration.md#execution-modes) | [Per-test timeouts](./docs/testConfiguration.md#per-test-timeouts) | [Retries](./docs/testConfiguration.md#retries-in-code) | [Focusing tests](./docs/testConfiguration.md#focusing-tests) | [Skipping tests](./docs/testConfiguration.md#skipping-tests) | [Test steps](./docs/testConfiguration.md#test-steps) | [Env vars in tests](./docs/testConfiguration.md#using-environment-variables-in-tests)
- **[Test Runner](./docs/testRunner.md)** – Custom test runner entrypoint and CLI commands
  - [Configuration](./docs/testRunner.md#configuration) | [Running tests](./docs/testRunner.md#running-tests) | [Helper commands](./docs/testRunner.md#helper-commands)

### 🎨 Code Quality & Formatting
- **[ESLint](./docs/eslint.md)** - Code linting and static analysis
  - [Configuration](./docs/eslint.md#configuration) | [Usage](./docs/eslint.md#usage)
- **[Prettier](./docs/prettier.md)** - Code formatting and style enforcement
  - [Configuration](./docs/prettier.md#configuration) | [Usage](./docs/prettier.md#usage)
- **[TypeScript](./docs/typescript.md)** - Type checking and compiler settings
  - [Configuration](./docs/typescript.md#configuration)

### 🔗 Git Automation
- **[Husky](./docs/husky.md)** - Git hooks management and pre-commit automation
  - [Configuration](./docs/husky.md#configuration)
- **[Lint-staged](./docs/lintStaged.md)** - Run quality checks on pre-commit files.
  - [Configuration](./docs/lintStaged.md#configuration)

### 📝 Reporters
- [Configuration](./docs/reporters.md#configuration)
  - **[Clean Reporter](./docs/reporters.md#clean-reporter)** - Custom console reporter with cleaner, compact output
  - **[HTML Reporter](./docs/reporters.md#html-reporter)** - Interactive HTML report with traces and artifacts
  - **[JSON Reporter](./docs/reporters.md#json-reporter)** - Machine-readable JSON for custom processing
  - **[JUnit Reporter](./docs/reporters.md#junit-reporter)** - CI-friendly XML output for pipelines and dashboards
  - **[Line Reporter](./docs/reporters.md#line-reporter)** - Minimal single-line per test, very low verbosity
  - **[List Reporter](./docs/reporters.md#list-reporter)** - Grouped list-style console output

## Usage

### 🍪 Cookie Management
- **[Check Cookies](./docs/checkCookies.md)** - Assert cookies using JSON fixtures (exist / not exist)
  - [Configuration](./docs/checkCookies.md#configuration) | [Usage](./docs/checkCookies.md#usage) | [Dynamic values](./docs/checkCookies.md#dynamic-values) | [Debug output](./docs/checkCookies.md#debug-output)
- **[Set Cookies](./docs/setCookies.md)** - Inject selected cookies into the browser context
  - [Configuration](./docs/setCookies.md#configuration) | [Usage](./docs/setCookies.md#usage)
- **[Set Cookies Scenario](./docs/setCookiesScenario.md)** - Apply predefined cookie combinations by name
  - [Configuration](./docs/setCookiesScenario.md#configuration) | [Usage](./docs/setCookiesScenario.md#usage)

### 📊 Data Management
- **[Cookies](./docs/cookies.md)** - Central configuration for predefined cookies and reusable cookie scenarios
  - [Cookies configuration](./docs/cookies.md#cookies-configuration) | [Dynamic domains](./docs/cookies.md#dynamic-cookie-domains) | [Cookie scenarios configuration](./docs/cookies.md#cookie-scenarios-configuration)
- **[Intercepts](./docs/intercepts.md)** - Centralized URL patterns for HTTP request interception
  - [Configuration](./docs/intercepts.md#configuration) | [Usage](./docs/intercepts.md#usage)

### 🧩 Page Object Model
- **[Page Object Model](./docs/pageObjectModel.md)** - Structure and usage of pages, components, and fixtures
  - [Configuration](./docs/pageObjectModel.md#configuration) | [Usage](./docs/pageObjectModel.md#usage) | [Advanced tips](./docs/pageObjectModel.md#advanced-tips)

### 🧪 Testing Features
- **[Accessibility](./docs/accessibility.md)** - Automated accessibility checks and audits
  - [Configuration](./docs/accessibility.md#configuration) | [Usage](./docs/accessibility.md#usage) | [Reports](./docs/accessibility.md#reports)
- **[Analytics](./docs/analytics.md)** - Capturing and asserting analytics events from data layers
  - [Configuration](./docs/analytics.md#configuration) | [Usage](./docs/analytics.md#usage) | [Dynamic values](./docs/analytics.md#dynamic-values) | [Debug output](./docs/analytics.md#debug-output)
- **[Visual Testing](docs/visualTesting.md)** - Visual regression testing with Percy and Playwright
  - [Configuration](docs/visualTesting.md#configuration) | [Environment variables](docs/visualTesting.md#environment-variables) | [Usage](docs/visualTesting.md#usage) | [Advanced usage](docs/visualTesting.md#advanced-usage) | [Viewing results](docs/visualTesting.md#viewing-results) 

### 🛠️ Test Utilities
- **[Assert No Console Errors](./docs/assertNoConsoleErrors.md)** - Validate that pages load without JavaScript console errors
  - [Configuration](./docs/assertNoConsoleErrors.md#configuration) | [Usage](./docs/assertNoConsoleErrors.md#usage)
- **[iFrames](./docs/iFrames.md)** - Working with embedded frames and nested browsing contexts
- **[Replace Text](./docs/replaceText.md)** - Modify text content in DOM elements for testing scenarios
  - [Usage](./docs/replaceText.md#usage)
- **[Wait for Page Idle](./docs/waitForPageIdle.md)** - Waiting for page stability and AJAX completion
  - [Configuration](./docs/waitForPageIdle.md#configuration) | [Usage](./docs/waitForPageIdle.md#usage)

### 🌐 Working with HTTP requests
- **[Replace Intercept](./docs/replaceIntercept.md)** - Mock HTTP responses using JSON fixtures
  - [Configuration](./docs/replaceIntercept.md#configuration) | [Usage](./docs/replaceIntercept.md#usage) | [Dynamic values](./docs/replaceIntercept.md#dynamic-values) | [Status code change](./docs/replaceIntercept.md#status-code-change)
- **[Request Assertions](./docs/requestAssertions.md)** - Common patterns for validating HTTP requests in tests
- **[Wait for Intercept](./docs/waitForIntercept.md)** - Wait for specific HTTP requests during tests
  - [Configuration](./docs/waitForIntercept.md#configuration) | [Usage](./docs/waitForIntercept.md#usage)
