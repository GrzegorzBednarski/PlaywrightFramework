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

## 📁 Framework Structure

```
PlaywrightFramework/
├── 📁 .husky/                     # Husky Git hooks
│   └── pre-commit                 # Runs lint-staged and other checks before commit
├── 📁 build/                      # Generated reports and artifacts (auto-created)
│   └── ... (reports)
├── 📁 config/                     # Utils configuration files
│   └── ... (config files)
├── 📁 data/                       # Test data and constants
│   ├── cookies.ts                 # Central cookie definitions and scenarios (COOKIES, COOKIE_SCENARIOS)
│   └── intercepts.ts              # Shared URL patterns for request interception
├── 📁 fixtures/                   # JSON fixtures used for mocking HTTP responses and cookies
│   ├── 📁 cookies/                # Cookie fixtures in JSON format used by checkCookies (fixtures/cookies/*.json)
│   ├── 📁 intercepts/             # Fixtures for HTTP intercepts (used by replaceIntercept)
│   │   └── ... (fixture files)
│   ├── 📁 analytics/              # Analytics fixtures (used by checkAnalyticsEvent)
│   │   └── ... (fixture files)
│   └── ... (other fixtures)
├── 📁 docs/                       # Documentation files (feature & configuration docs)
│   ├── 📁 samples/                # Additional files used in docs (e.g. sample reports)
│   │   └── ... (sample files)
│   └── ... (doc files)
├── 📁 utils/                      # Utility functions and helpers
│   └── ... (helper files)
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
- **[Playwright Test Reporters](./docs/reporters.md)**
    - **[Clean Reporter](./docs/reporters.md#clean-reporter)** - Custom console reporter with cleaner, compact output
    - **[HTML Reporter](./docs/reporters.md#html-reporter)** - Interactive HTML report with traces and artifacts
      - [Usage](./docs/reporters.md#usage)
    - **[JSON Reporter](./docs/reporters.md#json-reporter)** - Machine-readable JSON for custom processing
    - **[JUnit Reporter](./docs/reporters.md#junit-reporter)** - CI-friendly XML output for pipelines and dashboards
    - **[Line Reporter](./docs/reporters.md#line-reporter)** - Minimal single-line per test, very low verbosity
    - **[List Reporter](./docs/reporters.md#list-reporter)** - Grouped list-style console output

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
**Playwright test reporters**
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
  - [Cookies configuration](./docs/cookies.md#cookies-configuration) | [Cookie scenarios configuration](./docs/cookies.md#cookie-scenarios-configuration)
- **[Intercepts](./docs/intercepts.md)** - Centralized URL patterns for HTTP request interception
  - [Configuration](./docs/intercepts.md#configuration) | [Usage](./docs/intercepts.md#usage)

### 🧪 Testing Features
- **[Accessibility](./docs/accessibility.md)** - Automated accessibility checks and audits
  - [Configuration](./docs/accessibility.md#configuration) | [Usage](./docs/accessibility.md#usage) | [Reports](./docs/accessibility.md#reports)
- **[Analytics](./docs/analytics.md)** - Capturing and asserting analytics events from data layers
  - [Configuration](./docs/analytics.md#configuration) | [Usage](./docs/analytics.md#usage) | [Dynamic values](./docs/analytics.md#dynamic-values) | [Debug output](./docs/analytics.md#debug-output)

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
