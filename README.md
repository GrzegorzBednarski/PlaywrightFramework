# Playwright Simplified

A practical Playwright starter framework that helps you ship reliable UI and API tests faster.

It comes with a clean structure, sensible defaults, and a set of utilities you can reuse across projects:

- Custom test runner (environments, test groups, grep groups)
- Session management (reusable authenticated state)
- API tool + fixtures (requests + assertions)
- Built-in reporters (HTML/JSON/JUnit) and code quality tooling (ESLint/Prettier)

Key capabilities (optional modules/features you can enable per project):

- Accessibility testing (axe)
- Analytics event assertions
- Client-side performance testing & monitoring (Lighthouse)
- Cookie scenarios (set, validate, and reuse)
- HTTP request assertions & API auth helpers
- Link checking (Linkinator)
- Multi-environment support (dotenv + `.env.*`)
- Network mocking & intercept helpers (fixtures + replace/wait for intercept)
- Session-based authentication (reusable authenticated state + configurable login flows)
- Stability helpers for flaky tests (wait for page idle)
- UI quality guardrails (assert no console errors)
- Visual regression testing (Percy)

## Author

Grzegorz Bednarski ([it.grzegorz.bednarski@gmail.com](mailto:it.grzegorz.bednarski@gmail.com))

## License

This project is licensed under the MIT License. See [`LICENSE`](./LICENSE).

## Prerequisites

