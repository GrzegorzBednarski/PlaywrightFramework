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
├── 📁 docs/                       # Documentation files (feature & configuration docs)
│   └── ... (doc files)
├── .prettierrc                    # Prettier configuration
├── eslint.config.js               # ESLint configuration
├── README.md                      # Comprehensive documentation for all framework features
├── tsconfig.eslint.json           # TypeScript config used by ESLint
└── tsconfig.json                  # TypeScript configuration
```

## Configuration

### 🎨 Code Quality & Formatting
- **[ESLint](./docs/eslint.md)** - Code linting and static analysis
  - [Configuration](./docs/eslint.md#configuration) | [Usage](./docs/eslint.md#usage)
- **[Prettier](./docs/prettier.md)** - Code formatting and style enforcement
  - [Configuration](./docs/prettier.md#configuration) | [Usage](./docs/prettier.md#usage)
- **[TypeScript](./docs/typescript.md)** - Type checking and compiler settings
  - [Configuration](./docs/typescript.md#configuration)