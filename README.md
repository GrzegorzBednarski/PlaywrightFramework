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
├── 📁 build/                      # Generated reports and artifacts (auto-created)
│   └── ... (reports)
├── 📁 config/                     # Utils configuration files
│   └── ... (config files)
├── 📁 .husky/                     # Husky Git hooks
│   └── pre-commit                 # Runs lint-staged and other checks before commit
├── 📁 docs/                       # Documentation files (feature & configuration docs)
│   └── ... (doc files)
├── 📁 utils/                      # Utility functions and helpers
│   └── ... (helper files)
├── .prettierrc                    # Prettier configuration
├── eslint.config.js               # ESLint configuration
├── global-setup.ts                # Pre-test setup (cleaning build folder)
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

### 🛠️ Test Utilities
- **[Replace Text](./docs/replaceText.md)** - Modify text content in DOM elements for testing scenarios
  - [Usage](./docs/replaceText.md#usage)
- **[Wait for Page Idle](./docs/waitForPageIdle.md)** - Waiting for page stability and AJAX completion
  - [Configuration](./docs/waitForPageIdle.md#configuration) | [Usage](./docs/waitForPageIdle.md#usage)