- **[Node.js](https://nodejs.org/en)** (tested on 22.18.0)
- **[NPM](https://www.npmjs.com/package/npm)** (tested on 11.5.2)

## Installation

💡 If you change the Playwright version (newer or older), run `npx playwright uninstall --all` first to remove old browser binaries

Run the following commands in your console:

```sh
npm ci
npx playwright install
```

## Documentation

- **[Playwright Documentation](https://playwright.dev/docs/intro)**

## Start here

If you want to run tests in this project, start with these three steps:

1. **[Create environment files](./docs/environments.md)** – define per-environment settings in `.env.*` files under the `env/` directory.
2. **[Configure test types and groups](./docs/testRunner.md#configuration)** – decide which tests belong to which logical groups.
3. **[Run tests](./docs/testRunner.md#running-tests)** – execute tests for a given environment and test type/group using the custom runner.
4. **[baseTest](./docs/baseTest.md)** – shared test entrypoint (sessions + API). Helpful when writing tests without a domain POM.

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
│   ├── 📁 api/                    # API fixtures (request bodies, expected JSON)
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
│   │   ├── app.page.ts            # (Optional) AppPage extending BasePage with shared layout (header/footer, logged-in menu / user indicator, ...)
│   │   ├── base.page.ts           # Base page with shared navigation and helpers
│   │   └── pageFixture.ts         # Playwright fixtures exposing page objects
│   └── ... (other domains)
├── 📁 scripts/                    # JS entrypoints (e.g. runner bootstrapper)
│   └── ... (script files)
├── 📁 tests/                      # Playwright test suites
│   ├── 📁 accessibility/          # Accessibility tests
│   │   └── ... (spec files)
│   ├── 📁 analytics/              # Analytics tests
│   │   └── ... (spec files)
│   ├── 📁 api/                    # API tests
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
- **[Test configuration](./docs/testConfiguration.md)** – Per-test configuration patterns
  - [Execution modes](./docs/testConfiguration.md#execution-modes) | [Per-test timeouts](./docs/testConfiguration.md#per-test-timeouts) | [Retries](./docs/testConfiguration.md#retries-in-code) | [Focusing tests](./docs/testConfiguration.md#focusing-tests) | [Skipping tests](./docs/testConfiguration.md#skipping-tests) | [Test steps](./docs/testConfiguration.md#test-steps) | [Env vars in tests](./docs/testConfiguration.md#using-environment-variables-in-tests)
- **[Test runner](./docs/testRunner.md)** – Custom test runner entrypoint and CLI commands
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

### 🔁 API requests (API tool)

- **[API](./docs/api/api.md)** - Quick start + how to configure the API tool.
  - [Configuration](./docs/api/api.md#configuration) | [Minimal usage](./docs/api/api.md#minimal-usage)
- **[Fixtures](./docs/api/apiFixtures.md)** - How to use JSON fixtures + placeholders.
  - [Body fixtures](./docs/api/apiFixtures.md#body-fixtures) | [Placeholder replacements](./docs/api/apiFixtures.md#placeholder-replacements) | [Expected-response fixtures](./docs/api/apiFixtures.md#expected-response-fixtures)
- **[Sending requests](./docs/api/apiRequests.md)** - How to send requests (methods, headers, body).
  - [Supported methods](./docs/api/apiRequests.md#supported-methods) | [Request options](./docs/api/apiRequests.md#request-options-common) | [Fixtures + replacements](./docs/api/apiRequests.md#fixtures--replacements)
- **[Response assertions](./docs/api/apiAssertions.md)** - Ready-to-use assertions for API responses.
  - [Status](./docs/api/apiAssertions.md#status) | [JSON keys](./docs/api/apiAssertions.md#json-keys) | [JSON matches](./docs/api/apiAssertions.md#json-matches--not-matches) | [Arrays](./docs/api/apiAssertions.md#arrays)
  - [Body contains](./docs/api/apiAssertions.md#body-contains--not-contains) | [JSON fixtures](./docs/api/apiAssertions.md#json-fixture-assertions)

### 🔐 Authentication & Sessions

- **[Sessions](./docs/sessionManagement/sessions.md)** - Reusable authenticated browser state stored on disk.
  - [Configuration](./docs/sessionManagement/sessions.md#configuration) | [Usage](./docs/sessionManagement/sessions.md#usage) | [Multiple login configs](./docs/sessionManagement/sessions.md#24-multiple-login-configs-optional)
  - **[Basic Auth](./docs/sessionManagement/basicAuth.md)** - Basic HTTP auth helper + naming conventions.
    - [Configuration](./docs/sessionManagement/basicAuth.md#configuration) | [Usage](./docs/sessionManagement/basicAuth.md#usage) | [Automation](./docs/pageObjectModel/advancedPatterns.md#basic-auth-automation)
  - **[Login flow](./docs/sessionManagement/loginFlow.md)** - Examples of implementing `loginFlow` (POM login, Basic Auth, meta).
    - [POM login](./docs/sessionManagement/loginFlow.md#ui-login-via-pom-helper-recommended) | [Manual login](./docs/sessionManagement/loginFlow.md#ui-login-without-pom-not-recommended) | [Basic Auth](./docs/sessionManagement/loginFlow.md#basic-auth)
  - **[Request auth helpers](./docs/sessionManagement/requestAuth.md)** - Helpers like `extractBearerAuthHeader(...)`.
  - **[Session meta](./docs/sessionManagement/meta.md)** - Saving and using `sessionMeta` in tests.
    - [Authorization header](./docs/sessionManagement/meta.md#bearer-token-authorization-header) | [API key/custom header](./docs/sessionManagement/meta.md#api-key--custom-header) | [Custom value](./docs/sessionManagement/meta.md#custom-value-dynamic)

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
- **[Data](./docs/data.md)** - Central place for shared test data (users, products, etc.)
  - [Configuration](./docs/data.md#configuration) | [Usage](./docs/data.md#usage)
- **[Intercepts](./docs/intercepts.md)** - Centralized URL patterns for HTTP request interception
  - [Configuration](./docs/intercepts.md#configuration) | [Usage](./docs/intercepts.md#usage)

### 🧩 Page Object Model

- **[Page Object Model](./docs/pageObjectModel/index.md)** - Entry point (overview, quick start, and structure)
  - **[baseTest](./docs/baseTest.md)** - shared test entrypoint (sessions + API)
  - **[Base pages](./docs/pageObjectModel/basePage.md)** - shared helpers and navigation
    - [Configuration](./docs/pageObjectModel/basePage.md#configuration) | [Usage](./docs/pageObjectModel/basePage.md#usage)
  - **[AppPage](./docs/pageObjectModel/appPage.md)** - shared logged-in layout layer (optional)
    - [Configuration](./docs/pageObjectModel/appPage.md#configuration) | [Usage](./docs/pageObjectModel/appPage.md#usage)
  - **[Components](./docs/pageObjectModel/components.md)** - reusable UI fragments (cookie prompt, header, footer)
    - [Configuration](./docs/pageObjectModel/components.md#configuration) | [Usage](./docs/pageObjectModel/components.md#usage)
  - **[Pages](./docs/pageObjectModel/pages.md)** - concrete pages (static & dynamic)
    - [Configuration](./docs/pageObjectModel/pages.md#configuration) | [Usage](./docs/pageObjectModel/pages.md#usage)
    - [Static pages](./docs/pageObjectModel/pages.md#static-pages-require) | [Dynamic pages](./docs/pageObjectModel/pages.md#dynamic-pages-require)
  - **[Fixtures](./docs/pageObjectModel/fixtures.md)** - expose pages to tests + sessions integration
    - [Configuration](./docs/pageObjectModel/fixtures.md#configuration) | [Usage](./docs/pageObjectModel/fixtures.md#usage)
  - **[Advanced patterns](./docs/pageObjectModel/advancedPatterns.md)** - larger-project patterns and automation
    - [Auto cookie handling](./docs/pageObjectModel/advancedPatterns.md#automatic-cookie-handling-in-goto) | [Auto login](./docs/pageObjectModel/advancedPatterns.md#automatic-login-in-goto) | [Cookie injection](./docs/pageObjectModel/advancedPatterns.md#automatic-cookie-injection-in-goto)
    - [Different login flow](./docs/pageObjectModel/advancedPatterns.md#choosing-a-different-login-flow-sessionloginkey) | [Different API config](./docs/pageObjectModel/advancedPatterns.md#choosing-a-different-api-config-apiconfigkey) | [Basic Auth automation](./docs/pageObjectModel/advancedPatterns.md#basic-auth-automation) | [Multiple fixtures/domains](./docs/pageObjectModel/advancedPatterns.md#multiple-fixtures--multiple-domains)
    - [No POM (baseTest)](./docs/pageObjectModel/advancedPatterns.md#writing-tests-without-a-domain-pom-basetest)

### 🧪 Testing Features

- **[Accessibility](./docs/accessibility.md)** - Automated accessibility checks and audits
  - [Configuration](./docs/accessibility.md#configuration) | [Usage](./docs/accessibility.md#usage) | [Reports](./docs/accessibility.md#reports)
- **[Analytics](./docs/analytics.md)** - Capturing and asserting analytics events from data layers
  - [Configuration](./docs/analytics.md#configuration) | [Usage](./docs/analytics.md#usage) | [Dynamic values](./docs/analytics.md#dynamic-values) | [Debug output](./docs/analytics.md#debug-output)
- **[Performance Monitoring](./docs/performanceMonitoring.md)** - Run Lighthouse multiple times and aggregate results (median)
  - [Configuration](./docs/performanceMonitoring.md#configuration) | [Usage](./docs/performanceMonitoring.md#usage) | [Reports](./docs/performanceMonitoring.md#reports)
- **[Performance Test](./docs/performanceTest.md)** - Run Lighthouse and validate results against thresholds
  - [Configuration](./docs/performanceTest.md#configuration) | [Usage](./docs/performanceTest.md#usage) | [Reports](./docs/performanceTest.md#reports)
- **[Visual Testing](docs/visualTesting.md)** - Visual regression testing with Percy and Playwright
  - [Configuration](docs/visualTesting.md#configuration) | [Environment variables](docs/visualTesting.md#environment-variables) | [Usage](docs/visualTesting.md#usage) | [Advanced usage](docs/visualTesting.md#advanced-usage) | [Viewing results](docs/visualTesting.md#viewing-results)

### 🛠️ Test Utilities

- **[Assert No Console Errors](./docs/assertNoConsoleErrors.md)** - Validate that pages load without JavaScript console errors
  - [Configuration](./docs/assertNoConsoleErrors.md#configuration) | [Usage](./docs/assertNoConsoleErrors.md#usage)
- **[Link Check](./docs/linkCheck.md)** - Validate that pages have no broken links (Linkinator)
  - [Configuration](./docs/linkCheck.md#configuration) | [Usage](./docs/linkCheck.md#usage) | [Reports](./docs/linkCheck.md#reports)
- **[iFrames](./docs/iFrames.md)** - Working with embedded frames and nested browsing contexts
- **[Replace Text](./docs/replaceText.md)** - Modify text content in DOM elements for testing scenarios
  - [Usage](./docs/replaceText.md#usage)
- **[Security Headers](./docs/securityHeaders.md)** - Validate baseline security headers on responses
  - [Configuration](./docs/securityHeaders.md#configuration) | [Usage](./docs/securityHeaders.md#usage) | [Reports](./docs/securityHeaders.md#reports)
- **[Wait for Page Idle](./docs/waitForPageIdle.md)** - Waiting for page stability and AJAX completion
  - [Configuration](./docs/waitForPageIdle.md#configuration) | [Usage](./docs/waitForPageIdle.md#usage)

### 🌐 Working with HTTP requests

- **[Replace Intercept](./docs/replaceIntercept.md)** - Mock HTTP responses using JSON fixtures
  - [Configuration](./docs/replaceIntercept.md#configuration) | [Usage](./docs/replaceIntercept.md#usage) | [Dynamic values](./docs/replaceIntercept.md#dynamic-values) | [Status code change](./docs/replaceIntercept.md#status-code-change)
- **[Request Assertions](./docs/requestAssertions.md)** - Common patterns for validating HTTP requests in tests
- **[Wait for Intercept](./docs/waitForIntercept.md)** - Wait for specific HTTP requests during tests
  - [Configuration](./docs/waitForIntercept.md#configuration) | [Usage](./docs/waitForIntercept.md#usage)
